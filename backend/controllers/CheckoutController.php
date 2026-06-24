<?php
/**
 * Public Checkout Controller
 */
class CheckoutController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get active payment methods for checkout
     */
    public function getPaymentMethods()
    {
        $stmt = $this->db->prepare("SELECT id, name, code, description, is_active FROM payment_methods WHERE is_active = 1 ORDER BY sort_order ASC");
        $stmt->execute();
        $methods = $stmt->fetchAll();
        Response::success($methods);
    }

    /**
     * Place an order (Guest or Registered)
     */
    public function placeOrder()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Debug Log
        error_log("INCOMING ORDER DATA: " . print_r($data, true));

        // Basic Validation
        $validator = new Validator($data);
        $validator->required('customer_name')
            ->required('customer_email')->email('customer_email')
            ->required('total_amount')
            ->required('items');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $this->db->beginTransaction();

            $orderNumber = 'ORD-' . strtoupper(uniqid());

            // Determine payment status
            $paymentMethod = $data['payment_method'] ?? 'stripe';
            // Klarna is also processed via Stripe PaymentIntents — mark as paid if PI ID present
            $stripePaymentMethods = ['stripe', 'klarna'];
            $paymentStatus = (in_array($paymentMethod, $stripePaymentMethods) && !empty($data['payment_intent_id'])) ? 'paid' : 'pending';

            // Create Order
            $stmt = $this->db->prepare("
                INSERT INTO orders (
                    order_number, user_id, customer_name, customer_email, 
                    customer_phone, total_amount, payment_method, payment_intent_id,
                    shipping_address, order_status, payment_status,
                    subtotal, shipping_total, tax_total
                ) VALUES (
                    :order_number, :user_id, :customer_name, :customer_email, 
                    :customer_phone, :total_amount, :payment_method, :payment_intent_id,
                    :shipping_address, 'pending', :payment_status,
                    :subtotal, :shipping_total, :tax_total
                )
            ");

            $userId = $data['user_id'] ?? null;
            $paymentIntentId = $data['payment_intent_id'] ?? null;

            // Calculate subtotal from items to be safe, or use provided total
            $subtotal = 0;
            foreach ($data['items'] as $item) {
                $subtotal += $item['price'] * $item['quantity'];
            }

            $shippingTotal = $data['shipping_total'] ?? ($data['total_amount'] - $subtotal);
            if ($shippingTotal < 0)
                $shippingTotal = 0;

            $stmt->bindValue(':order_number', $orderNumber);
            $stmt->bindValue(':user_id', $userId);
            $stmt->bindValue(':customer_name', $data['customer_name']);
            $stmt->bindValue(':customer_email', $data['customer_email']);
            $stmt->bindValue(':customer_phone', $data['customer_phone'] ?? null);
            $stmt->bindValue(':total_amount', $data['total_amount']);
            $stmt->bindValue(':payment_method', $paymentMethod);
            $stmt->bindValue(':payment_intent_id', $paymentIntentId);
            $stmt->bindValue(':shipping_address', $data['shipping_address'] ?? '');
            $stmt->bindValue(':payment_status', $paymentStatus);
            $stmt->bindValue(':subtotal', $subtotal);
            $stmt->bindValue(':shipping_total', $shippingTotal);
            $stmt->bindValue(':tax_total', 0);

            $stmt->execute();
            $orderId = $this->db->lastInsertId();

            // Create Order Items
            foreach ($data['items'] as $item) {
                // Validate product_id exists if provided
                $productId = $item['product_id'] ?? null;
                if ($productId) {
                    $checkStmt = $this->db->prepare("SELECT count(*) FROM products WHERE id = ?");
                    $checkStmt->execute([$productId]);
                    if ($checkStmt->fetchColumn() == 0) {
                        $productId = null; // Product no longer exists, keep reference by name only
                    }
                }

                $stmt = $this->db->prepare("
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

            $this->db->commit();

            // Clear any previous output buffers to ensure clean JSON
            if (ob_get_length())
                ob_clean();

            Response::success([
                'order_id' => (int) $orderId,
                'order_number' => (string) $orderNumber
            ], 'Order placed successfully');

        } catch (\Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            // Log the error for internal debugging
            error_log("CRITICAL ORDER ERROR: " . $e->getMessage());

            // Clean output buffer before sending error
            if (ob_get_length())
                ob_clean();

            Response::serverError('Server error saving order: ' . $e->getMessage());
        }
    }

    /**
     * Create a Stripe PaymentIntent
     */
    public function createPaymentIntent()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $amount = $data['amount'] ?? 0;

        if ($amount <= 0) {
            Response::error('Invalid amount', 400);
        }

        // Get Stripe Secret Key
        $stmt = $this->db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'stripe_secret_key'");
        $stmt->execute();
        $secretKey = $stmt->fetchColumn();

        if (empty($secretKey)) {
            Response::error('Stripe is not configured', 500);
        }

        try {
            \Stripe\Stripe::setApiKey($secretKey);

            $paymentMethodTypes = $data['payment_method'] === 'klarna' ? ['klarna'] : null;

            $piParams = [
                'amount'   => round($amount * 100),
                'currency' => 'gbp',
                'automatic_payment_methods' => ['enabled' => true],
                'metadata' => [
                    'integration'  => 'cruzaa_checkout',
                    'amount_gbp'   => $amount,
                    'payment_type' => $data['payment_method'] ?? 'stripe',
                ],
            ];

            $paymentIntent = \Stripe\PaymentIntent::create($piParams);

            error_log("PaymentIntent created: " . $paymentIntent->id . " for amount: £" . $amount);

            Response::success([
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id
            ]);
        } catch (\Stripe\Exception\CardException $e) {
            error_log("Stripe Card Error: " . $e->getMessage());
            Response::error('Card error: ' . $e->getMessage(), 400);
        } catch (\Stripe\Exception\InvalidRequestException $e) {
            error_log("Stripe Invalid Request: " . $e->getMessage());
            Response::error('Invalid request: ' . $e->getMessage(), 400);
        } catch (\Stripe\Exception\AuthenticationException $e) {
            error_log("Stripe Auth Error: " . $e->getMessage());
            Response::error('Authentication failed. Check Stripe keys.', 500);
        } catch (Exception $e) {
            error_log("Stripe Error: " . $e->getMessage());
            Response::serverError('Payment system error: ' . $e->getMessage());
        }
    }
}
