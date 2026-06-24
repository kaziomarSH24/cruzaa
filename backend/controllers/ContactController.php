<?php
/**
 * Contact Controller - Handle Contact Form Submissions
 */
class ContactController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all contact submissions with pagination
     */
    public function index()
    {
        AuthMiddleware::authenticate();

        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? min((int) $_GET['limit'], MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
        $offset = ($page - 1) * $limit;

        $status = $_GET['status'] ?? '';
        $isRead = $_GET['is_read'] ?? '';
        $search = $_GET['search'] ?? '';

        $where = ['1=1'];
        $params = [];

        if ($status !== '') {
            $where[] = "status = :status";
            $params[':status'] = $status;
        }

        if ($isRead !== '') {
            $where[] = "is_read = :is_read";
            $params[':is_read'] = $isRead;
        }

        if (!empty($search)) {
            $where[] = "(name LIKE :search OR email LIKE :search OR subject LIKE :search OR message LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        $whereClause = implode(' AND ', $where);

        // Get total count
        $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM contact_submissions WHERE {$whereClause}");
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        $countStmt->execute();
        $total = $countStmt->fetch()['total'];

        // Get submissions
        $stmt = $this->db->prepare("
            SELECT * FROM contact_submissions 
            WHERE {$whereClause} 
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset
        ");

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $submissions = $stmt->fetchAll();

        Response::success([
            'submissions' => $submissions,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => (int) $total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * Get single submission
     */
    public function show($id)
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT * FROM contact_submissions WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $submission = $stmt->fetch();

        if (!$submission) {
            Response::notFound('Submission not found');
        }

        // Mark as read
        $updateStmt = $this->db->prepare("UPDATE contact_submissions SET is_read = 1 WHERE id = :id");
        $updateStmt->bindParam(':id', $id);
        $updateStmt->execute();

        Response::success($submission);
    }

    /**
     * Submit contact form (Public API - No Auth)
     */
    public function submit()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate
        $validator = new Validator($data);
        $validator->required('name')
            ->required('email')->email('email')
            ->required('message');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO contact_submissions (name, email, phone, subject, message, ip_address, user_agent) 
                VALUES (:name, :email, :phone, :subject, :message, :ip, :user_agent)
            ");

            $ip = $_SERVER['REMOTE_ADDR'] ?? null;
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':phone', $data['phone']);
            $stmt->bindParam(':subject', $data['subject']);
            $stmt->bindParam(':message', $data['message']);
            $stmt->bindParam(':ip', $ip);
            $stmt->bindParam(':user_agent', $userAgent);

            $stmt->execute();

            // TODO: Send email notification to admin

            Response::success(null, 'Thank you for contacting us! We will get back to you soon.', 201);

        } catch (Exception $e) {
            Response::serverError('Failed to submit contact form: ' . $e->getMessage());
        }
    }

    /**
     * Update submission status
     */
    public function updateStatus($id)
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $this->db->prepare("SELECT * FROM contact_submissions WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if (!$stmt->fetch()) {
            Response::notFound('Submission not found');
        }

        try {
            $stmt = $this->db->prepare("
                UPDATE contact_submissions SET 
                    status = :status,
                    is_replied = :is_replied,
                    notes = :notes
                WHERE id = :id
            ");

            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':is_replied', $data['is_replied'] ?? 0);
            $stmt->bindParam(':notes', $data['notes']);

            $stmt->execute();

            // Log activity
            $this->logActivity($user['id'], 'update_contact_status', 'contact_submissions', $id);

            Response::success(null, 'Status updated successfully');

        } catch (Exception $e) {
            Response::serverError('Failed to update status: ' . $e->getMessage());
        }
    }

    /**
     * Delete submission
     */
    public function delete($id)
    {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("DELETE FROM contact_submissions WHERE id = :id");
        $stmt->bindParam(':id', $id);

        if (!$stmt->execute()) {
            Response::notFound('Submission not found');
        }

        // Log activity
        $this->logActivity($user['id'], 'delete_contact', 'contact_submissions', $id);

        Response::success(null, 'Submission deleted successfully');
    }

    /**
     * Helper: Log activity
     */
    private function logActivity($userId, $action, $entityType = null, $entityId = null)
    {
        $stmt = $this->db->prepare("
            INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address, user_agent) 
            VALUES (:user_id, :action, :entity_type, :entity_id, :ip, :user_agent)
        ");

        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':action', $action);
        $stmt->bindParam(':entity_type', $entityType);
        $stmt->bindParam(':entity_id', $entityId);
        $stmt->bindParam(':ip', $ip);
        $stmt->bindParam(':user_agent', $userAgent);

        $stmt->execute();
    }
}
