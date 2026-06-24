<?php
/**
 * FAQ Controller
 */
class FAQController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all FAQs
     */
    public function index()
    {
        $isAdmin = AuthMiddleware::isAuthenticated();
        $where = $isAdmin ? "1=1" : "is_active = 1";

        $stmt = $this->db->prepare("SELECT * FROM faqs WHERE $where ORDER BY sort_order ASC, created_at DESC");
        $stmt->execute();
        $faqs = $stmt->fetchAll();

        Response::success($faqs);
    }

    /**
     * Create or update FAQ
     */
    public function store()
    {
        AuthMiddleware::authenticate();

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['question']) || empty($data['answer'])) {
            Response::error("Question and Answer are required", 400);
        }

        if (isset($data['id']) && !empty($data['id'])) {
            // Update
            $stmt = $this->db->prepare("UPDATE faqs SET question = :q, answer = :a, category = :c, sort_order = :s, is_active = :v WHERE id = :id");
            $stmt->bindValue(':id', $data['id']);
        } else {
            // Create
            $stmt = $this->db->prepare("INSERT INTO faqs (question, answer, category, sort_order, is_active) VALUES (:q, :a, :c, :s, :v)");
        }

        $stmt->bindValue(':q', $data['question']);
        $stmt->bindValue(':a', $data['answer']);
        $stmt->bindValue(':c', $data['category'] ?? 'general');
        $stmt->bindValue(':s', $data['sort_order'] ?? 0);
        $stmt->bindValue(':v', $data['is_active'] ?? 1);

        if ($stmt->execute()) {
            Response::success(null, "FAQ saved successfully");
        } else {
            Response::error("Failed to save FAQ");
        }
    }

    /**
     * Delete FAQ
     */
    public function delete($id)
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("DELETE FROM faqs WHERE id = ?");
        if ($stmt->execute([$id])) {
            Response::success(null, "FAQ deleted successfully");
        } else {
            Response::error("Failed to delete FAQ");
        }
    }
}
