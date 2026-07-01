<?php

/**
 * Settings Controller - SMTP, SEO, Stripe, Cart, and General Settings
 */
class SettingsController
{
    private $db;

    public function __construct()
    {
        $this->db = (new Database())->getConnection();
    }

    /**
     * Get all settings or by type
     */
    public function index()
    {
        AuthMiddleware::authenticate();

        $type = $_GET['type'] ?? '';

        $where = '1=1';
        $params = [];

        if (!empty($type)) {
            $where = "setting_type = :type";
            $params[':type'] = $type;
        }

        $stmt = $this->db->prepare("SELECT * FROM settings WHERE {$where} ORDER BY setting_type, setting_key");

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $settings = $stmt->fetchAll();

        // Group by type
        $grouped = [];
        foreach ($settings as $setting) {
            $type = $setting['setting_type'];
            if (!isset($grouped[$type])) {
                $grouped[$type] = [];
            }
            $val = $setting['setting_value'];
            $meta = [
                'value' => $val,
                'description' => $setting['description']
            ];

            // Add URL for images
            if (in_array($setting['setting_key'], ['site_logo', 'site_dark_logo', 'site_favicon', 'seo_og_image']) && !empty($val)) {
                if (!filter_var($val, FILTER_VALIDATE_URL)) {
                    $meta['url'] = FileUpload::getUrl($val);
                } else {
                    $meta['url'] = $val;
                }
            }

            $grouped[$type][$setting['setting_key']] = $meta;
        }

        Response::success($grouped);
    }

    /**
     * Get single setting
     */
    public function show($key)
    {
        $stmt = $this->db->prepare("SELECT * FROM settings WHERE setting_key = :key");
        $stmt->bindParam(':key', $key);
        $stmt->execute();

        $setting = $stmt->fetch();

        if (!$setting) {
            Response::notFound('Setting not found');
        }

        Response::success($setting);
    }

    /**
     * Get public settings (no auth required)
     * Used for frontend-accessible settings like reCAPTCHA site key
     */
    public function getPublic()
    {
        $stmt = $this->db->prepare(
            "SELECT setting_key, setting_value FROM settings 
             WHERE setting_key IN ('recaptcha_site_key', 'site_name', 'site_tagline', 'contact_email')"
        );
        $stmt->execute();
        $settings = $stmt->fetchAll();

        $result = [];
        foreach ($settings as $setting) {
            $result[$setting['setting_key']] = $setting['setting_value'];
        }

        Response::success($result);
    }

    /**
     * Update settings (bulk or single)
     */
    public function update()
    {
        $user = AuthMiddleware::authenticate();

        // Handle logo/favicon uploads
        $data = $_POST;

        // Handle file uploads for appearance settings
        if (isset($_FILES['site_logo']) && $_FILES['site_logo']['error'] === UPLOAD_ERR_OK) {
            $data['site_logo'] = FileUpload::upload($_FILES['site_logo'], 'settings');
        }

        if (isset($_FILES['site_dark_logo']) && $_FILES['site_dark_logo']['error'] === UPLOAD_ERR_OK) {
            $data['site_dark_logo'] = FileUpload::upload($_FILES['site_dark_logo'], 'settings');
        }

        if (isset($_FILES['site_favicon']) && $_FILES['site_favicon']['error'] === UPLOAD_ERR_OK) {
            $data['site_favicon'] = FileUpload::upload($_FILES['site_favicon'], 'settings');
        }

        if (isset($_FILES['seo_og_image']) && $_FILES['seo_og_image']['error'] === UPLOAD_ERR_OK) {
            $data['seo_og_image'] = FileUpload::upload($_FILES['seo_og_image'], 'settings');
        }

        // If no POST data, try JSON
        if (empty($data)) {
            $data = json_decode(file_get_contents("php://input"), true);
        }

        if (empty($data)) {
            Response::error('No data provided', 400);
        }

        try {
            $this->db->beginTransaction();

            foreach ($data as $key => $value) {
                // Skip if not a setting
                if (in_array($key, ['action', 'token']) || (strlen($key) > 4 && substr($key, -4) === '_url')) {
                    continue;
                }

                // Update or insert
                $stmt = $this->db->prepare("
                    INSERT INTO settings (setting_key, setting_value) 
                    VALUES (:key, :value) 
                    ON DUPLICATE KEY UPDATE setting_value = :value
                ");

                $stmt->bindValue(':key', $key);
                $stmt->bindValue(':value', $value);
                $stmt->execute();
            }

            $this->db->commit();

            // Log activity
            $this->logActivity($user['id'], 'update_settings', 'settings', null);

            Response::success(null, 'Settings updated successfully');
        } catch (Exception $e) {
            $this->db->rollBack();
            Response::serverError('Failed to update settings: ' . $e->getMessage());
        }
    }

    /**
     * Get public settings (for frontend)
     */
    public function getPublic()
    {
        $publicKeys = [
            'site_name',
            'site_tagline',
            'site_logo',
            'site_dark_logo',
            'site_favicon',
            'contact_email',
            'contact_phone',
            'currency',
            'currency_symbol',
            'cart_enabled',
            'guest_checkout_enabled',
            'stripe_enabled',
            'seo_meta_title',
            'seo_meta_description',
            'seo_meta_keywords',
            'seo_og_image',
            'shipping_fee',
            'shipping_free_threshold',
            'stripe_publishable_key',
            'facebook_pixel_id',
            'google_analytics_id'
        ];

        $placeholders = implode(',', array_fill(0, count($publicKeys), '?'));
        $stmt = $this->db->prepare("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ({$placeholders})");
        $stmt->execute($publicKeys);

        $settings = [];
        while ($row = $stmt->fetch()) {
            $value = $row['setting_value'];

            // Convert relative image paths to absolute URLs
            if (in_array($row['setting_key'], ['site_logo', 'site_dark_logo', 'site_favicon', 'seo_og_image']) && !empty($value)) {
                // Check if it's already an absolute URL
                if (!filter_var($value, FILTER_VALIDATE_URL)) {
                    $value = FileUpload::getUrl($value);
                }
            }

            $settings[$row['setting_key']] = $value;
        }

        Response::success($settings);
    }

    /**
     * Test SMTP Connection
     */
    public function testSMTP()
    {
        $user = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        // Get SMTP settings
        $smtp = [
            'host' => $data['smtp_host'] ?? '',
            'port' => $data['smtp_port'] ?? 587,
            'username' => $data['smtp_username'] ?? '',
            'password' => $data['smtp_password'] ?? '',
            'encryption' => $data['smtp_encryption'] ?? 'tls',
            'from_email' => $data['smtp_from_email'] ?? '',
            'from_name' => $data['smtp_from_name'] ?? '',
        ];

        try {
            // TODO: Implement actual SMTP test using PHPMailer or similar
            // For now, just validate the settings
            if (empty($smtp['host']) || empty($smtp['username']) || empty($smtp['password'])) {
                Response::error('Missing required SMTP settings', 400);
            }

            Response::success(null, 'SMTP configuration is valid (test email not sent in demo)');
        } catch (Exception $e) {
            Response::error('SMTP test failed: ' . $e->getMessage(), 400);
        }
    }

    /**
     * Helper: Log activity
     */
    private function logActivity($userId, $action, $entityType = null, $entityId = null)
    {
        $stmt = $this->db->prepare("
            INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address, user_agent) 
            VALUES (:user_id, :action, :entity_type, :entity_id, :ip, :user_agent)
        ");

        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt->bindValue(':user_id', $userId);
        $stmt->bindValue(':action', $action);
        $stmt->bindValue(':entity_type', $entityType);
        $stmt->bindValue(':entity_id', $entityId);
        $stmt->bindValue(':ip', $ip);
        $stmt->bindValue(':user_agent', $userAgent);

        $stmt->execute();
    }
}
