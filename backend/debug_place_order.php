<?php
// debug_place_order.php
require_once 'config/Database.php';
require_once 'controllers/CheckoutController.php';

// Mock Response class if not exists or if it ends execution
class Response
{
    public static function validationError($errors)
    {
        echo "Validation Error: " . json_encode($errors) . "\n";
        exit;
    }
    public static function success($data, $message = null)
    {
        echo "Success: " . $message . " Data: " . json_encode($data) . "\n";
        exit;
    }
    public static function serverError($message)
    {
        echo "Server Error: " . $message . "\n";
        exit;
    }
    public static function error($message, $code = 400)
    {
        echo "Error ($code): " . $message . "\n";
        exit;
    }
}

// Mock Validator class
class Validator
{
    private $data;
    private $errors = [];
    public function __construct($data)
    {
        $this->data = $data;
    }
    public function required($field)
    {
        if (!isset($this->data[$field]) || empty($this->data[$field])) {
            $this->errors[$field] = "$field is required";
        }
        return $this;
    }
    public function email($field)
    {
        return $this;
    }
    public function fails()
    {
        return !empty($this->errors);
    }
    public function errors()
    {
        return $this->errors;
    }
}

// Mock file_get_contents('php://input')
// We will manually inject data into the controller or just copy the logic effectively.
// Since CheckoutController reads from php://input, we can't easily use the controller method directly without modifying it or using stream wrappers.
// Instead, I will COPY the logic from CheckoutController::placeOrder here to debug it.

try {
    $db = (new Database())->getConnection();

    // Test Data
    $data = [
        'customer_name' => 'Debug User',
        'customer_email' => 'debug@example.com',
        'customer_phone' => '1234567890',
        'shipping_address' => '123 Debug St',
        'payment_method' => 'stripe',
        'payment_intent_id' => 'pi_debug_123',
        'total_amount' => 10.00,
        'items' => [
            [
                'product_id' => 999, // Non-existent product ID
                'name' => 'Debug Product',
                'quantity' => 1,
                'price' => 10.00
            ]
        ]
    ];

    echo "Starting Transaction...\n";
    $db->beginTransaction();

    $orderNumber = 'ORD-' . strtoupper(uniqid());

    // Create Order
    $sql = "INSERT INTO orders (
                order_number, user_id, customer_name, customer_email, 
                customer_phone, total_amount, payment_method, 
                shipping_address, order_status, payment_status
            ) VALUES (
                :order_number, :user_id, :customer_name, :customer_email, 
                :customer_phone, :total_amount, :payment_method, 
                :shipping_address, 'pending', :payment_status
            )";

    $stmt = $db->prepare($sql);

    $userId = $data['user_id'] ?? null;
    $paymentMethod = $data['payment_method'] ?? 'stripe';
    $paymentStatus = ($paymentMethod === 'stripe' && !empty($data['payment_intent_id'])) ? 'paid' : 'pending';

    $stmt->bindValue(':order_number', $orderNumber);
    $stmt->bindValue(':user_id', $userId);
    $stmt->bindValue(':customer_name', $data['customer_name']);
    $stmt->bindValue(':customer_email', $data['customer_email']);
    $stmt->bindValue(':customer_phone', $data['customer_phone'] ?? null);
    $stmt->bindValue(':total_amount', $data['total_amount']);
    $stmt->bindValue(':payment_method', $paymentMethod);
    $stmt->bindValue(':shipping_address', $data['shipping_address'] ?? '');
    $stmt->bindValue(':payment_status', $paymentStatus);

    echo "Executing Order Insert...\n";
    $stmt->execute();
    $orderId = $db->lastInsertId();
    echo "Order ID: $orderId\n";

    // Create Order Items
    foreach ($data['items'] as $item) {
        echo "Inserting Item...\n";

        // Validate product_id exists if provided
        $productId = $item['product_id'] ?? null;
        if ($productId) {
            $checkStmt = $db->prepare("SELECT count(*) FROM products WHERE id = ?");
            $checkStmt->execute([$productId]);
            if ($checkStmt->fetchColumn() == 0) {
                echo "Product $productId not found, setting to NULL\n";
                $productId = null; // Product no longer exists
            }
        }

        $stmt = $db->prepare("
            INSERT INTO order_items (
                order_id, product_id, product_name, quantity, unit_price, total_price
            ) VALUES (
                :order_id, :product_id, :product_name, :quantity, :unit_price, :total_price
            )
        ");

        $stmt->bindValue(':order_id', $orderId);
        $stmt->bindValue(':product_id', $productId);
        $stmt->bindValue(':product_name', $item['name']);
        $stmt->bindValue(':quantity', $item['quantity']);
        $stmt->bindValue(':unit_price', $item['price']);
        $stmt->bindValue(':total_price', $item['price'] * $item['quantity']);
        $stmt->execute();
    }

    $db->commit();
    echo "Transaction Committed. Success.\n";

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
