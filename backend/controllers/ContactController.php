<?php
require_once __DIR__ . '/../utils/MailHelper.php';

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

            // Send email notification to admin
            $to = "hi@cruzaa.com";

            // Set the email subject securely
            $emailSubject = "New Contact Form Submission: " . htmlspecialchars($data['subject']);

            // Extract and sanitize form data to prevent XSS
            $senderName = htmlspecialchars($data['name']);
            $senderEmail = htmlspecialchars($data['email']);
            $senderMessage = htmlspecialchars($data['message']);

            // Avatar initials
            $nameParts = explode(' ', trim($senderName));
            $initials = strtoupper(substr($nameParts[0], 0, 1));
            if (count($nameParts) > 1) {
                $initials .= strtoupper(substr(end($nameParts), 0, 1));
            }

            $emailBody = <<<HTML
<div style="margin:0;padding:40px 16px;background-color:#f3f4f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td style="background:#E8191A;padding:32px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:3px;">CRUZAA</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.75);letter-spacing:2px;text-transform:uppercase;margin-top:6px;">E-Commerce Platform</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <!-- Badge -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#FEE2E2;border-radius:20px;padding:5px 14px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:8px;height:8px;background:#E8191A;border-radius:50%;font-size:0;">&nbsp;</td>
                        <td style="padding-left:6px;font-size:12px;font-weight:600;color:#991B1B;white-space:nowrap;">New contact form submission</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <div style="font-size:22px;font-weight:600;color:#111827;margin-bottom:10px;">Hello, Admin &#x1F44B;</div>
              <p style="font-size:14px;color:#6b7280;line-height:1.7;margin:0 0 28px 0;">You've received a new message through the contact form on your website. Here's what was submitted:</p>

              <!-- Sender Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Avatar -->
                        <td style="width:48px;height:48px;">
                          <div style="width:48px;height:48px;background:#E8191A;border-radius:50%;text-align:center;line-height:48px;font-size:18px;font-weight:700;color:#ffffff;">{$initials}</div>
                        </td>
                        <!-- Name & Email -->
                        <td style="padding-left:16px;">
                          <div style="font-size:15px;font-weight:600;color:#111827;margin-bottom:4px;">{$senderName}</div>
                          <a href="mailto:{$senderEmail}" style="font-size:13px;color:#E8191A;text-decoration:none;">{$senderEmail}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <!-- Message Header -->
                <tr>
                  <td style="background:#f9fafb;padding:14px 24px;border-bottom:1px solid #e5e7eb;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:8px;height:8px;background:#E8191A;border-radius:50%;font-size:0;">&nbsp;</td>
                        <td style="padding-left:8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Message</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Message Content -->
                <tr>
                  <td style="padding:24px;font-size:14px;line-height:1.8;color:#4b5563;white-space:pre-wrap;background:#ffffff;">{$senderMessage}</td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="font-size:12px;color:#9ca3af;line-height:1.6;margin:0;">
                <strong style="color:#6b7280;">&copy; Cruzaa E-Commerce</strong><br>
                This is an automated notification &mdash; please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>
HTML;

            // Call the utility function to send the email
            // Ensure $this->sendSmtpEmail or sendSmtpEmail is called correctly based on your class structure
            $isSent = sendSmtpEmail($this->db, $to, $emailSubject, $emailBody);

            if (!$isSent) {
                // Log error if email fails to send
                error_log("Contact form saved, but HTML email notification failed to send.");
            }

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
