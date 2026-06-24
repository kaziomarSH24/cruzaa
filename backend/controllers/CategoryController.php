<?php
/**
 * Category Controller - Categories and Sub-categories
 */
class CategoryController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all categories (hierarchical tree)
     */
    public function index()
    {
        // Auth omitted for public access

        $showInactive = isset($_GET['show_inactive']) && $_GET['show_inactive'] === '1' && AuthMiddleware::isAuthenticated();

        $where = $showInactive ? "" : "WHERE is_active = 1";

        $stmt = $this->db->query("
            SELECT * FROM categories {$where} ORDER BY sort_order ASC, name ASC
        ");

        $categories = $stmt->fetchAll();

        // Build hierarchical tree
        $tree = $this->buildTree($categories);

        Response::success($tree);
    }

    /**
     * Get single category
     */
    public function show($id)
    {
        // Auth omitted for public access

        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $category = $stmt->fetch();

        if (!$category) {
            Response::notFound('Category not found');
        }

        // Get subcategories
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE parent_id = :parent_id ORDER BY sort_order");
        $stmt->bindParam(':parent_id', $id);
        $stmt->execute();
        $category['subcategories'] = $stmt->fetchAll();

        // Get parent if exists
        if ($category['parent_id']) {
            $stmt = $this->db->prepare("SELECT id, name, slug FROM categories WHERE id = :id");
            $stmt->bindParam(':id', $category['parent_id']);
            $stmt->execute();
            $category['parent'] = $stmt->fetch();
        }

        $category['image_url'] = FileUpload::getUrl($category['image']);

        Response::success($category);
    }

    /**
     * Create new category
     */
    public function create()
    {
        $user = AuthMiddleware::authenticate();
        $data = $_POST;

        // Validate
        $validator = new Validator($data);
        $validator->required('name')
            ->required('slug')
            ->unique('slug', 'categories', 'slug');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            // Handle image upload
            $image = null;
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $image = FileUpload::upload($_FILES['image'], 'categories');
            }

            // Insert category
            $stmt = $this->db->prepare("
                INSERT INTO categories (
                    name, slug, description, parent_id, image, sort_order, is_active, show_on_home,
                    seo_title, seo_description, seo_keywords
                ) VALUES (
                    :name, :slug, :description, :parent_id, :image, :sort_order, :is_active, :show_on_home,
                    :seo_title, :seo_description, :seo_keywords
                )
            ");

            $stmt->bindValue(':name', $data['name']);
            $stmt->bindValue(':slug', $data['slug']);
            $stmt->bindValue(':description', $data['description'] ?? null);
            $stmt->bindValue(':parent_id', $data['parent_id'] ?? null);
            $stmt->bindValue(':image', $image);
            $stmt->bindValue(':sort_order', (int) ($data['sort_order'] ?? 0), PDO::PARAM_INT);
            $stmt->bindValue(':is_active', (int) ($data['is_active'] ?? 1), PDO::PARAM_INT);
            $stmt->bindValue(':show_on_home', (int) ($data['show_on_home'] ?? 0), PDO::PARAM_INT);
            $stmt->bindValue(':seo_title', $data['seo_title'] ?? null);
            $stmt->bindValue(':seo_description', $data['seo_description'] ?? null);
            $stmt->bindValue(':seo_keywords', $data['seo_keywords'] ?? null);

            $stmt->execute();
            $categoryId = $this->db->lastInsertId();

            // Log activity
            $this->logActivity($user['id'], 'create_category', 'categories', $categoryId);

            Response::success(['id' => $categoryId], 'Category created successfully', 201);

        } catch (Exception $e) {
            Response::serverError('Failed to create category: ' . $e->getMessage());
        }
    }

    /**
     * Update category
     */
    public function update($id)
    {
        $user = AuthMiddleware::authenticate();
        $data = $_POST;

        // For PUT requests, if it's not multipart, read from raw input
        if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $input = json_decode(file_get_contents("php://input"), true);
            if ($input) {
                $data = array_merge($data, $input);
            }
        }

        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $category = $stmt->fetch();

        if (!$category) {
            Response::notFound('Category not found');
        }

        // Validate circular reference
        if (isset($data['parent_id']) && $data['parent_id']) {
            if ($this->isCircularReference($id, $data['parent_id'])) {
                Response::error('Cannot set category as its own subcategory', 400);
            }
        }

        // Validate
        $validator = new Validator($data);
        $validator->required('name')
            ->required('slug')
            ->unique('slug', 'categories', 'slug', $id);

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            // Handle image upload
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                // Delete old image
                if ($category['image']) {
                    FileUpload::delete($category['image']);
                }
                $data['image'] = FileUpload::upload($_FILES['image'], 'categories');
            }

            // Update category
            $stmt = $this->db->prepare("
                UPDATE categories SET 
                    name = :name, slug = :slug, description = :description, parent_id = :parent_id,
                    " . (isset($data['image']) ? "image = :image," : "") . "
                    sort_order = :sort_order, is_active = :is_active, show_on_home = :show_on_home,
                    seo_title = :seo_title, seo_description = :seo_description, seo_keywords = :seo_keywords
                WHERE id = :id
            ");

            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':name', $data['name']);
            $stmt->bindValue(':slug', $data['slug']);
            $stmt->bindValue(':description', $data['description'] ?? null);
            $stmt->bindValue(':parent_id', $data['parent_id'] ?? null);

            if (isset($data['image'])) {
                $stmt->bindValue(':image', $data['image']);
            }

            $stmt->bindValue(':sort_order', (int) ($data['sort_order'] ?? 0), PDO::PARAM_INT);
            $stmt->bindValue(':is_active', (int) ($data['is_active'] ?? 1), PDO::PARAM_INT);
            $stmt->bindValue(':show_on_home', (int) ($data['show_on_home'] ?? 0), PDO::PARAM_INT);
            $stmt->bindValue(':seo_title', $data['seo_title'] ?? null);
            $stmt->bindValue(':seo_description', $data['seo_description'] ?? null);
            $stmt->bindValue(':seo_keywords', $data['seo_keywords'] ?? null);

            $stmt->execute();

            // Log activity
            $this->logActivity($user['id'], 'update_category', 'categories', $id);

            Response::success(['id' => $id], 'Category updated successfully');

        } catch (Exception $e) {
            Response::serverError('Failed to update category: ' . $e->getMessage());
        }
    }

    /**
     * Delete category
     */
    public function delete($id)
    {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT * FROM categories WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $category = $stmt->fetch();

        if (!$category) {
            Response::notFound('Category not found');
        }

        // Check if category has subcategories
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM categories WHERE parent_id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if ($stmt->fetch()['count'] > 0) {
            Response::error('Cannot delete category with subcategories. Delete or reassign subcategories first.', 400);
        }

        try {
            // Delete image
            if ($category['image']) {
                FileUpload::delete($category['image']);
            }

            // Delete category
            $stmt = $this->db->prepare("DELETE FROM categories WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            // Log activity
            $this->logActivity($user['id'], 'delete_category', 'categories', $id);

            Response::success(null, 'Category deleted successfully');

        } catch (Exception $e) {
            Response::serverError('Failed to delete category: ' . $e->getMessage());
        }
    }

    /**
     * Helper: Build hierarchical tree
     */
    private function buildTree($elements, $parentId = null)
    {
        $branch = [];

        foreach ($elements as $element) {
            if ($element['parent_id'] == $parentId) {
                $element['image_url'] = FileUpload::getUrl($element['image']);
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
     * Helper: Check circular reference
     */
    private function isCircularReference($categoryId, $parentId)
    {
        if ($categoryId == $parentId) {
            return true;
        }

        $stmt = $this->db->prepare("SELECT parent_id FROM categories WHERE id = :id");
        $stmt->bindParam(':id', $parentId);
        $stmt->execute();

        $parent = $stmt->fetch();

        if (!$parent || !$parent['parent_id']) {
            return false;
        }

        return $this->isCircularReference($categoryId, $parent['parent_id']);
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
