<?php
/**
 * Customer Auth Controller
 * Handles customer registration, login, profile, and orders
 */
class CustomerController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    // ─────────────────────────────────────────────
    //  REGISTER
    // ─────────────────────────────────────────────
    public function register()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator($data);
        $validator->required('first_name')
            ->required('last_name')
            ->required('email')->email('email')
            ->required('password')->min('password', 8)
            ->required('password_confirmation');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        if ($data['password'] !== $data['password_confirmation']) {
            Response::error('Passwords do not match', 422);
        }

        // Check if email already exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->bindParam(':email', $data['email']);
        $stmt->execute();
        if ($stmt->fetch()) {
            Response::error('An account with this email already exists', 422);
        }

        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
        $phone = $data['phone'] ?? null;

        $stmt = $this->db->prepare("
            INSERT INTO users (first_name, last_name, email, password, phone, is_active, created_at, updated_at)
            VALUES (:first_name, :last_name, :email, :password, :phone, 1, NOW(), NOW())
        ");
        $stmt->bindParam(':first_name', $data['first_name']);
        $stmt->bindParam(':last_name', $data['last_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $hashed);
        $stmt->bindParam(':phone', $phone);
        $stmt->execute();

        $userId = $this->db->lastInsertId();

        $user = $this->fetchUser($userId);
        $token = $this->generateToken($user);

        Response::success([
            'token' => $token,
            'user' => $this->formatUser($user)
        ], 'Account created successfully');
    }

    // ─────────────────────────────────────────────
    //  LOGIN
    // ─────────────────────────────────────────────
    public function login()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator($data);
        $validator->required('email')->email('email')
            ->required('password');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $data['email']);
        $stmt->execute();
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['password'], $user['password'])) {
            Response::error('Invalid email or password', 401);
        }

        if (!$user['is_active']) {
            Response::error('Your account has been disabled. Please contact support.', 403);
        }

        // Update last login
        $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
        $stmt->bindParam(':id', $user['id']);
        $stmt->execute();

        $token = $this->generateToken($user);

        Response::success([
            'token' => $token,
            'user' => $this->formatUser($user)
        ], 'Login successful');
    }

    // ─────────────────────────────────────────────
    //  LOGOUT  (stateless JWT – just acknowledge)
    // ─────────────────────────────────────────────
    public function logout()
    {
        // JWT is stateless – client just discards the token.
        // Optionally a token-blacklist table could be used here.
        Response::success(null, 'Logged out successfully');
    }

    // ─────────────────────────────────────────────
    //  GET PROFILE
    // ─────────────────────────────────────────────
    public function getProfile()
    {
        $user = $this->authenticateCustomer();
        Response::success($this->formatUser($user));
    }

    // ─────────────────────────────────────────────
    //  UPDATE PROFILE
    // ─────────────────────────────────────────────
    public function updateProfile()
    {
        $customer = $this->authenticateCustomer();
        $data = json_decode(file_get_contents("php://input"), true);

        // Build dynamic SET clause
        $fields = [];
        $params = [];

        if (!empty($data['first_name'])) {
            $fields[] = 'first_name = :first_name';
            $params[':first_name'] = $data['first_name'];
        }
        if (!empty($data['last_name'])) {
            $fields[] = 'last_name = :last_name';
            $params[':last_name'] = $data['last_name'];
        }
        if (!empty($data['email'])) {
            // Check uniqueness
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email AND id != :id");
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':id', $customer['id']);
            $stmt->execute();
            if ($stmt->fetch()) {
                Response::error('Email already in use', 422);
            }
            $fields[] = 'email = :email';
            $params[':email'] = $data['email'];
        }
        if (isset($data['phone'])) {
            $fields[] = 'phone = :phone';
            $params[':phone'] = $data['phone'];
        }
        if (!empty($data['password'])) {
            // Require current password for changes
            if (empty($data['current_password'])) {
                Response::error('Current password is required to change password', 422);
            }
            if (!password_verify($data['current_password'], $customer['password'])) {
                Response::error('Invalid current password', 422);
            }
            $fields[] = 'password = :password';
            $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        if (empty($fields)) {
            Response::error('No fields to update', 422);
        }

        $fields[] = 'updated_at = NOW()';
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $params[':id'] = $customer['id'];

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $updated = $this->fetchUser($customer['id']);
        Response::success($this->formatUser($updated), 'Profile updated successfully');
    }

    // ─────────────────────────────────────────────
    //  GET ORDERS  (customer's own orders)
    // ─────────────────────────────────────────────
    public function getOrders()
    {
        $customer = $this->authenticateCustomer();

        $stmt = $this->db->prepare("
            SELECT o.id, o.order_number, o.status, o.payment_status, o.total,
                   o.created_at,
                   COUNT(oi.id) as items_count
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            WHERE o.customer_email = :email
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ");
        $stmt->bindParam(':email', $customer['email']);
        $stmt->execute();
        $orders = $stmt->fetchAll();

        Response::success($orders);
    }

    // ─────────────────────────────────────────────
    //  ADDRESSES
    // ─────────────────────────────────────────────
    public function getAddresses()
    {
        $customer = $this->authenticateCustomer();
        $stmt = $this->db->prepare("SELECT * FROM customer_addresses WHERE customer_id = :id ORDER BY is_default DESC, created_at DESC");
        $stmt->bindParam(':id', $customer['id']);
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }

    public function addAddress()
    {
        $customer = $this->authenticateCustomer();
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator($data);
        $validator->required('line1')->required('city')->required('postcode');

        if ($validator->fails())
            Response::validationError($validator->errors());

        // Handle is_default
        if (!empty($data['is_default'])) {
            $stmt = $this->db->prepare("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = :id");
            $stmt->bindParam(':id', $customer['id']);
            $stmt->execute();
        }

        $stmt = $this->db->prepare("
            INSERT INTO customer_addresses (customer_id, label, type, line1, line2, city, postcode, country, is_default)
            VALUES (:cid, :label, :type, :line1, :line2, :city, :postcode, :country, :is_default)
        ");
        $stmt->execute([
            ':cid' => $customer['id'],
            ':label' => $data['label'] ?? 'Home',
            ':type' => $data['type'] ?? 'home',
            ':line1' => $data['line1'],
            ':line2' => $data['line2'] ?? null,
            ':city' => $data['city'],
            ':postcode' => $data['postcode'],
            ':country' => $data['country'] ?? 'United Kingdom',
            ':is_default' => !empty($data['is_default']) ? 1 : 0
        ]);

        Response::success(null, 'Address added successfully');
    }

    public function updateAddress($id)
    {
        $customer = $this->authenticateCustomer();
        $data = json_decode(file_get_contents("php://input"), true);

        // Verify ownership
        $stmt = $this->db->prepare("SELECT id FROM customer_addresses WHERE id = :id AND customer_id = :cid");
        $stmt->execute([':id' => $id, ':cid' => $customer['id']]);
        if (!$stmt->fetch())
            Response::notFound('Address not found');

        if (!empty($data['is_default'])) {
            $stmt = $this->db->prepare("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = :id");
            $stmt->execute([':id' => $customer['id']]);
        }

        $sql = "UPDATE customer_addresses SET label = :label, type = :type, line1 = :l1, line2 = :l2, city = :city, postcode = :pc, country = :country, is_default = :def WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':label' => $data['label'],
            ':type' => $data['type'],
            ':l1' => $data['line1'],
            ':l2' => $data['line2'] ?? null,
            ':city' => $data['city'],
            ':pc' => $data['postcode'],
            ':country' => $data['country'],
            ':def' => !empty($data['is_default']) ? 1 : 0,
            ':id' => $id
        ]);

        Response::success(null, 'Address updated successfully');
    }

    public function deleteAddress($id)
    {
        $customer = $this->authenticateCustomer();
        $stmt = $this->db->prepare("DELETE FROM customer_addresses WHERE id = :id AND customer_id = :cid");
        $stmt->execute([':id' => $id, ':cid' => $customer['id']]);
        Response::success(null, 'Address deleted successfully');
    }

    // ─────────────────────────────────────────────
    //  PAYMENT METHODS
    // ─────────────────────────────────────────────
    public function getPaymentMethods()
    {
        $customer = $this->authenticateCustomer();
        $stmt = $this->db->prepare("SELECT id, card_type, last4, expiry_month, expiry_year, card_holder, is_default FROM customer_payment_methods WHERE customer_id = :id ORDER BY is_default DESC, created_at DESC");
        $stmt->bindParam(':id', $customer['id']);
        $stmt->execute();
        Response::success($stmt->fetchAll());
    }

    public function deletePaymentMethod($id)
    {
        $customer = $this->authenticateCustomer();
        $stmt = $this->db->prepare("DELETE FROM customer_payment_methods WHERE id = :id AND customer_id = :cid");
        $stmt->execute([':id' => $id, ':cid' => $customer['id']]);
        Response::success(null, 'Payment method removed');
    }

    public function forgotPassword()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['email']))
            Response::error('Email is required', 422);

        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email AND role = 'customer'");
        $stmt->execute([':email' => $data['email']]);
        $user = $stmt->fetch();

        // Always return success for security (don't leak registered emails)
        if ($user) {
            // Logic to generate token and send email would go here
            // For now, we'll just simulate a success response
        }

        Response::success(null, 'If an account exists with this email, you will receive a reset link shortly.');
    }

    // ─────────────────────────────────────────────
    //  GET SINGLE ORDER
    // ─────────────────────────────────────────────
    public function getOrder($id)
    {
        $customer = $this->authenticateCustomer();

        $stmt = $this->db->prepare("
            SELECT * FROM orders WHERE id = :id AND customer_email = :email
        ");
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':email', $customer['email']);
        $stmt->execute();
        $order = $stmt->fetch();

        if (!$order) {
            Response::notFound('Order not found');
        }

        // Get order items
        $stmt2 = $this->db->prepare("
            SELECT oi.*, p.name as product_name, p.slug as product_slug
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = :order_id
        ");
        $stmt2->bindParam(':order_id', $id);
        $stmt2->execute();
        $order['items'] = $stmt2->fetchAll();

        Response::success($order);
    }

    // ─────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────
    private function authenticateCustomer()
    {
        $headers = getallheaders();

        if (!isset($headers['Authorization'])) {
            Response::unauthorized('No authorization token provided');
        }

        $authHeader = $headers['Authorization'];
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::unauthorized('Invalid authorization format');
        }

        $token = $matches[1];

        try {
            $payload = JWT::decode($token);

            if (empty($payload['customer_id'])) {
                Response::unauthorized('Invalid customer token');
            }

            $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id AND is_active = 1");
            $stmt->bindParam(':id', $payload['customer_id']);
            $stmt->execute();
            $user = $stmt->fetch();

            if (!$user) {
                Response::unauthorized('Customer not found or inactive');
            }

            return $user;

        } catch (Exception $e) {
            Response::unauthorized('Invalid or expired token');
        }
    }

    private function generateToken(array $user): string
    {
        return JWT::encode([
            'customer_id' => $user['id'],
            'email' => $user['email'],
            'type' => 'customer'
        ]);
    }

    private function fetchUser(int $id): array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    private function formatUser(array $user): array
    {
        return [
            'id' => (int) $user['id'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'email' => $user['email'],
            'phone' => $user['phone'] ?? null,
            'created_at' => $user['created_at'] ?? null,
        ];
    }
}
