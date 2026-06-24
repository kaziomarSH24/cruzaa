<?php
/**
 * Navigation Controller - Dynamic Menu Management
 */
class NavigationController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all navigation items (hierarchical)
     */
    public function index()
    {
        $location = $_GET['location'] ?? '';

        $where = '1=1';
        $params = [];

        if (!empty($location)) {
            $where = "menu_location = :location";
            $params[':location'] = $location;
        }

        $stmt = $this->db->prepare("
            SELECT * FROM navigation_menu 
            WHERE {$where} AND is_active = 1 
            ORDER BY sort_order ASC
        ");

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $items = $stmt->fetchAll();

        // Build hierarchical tree
        $tree = $this->buildTree($items);

        Response::success($tree);
    }

    /**
     * Get all navigation items for admin (including inactive)
     */
    public function adminIndex()
    {
        AuthMiddleware::authenticate();

        $location = $_GET['location'] ?? '';

        $where = '1=1';
        $params = [];

        if (!empty($location)) {
            $where = "menu_location = :location";
            $params[':location'] = $location;
        }

        $stmt = $this->db->prepare("
            SELECT * FROM navigation_menu 
            WHERE {$where} 
            ORDER BY sort_order ASC
        ");

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $items = $stmt->fetchAll();

        // Build hierarchical tree
        $tree = $this->buildTree($items);

        Response::success($tree);
    }

    /**
     * Get single navigation item
     */
    public function show($id)
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT * FROM navigation_menu WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $item = $stmt->fetch();

        if (!$item) {
            Response::notFound('Navigation item not found');
        }

        Response::success($item);
    }

    /**
     * Create navigation item
     */
    public function create()
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate
        $validator = new Validator($data);
        $validator->required('title')
            ->required('menu_location');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO navigation_menu (title, url, target, parent_id, menu_location, sort_order, icon, css_class, is_active) 
                VALUES (:title, :url, :target, :parent_id, :menu_location, :sort_order, :icon, :css_class, :is_active)
            ");

            $stmt->bindValue(':title', $data['title']);
            $stmt->bindValue(':url', $data['url'] ?? null);
            $stmt->bindValue(':target', $data['target'] ?? '_self');
            $stmt->bindValue(':parent_id', $data['parent_id'] ?? null);
            $stmt->bindValue(':menu_location', $data['menu_location']);
            $stmt->bindValue(':sort_order', (int) ($data['sort_order'] ?? 0), PDO::PARAM_INT);
            $stmt->bindValue(':icon', $data['icon'] ?? null);
            $stmt->bindValue(':css_class', $data['css_class'] ?? null);
            $stmt->bindValue(':is_active', (int) ($data['is_active'] ?? 1), PDO::PARAM_INT);

            $stmt->execute();
            $id = $this->db->lastInsertId();

            // Log activity
            $this->logActivity($user['id'], 'create_navigation', 'navigation_menu', $id);

            Response::success(['id' => $id], 'Navigation item created successfully', 201);

        } catch (Exception $e) {
            Response::serverError('Failed to create navigation item: ' . $e->getMessage());
        }
    }

    /**
     * Update navigation item
     */
    public function update($id)
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        $stmt = $this->db->prepare("SELECT * FROM navigation_menu WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if (!$stmt->fetch()) {
            Response::notFound('Navigation item not found');
        }

        // Validate
        $validator = new Validator($data);
        $validator->required('title')
            ->required('menu_location');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $stmt = $this->db->prepare("
                UPDATE navigation_menu SET 
                    title = :title, url = :url, target = :target, parent_id = :parent_id,
                    menu_location = :menu_location, sort_order = :sort_order,
                    icon = :icon, css_class = :css_class, is_active = :is_active
                WHERE id = :id
            ");

            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':title', $data['title']);
            $stmt->bindValue(':url', $data['url'] ?? null);
            $stmt->bindValue(':target', $data['target'] ?? '_self');
            $stmt->bindValue(':parent_id', $data['parent_id'] ?? null);
            $stmt->bindValue(':menu_location', $data['menu_location']);
            $stmt->bindValue(':sort_order', $data['sort_order'] ?? 0);
            $stmt->bindValue(':icon', $data['icon'] ?? null);
            $stmt->bindValue(':css_class', $data['css_class'] ?? null);
            $stmt->bindValue(':is_active', $data['is_active'] ?? 1);

            $stmt->execute();

            // Log activity
            $this->logActivity($user['id'], 'update_navigation', 'navigation_menu', $id);

            Response::success(['id' => $id], 'Navigation item updated successfully');

        } catch (Exception $e) {
            Response::serverError('Failed to update navigation item: ' . $e->getMessage());
        }
    }

    /**
     * Delete navigation item
     */
    public function delete($id)
    {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("DELETE FROM navigation_menu WHERE id = :id");
        $stmt->bindParam(':id', $id);

        if (!$stmt->execute() || $stmt->rowCount() === 0) {
            Response::notFound('Navigation item not found');
        }

        // Log activity
        $this->logActivity($user['id'], 'delete_navigation', 'navigation_menu', $id);

        Response::success(null, 'Navigation item deleted successfully');
    }

    /**
     * Helper: Build hierarchical tree
     */
    private function buildTree($elements, $parentId = null)
    {
        $branch = [];

        foreach ($elements as $element) {
            if ($element['parent_id'] == $parentId) {
                $children = $this->buildTree($elements, $element['id']);

                if ($children) {
                    $element['children'] = $children;
                }

                $branch[] = $element;
            }
        }

        return $branch;
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
