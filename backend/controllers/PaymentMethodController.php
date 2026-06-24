<?php
/**
 * Payment Methods Controller
 */
class PaymentMethodController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all payment methods
     */
    public function index()
    {
        $showInactive = isset($_GET['show_inactive']) && $_GET['show_inactive'] === '1';

        $where = $showInactive ? "" : "WHERE is_active = 1";

        $stmt = $this->db->query("
            SELECT * FROM payment_methods {$where} ORDER BY sort_order ASC
        ");

        $methods = $stmt->fetchAll();

        // Decode JSON config
        foreach ($methods as &$method) {
            if ($method['config']) {
                $method['config'] = json_decode($method['config'], true);
            }
        }

        Response::success($methods);
    }

    /**
     * Get single payment method
     */
    public function show($id)
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT * FROM payment_methods WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $method = $stmt->fetch();

        if (!$method) {
            Response::notFound('Payment method not found');
        }

        if ($method['config']) {
            $method['config'] = json_decode($method['config'], true);
        }

        Response::success($method);
    }

    /**
     * Create payment method
     */
    public function create()
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate
        $validator = new Validator($data);
        $validator->required('name')
            ->required('code')
            ->unique('code', 'payment_methods', 'code');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $config = isset($data['config']) ? json_encode($data['config']) : null;

            $stmt = $this->db->prepare("
                INSERT INTO payment_methods (name, code, description, config, is_active, sort_order) 
                VALUES (:name, :code, :description, :config, :is_active, :sort_order)
            ");

            $stmt->bindValue(':name', $data['name']);
            $stmt->bindValue(':code', $data['code']);
            $stmt->bindValue(':description', $data['description'] ?? null);
            $stmt->bindValue(':config', $config);
            $stmt->bindValue(':is_active', $data['is_active'] ?? 1);
            $stmt->bindValue(':sort_order', $data['sort_order'] ?? 0);

            $stmt->execute();
            $id = $this->db->lastInsertId();

            // Log activity
            $this->logActivity($user['id'], 'create_payment_method', 'payment_methods', $id);

            Response::success(['id' => $id], 'Payment method created successfully', 201);

        } catch (Exception $e) {
            Response::serverError('Failed to create payment method: ' . $e->getMessage());
        }
    }

    /**
     * Update payment method
     */
    public function update($id)
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $this->db->prepare("SELECT * FROM payment_methods WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if (!$stmt->fetch()) {
            Response::notFound('Payment method not found');
        }

        // Validate
        $validator = new Validator($data);
        $validator->required('name')
            ->required('code')
            ->unique('code', 'payment_methods', 'code', $id);

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $config = isset($data['config']) ? json_encode($data['config']) : null;

            $stmt = $this->db->prepare("
                UPDATE payment_methods SET 
                    name = :name, code = :code, description = :description,
                    config = :config, is_active = :is_active, sort_order = :sort_order
                WHERE id = :id
            ");

            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':name', $data['name']);
            $stmt->bindValue(':code', $data['code']);
            $stmt->bindValue(':description', $data['description'] ?? null);
            $stmt->bindValue(':config', $config);
            $stmt->bindValue(':is_active', (int) ($data['is_active'] ?? 1), PDO::PARAM_INT);
            $stmt->bindValue(':sort_order', (int) ($data['sort_order'] ?? 0), PDO::PARAM_INT);

            $stmt->execute();

            // Log activity
            $this->logActivity($user['id'], 'update_payment_method', 'payment_methods', $id);

            Response::success(['id' => $id], 'Payment method updated successfully');

        } catch (Exception $e) {
            Response::serverError('Failed to update payment method: ' . $e->getMessage());
        }
    }

    /**
     * Delete payment method
     */
    public function delete($id)
    {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("DELETE FROM payment_methods WHERE id = :id");
        $stmt->bindParam(':id', $id);

        if (!$stmt->execute() || $stmt->rowCount() === 0) {
            Response::notFound('Payment method not found');
        }

        // Log activity
        $this->logActivity($user['id'], 'delete_payment_method', 'payment_methods', $id);

        Response::success(null, 'Payment method deleted successfully');
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
