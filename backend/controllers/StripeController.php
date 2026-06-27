<?php

/**
 * Stripe Payment Controller - Checkout Integration
 */
class StripeController
{
    private $db;
    private $stripeKey;
    private $stripeEnabled;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
        $this->loadStripeSettings();
    }

    /**
     * Load Stripe settings from database
     */
    private function loadStripeSettings()
    {
        $stmt = $this->db->query("
            SELECT setting_key, setting_value 
            FROM settings 
            WHERE setting_key IN ('stripe_enabled', 'stripe_mode', 'stripe_secret_key')
        ");

        $settings = [];
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        $this->stripeEnabled = ($settings['stripe_enabled'] ?? '0') === '1';
        $this->stripeKey = $settings['stripe_secret_key'] ?? '';
    }

    /**
     * Create Stripe Checkout Session
     */
    public function createCheckoutSession()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$this->stripeEnabled) {
            Response::error('Stripe payments are currently disabled', 400);
        }

        if (empty($this->stripeKey)) {
            Response::error('Stripe is not configured', 500);
        }

        // Validate cart items
        $validator = new Validator($data);
        $validator->required('items')
            ->required('success_url')
            ->required('cancel_url');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            // Initialize Stripe (You need to install Stripe PHP SDK: composer require stripe/stripe-php)
            // \Stripe\Stripe::setApiKey($this->stripeKey);

            $lineItems = [];
            foreach ($data['items'] as $item) {
                $lineItems[] = [
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $item['name'],
                            'images' => isset($item['image']) ? [$item['image']] : [],
                        ],
                        'unit_amount' => (int) ($item['price'] * 100), // Convert to cents
                    ],
                    'quantity' => $item['quantity'],
                ];
            }

            // Create checkout session
            // $session = \Stripe\Checkout\Session::create([
            //     'payment_method_types' => ['card'],
            //     'line_items' => $lineItems,
            //     'mode' => 'payment',
            //     'success_url' => $data['success_url'],
            //     'cancel_url' => $data['cancel_url'],
            //     'customer_email' => $data['email'] ?? null,
            //     'metadata' => [
            //         'order_id' => $data['order_id'] ?? null,
            //     ],
            // ]);

            // For demo purposes, return mock session
            $mockSession = [
                'id' => 'cs_test_' . uniqid(),
                'url' => 'https://checkout.stripe.com/demo',
                'payment_status' => 'unpaid'
            ];

            Response::success([
                'session_id' => $mockSession['id'],
                'checkout_url' => $mockSession['url']
            ], 'Checkout session created successfully');
        } catch (Exception $e) {
            Response::serverError('Failed to create checkout session: ' . $e->getMessage());
        }
    }

    /**
     * Handle Stripe Webhook
     */
    /**
     * Handle Stripe Webhook (Production Ready)
     */
    public function webhook()
    {
        $payload = @file_get_contents('php://input');
        $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        $event = null;

        try {
            // Get webhook secret from settings
            $stmt = $this->db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'stripe_webhook_secret'");
            $stmt->execute();
            $webhookSecret = $stmt->fetchColumn();

            if (empty($webhookSecret)) {
                throw new Exception("Webhook secret is missing in settings.");
            }

            // Verify webhook signature
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            http_response_code(400);
            echo json_encode(['error' => 'Invalid payload']);
            exit();
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            http_response_code(400);
            echo json_encode(['error' => 'Invalid signature']);
            exit();
        } catch (\Exception $e) {
            // Other errors
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
            exit();
        }

        // Handle different event types (Using Object notation since constructEvent returns an object)
        switch ($event->type) {
            case 'checkout.session.completed':
                // Payment successful
                $session = $event->data->object;
                $this->handleSuccessfulPayment($session);
                break;

            case 'payment_intent.succeeded':
                // Payment succeeded
                $paymentIntent = $event->data->object;
                // Add any logic if needed
                break;

            case 'payment_intent.payment_failed':
                // Payment failed
                $paymentIntent = $event->data->object;
                // Add any logic if needed
                break;

            default:
                // Unexpected event type
                error_log('Received unknown Stripe event type: ' . $event->type);
                break;
        }

        http_response_code(200);
        echo json_encode(['status' => 'success']);
        exit();
    }

    /**
     * Handle successful payment
     */
    private function handleSuccessfulPayment($session)
    {
        // Update order status, send confirmation email, etc.
        // Log the payment

        $stmt = $this->db->prepare("
            INSERT INTO activity_logs (user_id, action, entity_type, details, ip_address) 
            VALUES (NULL, 'stripe_payment_success', 'payment', :details, :ip)
        ");

        $details = json_encode($session);
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;

        $stmt->bindParam(':details', $details);
        $stmt->bindParam(':ip', $ip);
        $stmt->execute();
    }

    /**
     * Get Stripe publishable key (for frontend)
     */
    public function getPublishableKey()
    {
        $stmt = $this->db->prepare("
            SELECT setting_value 
            FROM settings 
            WHERE setting_key = 'stripe_publishable_key'
        ");
        $stmt->execute();

        $key = $stmt->fetchColumn();

        Response::success([
            'publishable_key' => $key,
            'enabled' => $this->stripeEnabled
        ]);
    }
}
