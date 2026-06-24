<?php
/**
 * Pages Controller
 * Manages dynamic pages with content blocks and multiple images
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class PagesController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->ensureTableExists();
    }

    private function ensureTableExists() {
        $sql = "CREATE TABLE IF NOT EXISTS pages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            content LONGTEXT,
            meta_title VARCHAR(255),
            meta_description TEXT,
            status ENUM('published', 'draft') DEFAULT 'draft',
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $this->db->exec($sql);

        $imgSql = "CREATE TABLE IF NOT EXISTS page_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            page_id INT NOT NULL,
            image_url VARCHAR(500) NOT NULL,
            caption VARCHAR(255),
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        $this->db->exec($imgSql);
    }

    /** GET /pages - List all pages (public: published only; admin: all) */
    public function index() {
        $isAdmin = $this->isAdmin();
        $where = $isAdmin ? '' : "WHERE p.status = 'published'";
        $sql = "SELECT p.*, GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order SEPARATOR '||') AS images
                FROM pages p
                LEFT JOIN page_images pi ON pi.page_id = p.id
                $where
                GROUP BY p.id
                ORDER BY p.sort_order ASC, p.created_at DESC";
        $stmt = $this->db->query($sql);
        $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($pages as &$page) {
            $page['images'] = $page['images'] ? explode('||', $page['images']) : [];
        }
        Response::success($pages);
    }

    /** GET /pages/{slug} - Get single page by slug */
    public function show($slug) {
        $isAdmin = $this->isAdmin();
        $statusCheck = $isAdmin ? '' : "AND p.status = 'published'";
        $stmt = $this->db->prepare(
            "SELECT p.* FROM pages p WHERE p.slug = ? $statusCheck LIMIT 1"
        );
        $stmt->execute([$slug]);
        $page = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$page) { Response::notFound('Page not found'); return; }

        // Get images
        $imgStmt = $this->db->prepare(
            "SELECT * FROM page_images WHERE page_id = ? ORDER BY sort_order ASC"
        );
        $imgStmt->execute([$page['id']]);
        $page['images'] = $imgStmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success($page);
    }

    /** POST /pages - Create page (admin) */
    public function create() {
        AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['title']) || empty($data['slug'])) {
            Response::error('Title and slug are required', 422); return;
        }
        $slug = $this->sanitizeSlug($data['slug']);

        $stmt = $this->db->prepare(
            "INSERT INTO pages (title, slug, content, meta_title, meta_description, status, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['title'],
            $slug,
            $data['content'] ?? '',
            $data['meta_title'] ?? $data['title'],
            $data['meta_description'] ?? '',
            $data['status'] ?? 'draft',
            $data['sort_order'] ?? 0
        ]);
        $pageId = $this->db->lastInsertId();

        // Save images
        if (!empty($data['images']) && is_array($data['images'])) {
            $this->saveImages($pageId, $data['images']);
        }

        Response::success(['id' => $pageId, 'slug' => $slug], 'Page created', 201);
    }

    /** PUT /pages/{id} - Update page (admin) */
    public function update($id) {
        AuthMiddleware::requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        $slug = isset($data['slug']) ? $this->sanitizeSlug($data['slug']) : null;

        $fields = [];
        $params = [];
        $map = ['title', 'content', 'meta_title', 'meta_description', 'status', 'sort_order'];
        foreach ($map as $f) {
            if (isset($data[$f])) { $fields[] = "$f = ?"; $params[] = $data[$f]; }
        }
        if ($slug) { $fields[] = "slug = ?"; $params[] = $slug; }

        if (!empty($fields)) {
            $params[] = $id;
            $this->db->prepare("UPDATE pages SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
        }

        // Replace images if provided
        if (isset($data['images']) && is_array($data['images'])) {
            $this->db->prepare("DELETE FROM page_images WHERE page_id = ?")->execute([$id]);
            $this->saveImages($id, $data['images']);
        }

        Response::success(['id' => $id], 'Page updated');
    }

    /** DELETE /pages/{id} - Delete page (admin) */
    public function delete($id) {
        AuthMiddleware::requireAuth();
        $this->db->prepare("DELETE FROM pages WHERE id = ?")->execute([$id]);
        Response::success(null, 'Page deleted');
    }

    /** POST /pages/{id}/images - Upload image for page */
    public function uploadImage($pageId) {
        AuthMiddleware::requireAuth();
        if (!isset($_FILES['image'])) { Response::error('No image uploaded', 422); return; }

        $uploadDir = __DIR__ . '/../uploads/pages/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

        $file = $_FILES['image'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!in_array($ext, $allowed)) { Response::error('Invalid file type', 422); return; }

        $filename = uniqid('page_') . '.' . $ext;
        $dest = $uploadDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            Response::serverError('Failed to save image'); return;
        }

        $imageUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/backend/uploads/pages/' . $filename;
        $sort = intval($_POST['sort_order'] ?? 0);
        $caption = $_POST['caption'] ?? '';

        $stmt = $this->db->prepare("INSERT INTO page_images (page_id, image_url, caption, sort_order) VALUES (?, ?, ?, ?)");
        $stmt->execute([$pageId, $imageUrl, $caption, $sort]);

        Response::success(['id' => $this->db->lastInsertId(), 'url' => $imageUrl], 'Image uploaded', 201);
    }

    /** DELETE /pages/{pageId}/images/{imageId} */
    public function deleteImage($pageId, $imageId) {
        AuthMiddleware::requireAuth();
        $stmt = $this->db->prepare("SELECT image_url FROM page_images WHERE id = ? AND page_id = ?");
        $stmt->execute([$imageId, $pageId]);
        $img = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($img) {
            // Remove file
            $path = __DIR__ . '/../uploads/pages/' . basename($img['image_url']);
            if (file_exists($path)) unlink($path);
            $this->db->prepare("DELETE FROM page_images WHERE id = ?")->execute([$imageId]);
        }
        Response::success(null, 'Image deleted');
    }

    /** GET /pages/stats - Dashboard stats */
    public function stats() {
        $stmt = $this->db->query("SELECT COUNT(*) as total, SUM(status='published') as published, SUM(status='draft') as drafts FROM pages");
        Response::success($stmt->fetch(PDO::FETCH_ASSOC));
    }

    private function saveImages($pageId, $images) {
        $stmt = $this->db->prepare("INSERT INTO page_images (page_id, image_url, caption, sort_order) VALUES (?, ?, ?, ?)");
        foreach ($images as $i => $img) {
            if (is_string($img)) {
                $stmt->execute([$pageId, $img, '', $i]);
            } elseif (is_array($img) && !empty($img['url'])) {
                $stmt->execute([$pageId, $img['url'], $img['caption'] ?? '', $img['sort_order'] ?? $i]);
            }
        }
    }

    private function sanitizeSlug($slug) {
        return preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace([' ', '_'], '-', trim($slug))));
    }

    private function isAdmin() {
        $token = null;
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            preg_match('/Bearer (.+)/', $headers['Authorization'], $m);
            $token = $m[1] ?? null;
        }
        return !empty($token);
    }
}
