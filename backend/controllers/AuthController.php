<?php
/**
 * Authentication Controller
 */
class AuthController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Admin Login
     */
    public function login()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate input
        $validator = new Validator($data);
        $validator->required('email')->email('email')
            ->required('password');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        $email = $data['email'];
        $password = $data['password'];

        // Get user
        $stmt = $this->db->prepare("SELECT * FROM admin_users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            Response::error('Invalid credentials', 401);
        }

        if (!$user['is_active']) {
            Response::error('Account is inactive', 403);
        }

        // Check if 2FA is enabled
        if ($user['two_fa_enabled']) {
            // Return temporary token for 2FA verification
            $tempToken = JWT::encode([
                'user_id' => $user['id'],
                'temp' => true,
                'purpose' => '2fa_verification'
            ]);

            Response::success([
                'requires_2fa' => true,
                'temp_token' => $tempToken
            ], '2FA verification required');
        }

        // Update last login
        $stmt = $this->db->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = :id");
        $stmt->bindParam(':id', $user['id']);
        $stmt->execute();

        // Generate JWT token
        $token = JWT::encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ]);

        // Log activity
        $this->logActivity($user['id'], 'login', 'admin_users', $user['id']);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role']
            ]
        ], 'Login successful');
    }

    /**
     * Verify 2FA Code
     */
    public function verify2FA()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator($data);
        $validator->required('temp_token')
            ->required('code');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $payload = JWT::decode($data['temp_token']);

            if (!isset($payload['temp']) || $payload['purpose'] !== '2fa_verification') {
                Response::error('Invalid verification token', 401);
            }

            // Get user
            $stmt = $this->db->prepare("SELECT * FROM admin_users WHERE id = :id");
            $stmt->bindParam(':id', $payload['user_id']);
            $stmt->execute();

            $user = $stmt->fetch();

            if (!$user) {
                Response::error('User not found', 404);
            }

            // Verify 2FA code
            if (!TwoFactorAuth::verifyCode($user['two_fa_secret'], $data['code'])) {
                Response::error('Invalid 2FA code', 401);
            }

            // Update last login
            $stmt = $this->db->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = :id");
            $stmt->bindParam(':id', $user['id']);
            $stmt->execute();

            // Generate full access token
            $token = JWT::encode([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role']
            ]);

            // Log activity
            $this->logActivity($user['id'], 'login_2fa', 'admin_users', $user['id']);

            Response::success([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role']
                ]
            ], 'Login successful');

        } catch (Exception $e) {
            Response::error('Invalid or expired token', 401);
        }
    }

    /**
     * Get Current User Profile
     */
    public function getProfile()
    {
        $user = AuthMiddleware::authenticate();

        Response::success([
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role'],
            'two_fa_enabled' => (bool) $user['two_fa_enabled'],
            'last_login' => $user['last_login'],
            'created_at' => $user['created_at']
        ]);
    }

    /**
     * Update Profile Info
     */
    public function updateProfile()
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate
        $validator = new Validator($data);
        $validator->required('full_name')
            ->required('email')->email('email')
            ->unique('email', 'admin_users', 'email', $user['id']);

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        try {
            $stmt = $this->db->prepare("
                UPDATE admin_users SET 
                    full_name = :full_name,
                    email = :email
                WHERE id = :id
            ");

            $stmt->bindValue(':full_name', $data['full_name']);
            $stmt->bindValue(':email', $data['email']);
            $stmt->bindValue(':id', $user['id'], PDO::PARAM_INT);

            $stmt->execute();

            $this->logActivity($user['id'], 'update_profile', 'admin_users', $user['id']);

            Response::success(null, 'Profile updated successfully');

        } catch (Exception $e) {
            Response::serverError('Failed to update profile: ' . $e->getMessage());
        }
    }

    /**
     * Update Password
     */
    public function updatePassword()
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate
        $validator = new Validator($data);
        $validator->required('current_password')
            ->required('new_password')->min('new_password', 8);

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        // Verify current password
        $stmt = $this->db->prepare("SELECT password FROM admin_users WHERE id = :id");
        $stmt->bindValue(':id', $user['id'], PDO::PARAM_INT);
        $stmt->execute();
        $storedUser = $stmt->fetch();

        if (!password_verify($data['current_password'], $storedUser['password'])) {
            Response::error('Incorrect current password', 400);
        }

        try {
            $newHashed = password_hash($data['new_password'], PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("UPDATE admin_users SET password = :password WHERE id = :id");
            $stmt->bindValue(':password', $newHashed);
            $stmt->bindValue(':id', $user['id'], PDO::PARAM_INT);
            $stmt->execute();

            $this->logActivity($user['id'], 'change_password', 'admin_users', $user['id']);

            Response::success(null, 'Password updated successfully');

        } catch (Exception $e) {
            Response::serverError('Failed to update password: ' . $e->getMessage());
        }
    }

    /**
     * Setup 2FA
     */
    public function setup2FA()
    {
        $user = AuthMiddleware::authenticate();

        // Generate new secret
        $secret = TwoFactorAuth::generateSecret();

        // Get QR code URL
        $qrCodeUrl = TwoFactorAuth::getQRCodeUrl($user['email'], $secret);

        // Store secret (but don't enable yet)
        $stmt = $this->db->prepare("UPDATE admin_users SET two_fa_secret = :secret WHERE id = :id");
        $stmt->bindParam(':secret', $secret);
        $stmt->bindParam(':id', $user['id']);
        $stmt->execute();

        Response::success([
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl
        ], '2FA setup initiated. Scan QR code and verify with a code to enable.');
    }

    /**
     * Enable 2FA (after verification)
     */
    public function enable2FA()
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator($data);
        $validator->required('code');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        // Verify code with stored secret
        if (!TwoFactorAuth::verifyCode($user['two_fa_secret'], $data['code'])) {
            Response::error('Invalid 2FA code', 401);
        }

        // Enable 2FA
        $stmt = $this->db->prepare("UPDATE admin_users SET two_fa_enabled = 1 WHERE id = :id");
        $stmt->bindParam(':id', $user['id']);
        $stmt->execute();

        $this->logActivity($user['id'], 'enable_2fa', 'admin_users', $user['id']);

        Response::success(null, '2FA enabled successfully');
    }

    /**
     * Disable 2FA
     */
    public function disable2FA()
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator($data);
        $validator->required('code');

        if ($validator->fails()) {
            Response::validationError($validator->errors());
        }

        // Verify code before disabling
        if (!TwoFactorAuth::verifyCode($user['two_fa_secret'], $data['code'])) {
            Response::error('Invalid 2FA code', 401);
        }

        // Disable 2FA
        $stmt = $this->db->prepare("UPDATE admin_users SET two_fa_enabled = 0, two_fa_secret = NULL WHERE id = :id");
        $stmt->bindParam(':id', $user['id']);
        $stmt->execute();

        $this->logActivity($user['id'], 'disable_2fa', 'admin_users', $user['id']);

        Response::success(null, '2FA disabled successfully');
    }

    /**
     * Log Activity
     */
    private function logActivity($userId, $action, $entityType = null, $entityId = null, $details = null)
    {
        $stmt = $this->db->prepare("
            INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent) 
            VALUES (:user_id, :action, :entity_type, :entity_id, :details, :ip, :user_agent)
        ");

        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        $detailsJson = $details ? json_encode($details) : null;

        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':action', $action);
        $stmt->bindParam(':entity_type', $entityType);
        $stmt->bindParam(':entity_id', $entityId);
        $stmt->bindParam(':details', $detailsJson);
        $stmt->bindParam(':ip', $ip);
        $stmt->bindParam(':user_agent', $userAgent);

        $stmt->execute();
    }
}
