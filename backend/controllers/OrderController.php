<?php
/**
 * Order Management Controller
 */
class OrderController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * List all orders
     */
    public function index()
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("
            SELECT o.*, u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        ");
        $stmt->execute();
        $orders = $stmt->fetchAll();

        Response::success($orders);
    }

    /**
     * Show single order with items
     */
    public function show($id)
    {
        AuthMiddleware::authenticate();

        // Get order
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $order = $stmt->fetch();

        if (!$order) {
            Response::notFound('Order not found');
        }

        // Get items
        $stmt = $this->db->prepare("SELECT * FROM order_items WHERE order_id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $order['items'] = $stmt->fetchAll();

        Response::success($order);
    }

    /**
     * Update order status
     */
    public function updateStatus($id)
    {
        AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['status'])) {
            Response::error('Status is required');
        }

        $stmt = $this->db->prepare("UPDATE orders SET order_status = :status WHERE id = :id");
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        Response::success(null, 'Order status updated');
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus($id)
    {
        AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['status'])) {
            Response::error('Status is required');
        }

        $stmt = $this->db->prepare("UPDATE orders SET payment_status = :status WHERE id = :id");
        $stmt->bindParam(':status', $data['status']);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        Response::success(null, 'Payment status updated');
    }

    /**
     * Delete order
     */
    public function delete($id)
    {
        AuthMiddleware::authenticate();

        $stmt = $this->db->prepare("DELETE FROM orders WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        Response::success(null, 'Order deleted successfully');
    }
}
