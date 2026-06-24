<?php
/**
 * Dynamic Content Controller - WordPress-like Content Management
 */
class ContentController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all dynamic content
     */
    public function index()
    {
        // Don't strictly require authentication for GET, but check for filtering
        $isAdmin = AuthMiddleware::isAuthenticated();

        $group = $_GET['group'] ?? '';

        $where = $isAdmin ? '1=1' : 'is_active = 1';
        $params = [];

        if (!empty($group)) {
            $where .= " AND content_group = :group";
            $params[':group'] = $group;
        }

        $stmt = $this->db->prepare("
            SELECT * FROM dynamic_content 
            WHERE {$where} 
            ORDER BY content_group, content_key
        ");

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $content = $stmt->fetchAll();

        // Fix image paths
        foreach ($content as &$item) {
            if ($item['content_type'] === 'image' && !empty($item['content_value'])) {
                if (!filter_var($item['content_value'], FILTER_VALIDATE_URL)) {
                    $item['content_value'] = FileUpload::getUrl($item['content_value']);
                }
            }
        }

        Response::success($content);
    }

    /**
     * Get single content by key (Public API)
     */
    public function show($key)
    {
        $stmt = $this->db->prepare("SELECT * FROM dynamic_content WHERE content_key = :key AND is_active = 1");
        $stmt->bindParam(':key', $key);
        $stmt->execute();

        $content = $stmt->fetch();

        if (!$content) {
            Response::success(null, 'Content not found');
            return;
        }

        // Fix image paths for common content types
        if ($content['content_key'] === 'homepage_slider') {
            $slides = json_decode($content['content_value'], true);
            if (is_array($slides)) {
                foreach ($slides as &$slide) {
                    if (isset($slide['image']) && !empty($slide['image'])) {
                        if (!filter_var($slide['image'], FILTER_VALIDATE_URL)) {
                            $slide['image'] = FileUpload::getUrl($slide['image']);
                        }
                    }
                }
                $content['content_value'] = json_encode($slides);
            }
        } elseif ($content['content_type'] === 'image' && !empty($content['content_value'])) {
            if (!filter_var($content['content_value'], FILTER_VALIDATE_URL)) {
                $content['content_value'] = FileUpload::getUrl($content['content_value']);
            }
        }

        Response::success($content);
    }

    /**
     * Get multiple content items by group (Public API)
     */
    public function getByGroup($group)
    {
        $stmt = $this->db->prepare("SELECT * FROM dynamic_content WHERE content_group = :group AND is_active = 1");
        $stmt->bindParam(':group', $group);
        $stmt->execute();
        $content = $stmt->fetchAll();

        // Fix image paths for common content types
        foreach ($content as &$item) {
            if ($item['content_key'] === 'homepage_slider') {
                $slides = json_decode($item['content_value'], true);
                if (is_array($slides)) {
                    foreach ($slides as &$slide) {
                        if (isset($slide['image']) && !empty($slide['image'])) {
                            if (!filter_var($slide['image'], FILTER_VALIDATE_URL)) {
                                $slide['image'] = FileUpload::getUrl($slide['image']);
                            }
                        }
                    }
                    $item['content_value'] = json_encode($slides);
                }
            } elseif ($item['content_type'] === 'image' && !empty($item['content_value'])) {
                if (!filter_var($item['content_value'], FILTER_VALIDATE_URL)) {
                    $item['content_value'] = FileUpload::getUrl($item['content_value']);
                }
            }
        }

        Response::success($content);
    }

    /**
     * Create or update content
     */
    public function upsert()
    {
        $user = AuthMiddleware::authenticate();
        $data = $_POST;

        // For non-multipart requests (like JSON), read from raw input
        if (empty($data) || $_SERVER['CONTENT_TYPE'] === 'application/json') {
            $input = json_decode(file_get_contents("php://input"), true);
            if ($input) {
                $data = array_merge($data, $input);
            }
        }

        // Validate
        $validator = new Validator($data);
        $validator->required('content_key')
            ->required('content_type');

        // content_value is required unless we're uploading an image file
        $isImageUpload = ($data['content_type'] === 'image' && isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK);
        if (!$isImageUpload) {
            $validator->required('content_value');
        }

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            // Handle image upload for image type
            if ($data['content_type'] === 'image' && isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
                $data['content_value'] = FileUpload::upload($_FILES['file'], 'content');
            } else if ($data['content_type'] === 'image' && !empty($data['content_value'])) {
                // If it's an image but no new file uploaded, normalize the existing URL/Path
                $image = $data['content_value'];
                $search = '/uploads/';
                $pos = strpos($image, $search);
                if ($pos !== false) {
                    $data['content_value'] = substr($image, $pos + strlen($search));
                }
            }

            // Check if content exists
            $stmt = $this->db->prepare("SELECT id FROM dynamic_content WHERE content_key = :key");
            $stmt->bindParam(':key', $data['content_key']);
            $stmt->execute();

            $exists = $stmt->fetch();

            if ($exists) {
                // Update
                $stmt = $this->db->prepare("
                    UPDATE dynamic_content SET 
                        content_type = :type,
                        content_value = :value,
                        content_group = :group,
                        description = :description,
                        is_active = :is_active
                    WHERE content_key = :key
                ");

                $stmt->bindValue(':key', $data['content_key']);
                $stmt->bindValue(':type', $data['content_type']);
                $stmt->bindValue(':value', $data['content_value']);
                $stmt->bindValue(':group', $data['content_group'] ?? null);
                $stmt->bindValue(':description', $data['description'] ?? null);
                $stmt->bindValue(':is_active', (int) ($data['is_active'] ?? 1), PDO::PARAM_INT);

                $stmt->execute();

                $this->logActivity($user['id'], 'update_content', 'dynamic_content', $exists['id']);

                Response::success(['content_key' => $data['content_key']], 'Content updated successfully');

            } else {
                // Insert
                $stmt = $this->db->prepare("
                    INSERT INTO dynamic_content (content_key, content_type, content_value, content_group, description, is_active) 
                    VALUES (:key, :type, :value, :group, :description, :is_active)
                ");

                $stmt->bindValue(':key', $data['content_key']);
                $stmt->bindValue(':type', $data['content_type']);
                $stmt->bindValue(':value', $data['content_value']);
                $stmt->bindValue(':group', $data['content_group'] ?? null);
                $stmt->bindValue(':description', $data['description'] ?? null);
                $stmt->bindValue(':is_active', (int) ($data['is_active'] ?? 1), PDO::PARAM_INT);

                $stmt->execute();
                $id = $this->db->lastInsertId();

                $this->logActivity($user['id'], 'create_content', 'dynamic_content', $id);

                Response::success(['id' => $id, 'content_key' => $data['content_key']], 'Content created successfully', 201);
            }

        } catch (Exception $e) {
            Response::serverError('Failed to save content: ' . $e->getMessage());
        }
    }

    /**
     * Delete content
     */
    public function delete($key)
    {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("DELETE FROM dynamic_content WHERE content_key = :key");
        $stmt->bindParam(':key', $key);

        if (!$stmt->execute() || $stmt->rowCount() === 0) {
            Response::notFound('Content not found');
        }

        $this->logActivity($user['id'], 'delete_content', 'dynamic_content', null, ['key' => $key]);

        Response::success(null, 'Content deleted successfully');
    }

    /**
     * Helper: Log activity
     */
    private function logActivity($userId, $action, $entityType = null, $entityId = null, $details = null)
    {
        $stmt = $this->db->prepare("
            INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) 
            VALUES (:user_id, :action, :entity_type, :entity_id, :details, :ip, :user_agent)
        ");

        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        $detailsJson = $details ? json_encode($details) : null;

        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':action', $action);
        $stmt->bindParam(':entity_type', $entityType);
        $stmt->bindParam(':entity_id', $entityId);
        $stmt->bindParam(':details', $detailsJson);
        $stmt->bindParam(':ip', $ip);
        $stmt->bindParam(':user_agent', $userAgent);

        $stmt->execute();
    }
}
