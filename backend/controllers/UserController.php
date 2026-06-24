<?php
/**
 * User Management Controller (Customers)
 */
class UserController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * List all users
     */
    public function index()
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT id, first_name, last_name, email, phone, is_active, last_login, created_at FROM users ORDER BY created_at DESC");
        $stmt->execute();
        $users = $stmt->fetchAll();

        Response::success($users);
    }

    /**
     * Show single user
     */
    public function show($id)
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('User not found');
        }

        Response::success($user);
    }

    /**
     * Toggle user status
     */
    public function toggleStatus($id)
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("SELECT is_active FROM users WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('User not found');
        }

        $newStatus = $user['is_active'] ? 0 : 1;
        $stmt = $this->db->prepare("UPDATE users SET is_active = :status WHERE id = :id");
        $stmt->bindValue(':status', $newStatus, PDO::PARAM_INT);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        Response::success(null, 'User status updated');
    }

    /**
     * Delete user
     */
    public function delete($id)
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        Response::success(null, 'User deleted successfully');
    }
}
