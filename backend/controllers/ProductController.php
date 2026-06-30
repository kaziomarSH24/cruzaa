<?php

/**
 * Product Controller - Complete CRUD
 */
class ProductController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all products with pagination and filters
     */
    public function index()
    {
        // Auth omitted for public access

        $page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? min((int) $_GET['limit'], MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
        $offset = ($page - 1) * $limit;

        $search = $_GET['search'] ?? '';
        $categoryId = $_GET['category_id'] ?? '';
        $categorySlug = $_GET['category_slug'] ?? '';
        $status = $_GET['status'] ?? '';
        $featured = $_GET['featured'] ?? '';

        $where = ['1=1'];
        $params = [];

        if (!empty($search)) {
            $where[] = "(p.name LIKE :search OR p.sku LIKE :search OR p.description LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        if ($categoryId !== '' && $categoryId !== null) {
            $where[] = "p.category_id = :category_id";
            $params[':category_id'] = $categoryId;
        }

        if ($categorySlug !== '' && $categorySlug !== null) {
            $where[] = "c.slug = :category_slug";
            $params[':category_slug'] = $categorySlug;
        }

        if ($status !== '' && $status !== 'all') {
            $where[] = "p.is_active = :is_active";
            $params[':is_active'] = ($status === 'active' || $status === '1' ? 1 : 0);
        } else if (!AuthMiddleware::isAuthenticated()) {
            // Public only see active by default
            $where[] = "p.is_active = 1";
        }

        if ($featured !== '' && $featured !== 'all') {
            $where[] = "p.is_featured = :is_featured";
            $params[':is_featured'] = ($featured === 'featured' || $featured === '1' ? 1 : 0);
        }

        $stockStatus = $_GET['stock_status'] ?? '';
        if ($stockStatus === 'in_stock') {
            $where[] = "p.stock_quantity > 0";
        } else if ($stockStatus === 'out_of_stock') {
            $where[] = "p.stock_quantity = 0";
        } else if ($stockStatus === 'low_stock') {
            $where[] = "p.stock_quantity <= p.low_stock_threshold AND p.stock_quantity > 0";
        }

        $whereClause = implode(' AND ', $where);

        // Get total count
        $countStmt = $this->db->prepare("
            SELECT COUNT(*) as total 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE {$whereClause}
        ");
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        $countStmt->execute();
        $total = $countStmt->fetch()['total'];

        // Get products
        $stmt = $this->db->prepare("
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE {$whereClause} 
            ORDER BY p.created_at DESC 
            LIMIT :limit OFFSET :offset
        ");

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $products = $stmt->fetchAll();

        // Add images to products
        foreach ($products as &$product) {
            $product['images'] = $this->getProductImages($product['id']);
            $product['featured_image_url'] = FileUpload::getUrl($product['featured_image']);
            $product['specs'] = $product['specs'] ? json_decode($product['specs'], true) : [];
            $product['colors'] = $product['colors'] ? json_decode($product['colors'], true) : [];
        }

        Response::success([
            'products' => $products,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => (int) $total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * Get single product
     */
    public function show($id)
    {
        // Auth omitted for public access

        $isNumeric = is_numeric($id);
        $where = $isNumeric ? "p.id = :id" : "p.slug = :id";

        $stmt = $this->db->prepare("
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE {$where}
        ");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $product = $stmt->fetch();

        if (!$product) {
            Response::notFound('Product not found');
            return;
        }

        // Always use the numeric product ID for related lookups
        $productId = $product['id'];
        $product['images'] = $this->getProductImages($productId);
        $product['featured_image_url'] = FileUpload::getUrl($product['featured_image']);
        $product['specs'] = $product['specs'] ? json_decode($product['specs'], true) : [];
        $product['colors'] = $product['colors'] ? json_decode($product['colors'], true) : [];
        $product['features'] = $product['features'] ?? [];

        Response::success($product);
    }

    /**
     * Create new product
     */
    public function create()
    {
        $user = AuthMiddleware::authenticate();
        $data = $_POST;

        // Validate required fields
        $validator = new Validator($data);
        $validator->required('name')
            ->required('slug')
            ->unique('slug', 'products', 'slug')
            ->required('price')
            ->numeric('price');

        if (isset($data['sku']) && !empty($data['sku'])) {
            $validator->unique('sku', 'products', 'sku');
        }

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $this->db->beginTransaction();

            // Handle featured image upload
            $featuredImage = null;
            if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
                $featuredImage = FileUpload::upload($_FILES['featured_image'], 'products');
            } else if (isset($data['featured_image']) && strpos($data['featured_image'], 'http') === 0) {
                $featuredImage = preg_replace('/https?:\/\/[^\/]+\/.*uploads\//i', '', $data['featured_image']);
            }

            // Insert product
            $stmt = $this->db->prepare("
                INSERT INTO products (
                    name, slug, sku, description, short_description, category_id, 
                    price, sale_price, cost_price, stock_quantity, low_stock_threshold,
                    manage_stock, stock_status, featured_image, is_featured, is_active,
                    weight, dimensions, specs, colors, seo_title, seo_description, seo_keywords
                ) VALUES (
                    :name, :slug, :sku, :description, :short_description, :category_id,
                    :price, :sale_price, :cost_price, :stock_quantity, :low_stock_threshold,
                    :manage_stock, :stock_status, :featured_image, :is_featured, :is_active,
                    :weight, :dimensions, :specs, :colors, :seo_title, :seo_description, :seo_keywords
                )
            ");

            $stmt->bindValue(':name', $data['name']);
            $stmt->bindValue(':slug', $data['slug']);
            $stmt->bindValue(':sku', $data['sku'] ?? null);
            $stmt->bindValue(':description', $data['description'] ?? null);
            $stmt->bindValue(':short_description', $data['short_description'] ?? null);
            $stmt->bindValue(':category_id', !empty($data['category_id']) ? $data['category_id'] : null);
            $stmt->bindValue(':price', $data['price']);
            $stmt->bindValue(':sale_price', $data['sale_price'] ?? null);
            $stmt->bindValue(':cost_price', $data['cost_price'] ?? null);
            $stmt->bindValue(':stock_quantity', (int) ($data['stock_quantity'] ?? 0), PDO::PARAM_INT);
            $stmt->bindValue(':low_stock_threshold', (int) ($data['low_stock_threshold'] ?? 5), PDO::PARAM_INT);
            $stmt->bindValue(':manage_stock', (int) ($data['manage_stock'] ?? 1), PDO::PARAM_INT);
            $stmt->bindValue(':stock_status', $data['stock_status'] ?? 'in_stock');
            $stmt->bindValue(':featured_image', $featuredImage);
            $stmt->bindValue(':is_featured', filter_var($data['is_featured'] ?? 0, FILTER_VALIDATE_BOOLEAN) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':is_active', filter_var($data['is_active'] ?? 1, FILTER_VALIDATE_BOOLEAN) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':weight', $data['weight'] ?? null);
            $stmt->bindValue(':dimensions', $data['dimensions'] ?? null);
            $stmt->bindValue(':specs', $data['specs'] ?? null);
            $stmt->bindValue(':colors', $data['colors'] ?? null);
            $stmt->bindValue(':seo_title', $data['seo_title'] ?? null);
            $stmt->bindValue(':seo_description', $data['seo_description'] ?? null);
            $stmt->bindValue(':seo_keywords', $data['seo_keywords'] ?? null);

            $stmt->execute();
            $productId = $this->db->lastInsertId();

            // Handle multiple images (direct upload)
            if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
                $images = FileUpload::uploadMultiple($_FILES['images'], 'products');

                foreach ($images as $index => $imagePath) {
                    $this->addProductImage($productId, $imagePath, $index);
                }
            }

            // Handle pre-uploaded gallery URLs (for optimization)
            if (isset($data['gallery_urls']) && !empty($data['gallery_urls'])) {
                $urls = is_array($data['gallery_urls']) ? $data['gallery_urls'] : json_decode($data['gallery_urls'], true);
                if (is_array($urls)) {
                    foreach ($urls as $index => $url) {
                        // Extract relative path from URL if it's an absolute URL
                        $relativePath = preg_replace('/https?:\/\/[^\/]+\/.*uploads\//i', '', $url);
                        $this->addProductImage($productId, $relativePath, 100 + $index);
                    }
                }
            }

            $this->db->commit();

            // Log activity
            $this->logActivity($user['id'], 'create_product', 'products', $productId);

            Response::success(['id' => $productId], 'Product created successfully', 201);
        } catch (Exception $e) {
            $this->db->rollBack();
            Response::serverError('Failed to create product: ' . $e->getMessage());
        }
    }

    /**
     * Update product
     */
    public function update($id)
    {
        $user = AuthMiddleware::authenticate();
        $data = $_POST;

        // Check if product exists
        // For PUT requests, if it's not multipart, read from raw input
        if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $input = json_decode(file_get_contents("php://input"), true);
            if ($input) {
                $data = array_merge($data, $input);
            }
        }

        $stmt = $this->db->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if (!$stmt->fetch()) {
            Response::notFound('Product not found');
        }

        // Validate
        $validator = new Validator($data);
        $validator->required('name')
            ->required('slug')
            ->unique('slug', 'products', 'slug', $id)
            ->required('price')
            ->numeric('price');

        if (isset($data['sku']) && !empty($data['sku'])) {
            $validator->unique('sku', 'products', 'sku', $id);
        }

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $this->db->beginTransaction();

            // Handle featured image upload
            if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
                $data['featured_image'] = FileUpload::upload($_FILES['featured_image'], 'products');
            }

            // Update product
            $stmt = $this->db->prepare("
                UPDATE products SET 
                    name = :name, slug = :slug, sku = :sku, description = :description, 
                    short_description = :short_description, category_id = :category_id,
                    price = :price, sale_price = :sale_price, cost_price = :cost_price,
                    stock_quantity = :stock_quantity, low_stock_threshold = :low_stock_threshold,
                    manage_stock = :manage_stock, stock_status = :stock_status,
                    " . (isset($data['featured_image']) ? "featured_image = :featured_image," : "") . "
                    is_featured = :is_featured, is_active = :is_active,
                    weight = :weight, dimensions = :dimensions, specs = :specs, colors = :colors,
                    seo_title = :seo_title, seo_description = :seo_description, seo_keywords = :seo_keywords
                WHERE id = :id
            ");

            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->bindValue(':name', $data['name']);
            $stmt->bindValue(':slug', $data['slug']);
            $stmt->bindValue(':sku', $data['sku'] ?? null);
            $stmt->bindValue(':description', $data['description'] ?? null);
            $stmt->bindValue(':short_description', $data['short_description'] ?? null);
            $stmt->bindValue(':category_id', !empty($data['category_id']) ? $data['category_id'] : null);
            $stmt->bindValue(':price', $data['price']);
            $stmt->bindValue(':sale_price', !empty($data['sale_price']) ? $data['sale_price'] : null);
            $stmt->bindValue(':cost_price', !empty($data['cost_price']) ? $data['cost_price'] : null);
            $stmt->bindValue(':stock_quantity', (int) ($data['stock_quantity'] ?? 0), PDO::PARAM_INT);
            $stmt->bindValue(':low_stock_threshold', (int) ($data['low_stock_threshold'] ?? 5), PDO::PARAM_INT);
            $stmt->bindValue(':manage_stock', (int) ($data['manage_stock'] ?? 1), PDO::PARAM_INT);
            $stmt->bindValue(':stock_status', $data['stock_status'] ?? 'in_stock');

            if (isset($data['featured_image'])) {
                // If it's a full URL, convert to relative path
                if (strpos($data['featured_image'], 'http') === 0) {
                    $data['featured_image'] = preg_replace('/https?:\/\/[^\/]+\/.*uploads\//i', '', $data['featured_image']);
                }
                $stmt->bindValue(':featured_image', $data['featured_image']);
            }

            // Use filter_var so 'true'/'false' strings and 0/1 integers are all handled correctly
            $stmt->bindValue(':is_featured', filter_var($data['is_featured'] ?? 0, FILTER_VALIDATE_BOOLEAN) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':is_active', filter_var($data['is_active'] ?? 1, FILTER_VALIDATE_BOOLEAN) ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':weight', $data['weight'] ?? null);
            $stmt->bindValue(':dimensions', $data['dimensions'] ?? null);
            $stmt->bindValue(':specs', $data['specs'] ?? null);
            $stmt->bindValue(':colors', $data['colors'] ?? null);
            $stmt->bindValue(':seo_title', $data['seo_title'] ?? null);
            $stmt->bindValue(':seo_description', $data['seo_description'] ?? null);
            $stmt->bindValue(':seo_keywords', $data['seo_keywords'] ?? null);

            $stmt->execute();

            // Handle multiple images (direct upload)
            if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
                $images = FileUpload::uploadMultiple($_FILES['images'], 'products');

                foreach ($images as $index => $imagePath) {
                    $this->addProductImage($id, $imagePath, $index);
                }
            }

            // Handle pre-uploaded gallery URLs (for optimization)
            if (isset($data['gallery_urls']) && !empty($data['gallery_urls'])) {
                $urls = is_array($data['gallery_urls']) ? $data['gallery_urls'] : json_decode($data['gallery_urls'], true);
                if (is_array($urls)) {
                    foreach ($urls as $index => $url) {
                        // Extract relative path from URL if it's an absolute URL
                        $relativePath = preg_replace('/https?:\/\/[^\/]+\/.*uploads\//i', '', $url);
                        $this->addProductImage($id, $relativePath, 100 + $index);
                    }
                }
            }

            $this->db->commit();

            // Log activity
            $this->logActivity($user['id'], 'update_product', 'products', $id);

            Response::success(['id' => $id], 'Product updated successfully');
        } catch (Exception $e) {
            $this->db->rollBack();
            Response::serverError('Failed to update product: ' . $e->getMessage());
        }
    }

    /**
     * Duplicate existing product
     */
    public function duplicate($id)
    {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $product = $stmt->fetch();

        if (!$product) {
            Response::notFound('Product not found');
        }

        try {
            $this->db->beginTransaction();

            // Prepare duplicated data
            $name = $product['name'] . ' (Copy)';
            $slug = $product['slug'] . '-copy-' . time();

            $stmt = $this->db->prepare("
                INSERT INTO products (
                    name, slug, sku, description, short_description, category_id, 
                    price, sale_price, cost_price, stock_quantity, low_stock_threshold,
                    manage_stock, stock_status, featured_image, is_featured, is_active,
                    weight, dimensions, specs, seo_title, seo_description, seo_keywords
                ) SELECT 
                    :name, :slug, CONCAT(sku, '-COPY'), description, short_description, category_id,
                    price, sale_price, cost_price, stock_quantity, low_stock_threshold,
                    manage_stock, stock_status, featured_image, is_featured, 0,
                    weight, dimensions, specs, seo_title, seo_description, seo_keywords
                FROM products WHERE id = :id
            ");

            $stmt->bindValue(':name', $name);
            $stmt->bindValue(':slug', $slug);
            $stmt->bindValue(':id', $id);
            $stmt->execute();

            $newId = $this->db->lastInsertId();

            // Copy gallery images
            $images = $this->getProductImages($id);
            foreach ($images as $img) {
                $this->addProductImage($newId, $img['image_url'], $img['sort_order']);
            }

            $this->db->commit();

            // Log activity
            $this->logActivity($user['id'], 'duplicate_product', 'products', $newId);

            Response::success(['id' => $newId], 'Product duplicated successfully');
        } catch (Exception $e) {
            if ($this->db->inTransaction())
                $this->db->rollBack();
            Response::serverError('Failed to duplicate product: ' . $e->getMessage());
        }
    }

    /**
     * Delete product
     */
    public function delete($id)
    {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        $product = $stmt->fetch();

        if (!$product) {
            Response::notFound('Product not found');
        }

        try {
            // Delete product images from filesystem
            $images = $this->getProductImages($id);
            foreach ($images as $image) {
                FileUpload::delete($image['image_url']);
            }

            if ($product['featured_image']) {
                FileUpload::delete($product['featured_image']);
            }

            // Delete from database (cascade will delete images)
            $stmt = $this->db->prepare("DELETE FROM products WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            // Log activity
            $this->logActivity($user['id'], 'delete_product', 'products', $id);

            Response::success(null, 'Product deleted successfully');
        } catch (Exception $e) {
            Response::serverError('Failed to delete product: ' . $e->getMessage());
        }
    }

    /**
     * Delete product image
     */
    public function deleteImage($productId, $imageId)
    {
        $user = AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT * FROM product_images WHERE id = :id AND product_id = :product_id");
        $stmt->bindParam(':id', $imageId);
        $stmt->bindParam(':product_id', $productId);
        $stmt->execute();

        $image = $stmt->fetch();

        if (!$image) {
            Response::notFound('Image not found');
        }

        FileUpload::delete($image['image_url']);

        $stmt = $this->db->prepare("DELETE FROM product_images WHERE id = :id");
        $stmt->bindParam(':id', $imageId);
        $stmt->execute();

        Response::success(null, 'Image deleted successfully');
    }

    /**
     * Helper: Get product images
     */
    private function getProductImages($productId)
    {
        $stmt = $this->db->prepare("SELECT * FROM product_images WHERE product_id = :product_id ORDER BY sort_order");
        $stmt->bindParam(':product_id', $productId);
        $stmt->execute();

        $images = $stmt->fetchAll();

        foreach ($images as &$image) {
            $image['url'] = FileUpload::getUrl($image['image_url']);
        }

        return $images;
    }

    /**
     * Helper: Add product image
     */
    private function addProductImage($productId, $imagePath, $sortOrder = 0)
    {
        $stmt = $this->db->prepare("
            INSERT INTO product_images (product_id, image_url, sort_order) 
            VALUES (:product_id, :image_url, :sort_order)
        ");
        $stmt->bindParam(':product_id', $productId);
        $stmt->bindParam(':image_url', $imagePath);
        $stmt->bindParam(':sort_order', $sortOrder);
        $stmt->execute();
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
