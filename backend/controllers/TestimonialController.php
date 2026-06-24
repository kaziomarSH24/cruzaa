<?php
/**
 * Testimonial Controller
 */
class TestimonialController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all Testimonials
     */
    public function index()
    {
        $isAdmin = AuthMiddleware::isAuthenticated();
        $where = $isAdmin ? "1=1" : "is_active = 1";

        $stmt = $this->db->prepare("SELECT * FROM testimonials WHERE $where ORDER BY sort_order ASC, created_at DESC");
        $stmt->execute();
        $items = $stmt->fetchAll();

        // Handle avatars
        foreach ($items as &$item) {
            if (!empty($item['avatar']) && !filter_var($item['avatar'], FILTER_VALIDATE_URL)) {
                $item['avatar'] = FileUpload::getUrl($item['avatar']);
            }
        }

        Response::success($items);
    }

    /**
     * Create or update Testimonial
     */
    public function store()
    {
        AuthMiddleware::authenticate();

        $data = $_POST;
        if (empty($data['name']) || empty($data['content'])) {
            Response::error("Name and Content are required", 400);
        }

        $avatar = $data['avatar'] ?? null;
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $avatar = FileUpload::upload($_FILES['avatar'], 'testimonials');
        }

        if (isset($data['id']) && !empty($data['id'])) {
            // Update
            $stmt = $this->db->prepare("UPDATE testimonials SET name = :n, role = :r, content = :c, avatar = :a, rating = :rt, sort_order = :s, is_active = :v WHERE id = :id");
            $stmt->bindValue(':id', $data['id']);
        } else {
            // Create
            $stmt = $this->db->prepare("INSERT INTO testimonials (name, role, content, avatar, rating, sort_order, is_active) VALUES (:n, :r, :c, :a, :rt, :s, :v)");
        }

        $stmt->bindValue(':n', $data['name']);
        $stmt->bindValue(':r', $data['role'] ?? '');
        $stmt->bindValue(':c', $data['content']);
        $stmt->bindValue(':a', $avatar);
        $stmt->bindValue(':rt', $data['rating'] ?? 5);
        $stmt->bindValue(':s', $data['sort_order'] ?? 0);
        $stmt->bindValue(':v', $data['is_active'] ?? 1);

        if ($stmt->execute()) {
            Response::success(null, "Testimonial saved successfully");
        } else {
            Response::error("Failed to save testimonial");
        }
    }

    /**
     * Delete Testimonial
     */
    public function delete($id)
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("DELETE FROM testimonials WHERE id = ?");
        if ($stmt->execute([$id])) {
            Response::success(null, "Testimonial deleted successfully");
        } else {
            Response::error("Failed to delete testimonial");
        }
    }
}
