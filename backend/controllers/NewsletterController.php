<?php

/**
 * Newsletter Controller
 * Handles newsletter subscription management and email sending
 */

require_once __DIR__ . '/../utils/MailHelper.php';

class NewsletterController
{
    private $conn;
    private $table = 'newsletters';

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Subscribe to newsletter
     * POST /api/newsletter/subscribe
     */
    public function subscribe()
    {
        // Get JSON data
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->email) || empty($data->email)) {
            Response::error('Email is required', 400);
            return;
        }

        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email format', 400);
            return;
        }

        try {
            // Check if already subscribed
            $checkSql = "SELECT id, status FROM {$this->table} WHERE email = ?";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute([$email]);
            $existing = $checkStmt->fetch();

            if ($existing) {
                // If already subscribed and active, skip
                if ($existing['status'] === 'active') {
                    Response::success(
                        ['message' => 'Already subscribed'],
                        'You are already subscribed to our newsletter'
                    );
                    return;
                }
                // If unsubscribed before, reactivate
                $updateSql = "UPDATE {$this->table} SET status = 'active', updated_at = NOW() WHERE email = ?";
                $updateStmt = $this->conn->prepare($updateSql);
                $updateStmt->execute([$email]);
            } else {
                // Insert new subscription
                $insertSql = "INSERT INTO {$this->table} (email, status) VALUES (?, 'active')";
                $insertStmt = $this->conn->prepare($insertSql);
                $insertStmt->execute([$email]);
            }

            // Send confirmation email to user
            $this->sendUserConfirmationEmail($email);

            // Send notification email to admin
            $this->sendAdminNotificationEmail($email);

            Response::success(
                ['email' => $email],
                'Thank you for subscribing! Check your email for confirmation.',
                201
            );
        } catch (Exception $e) {
            error_log("Newsletter subscription error: " . $e->getMessage());
            Response::error('Subscription failed', 500);
        }
    }

    /**
     * Send confirmation email to user
     */
    private function sendUserConfirmationEmail($email)
    {
        $subject = 'Thank You for Subscribing to Cruzaa Newsletter';

        $htmlBody = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background-color: #ff0000; padding: 30px; text-align: center; color: white;'>
                <h1 style='margin: 0; font-size: 28px;'>Cruzaa</h1>
            </div>
            
            <div style='padding: 40px; background-color: #ffffff; border: 1px solid #f0f0f0;'>
                <p style='font-size: 16px; color: #333; margin: 0 0 20px 0;'>Hi there,</p>
                
                <p style='font-size: 15px; color: #555; line-height: 1.8; margin: 0 0 20px 0;'>
                    Thank you for subscribing to the Cruzaa newsletter. You will now be the first to know about our latest news, exclusive offers, and upcoming events.
                </p>
                
                <p style='font-size: 15px; color: #555; line-height: 1.8; margin: 0 0 30px 0;'>
                    Keep an eye on your inbox for exciting updates!
                </p>
                
                <p style='font-size: 13px; color: #999; margin: 30px 0 0 0; border-top: 1px solid #f0f0f0; padding-top: 20px;'>
                    Best regards,<br/>
                    <strong style='color: #333;'>The Cruzaa Team</strong>
                </p>
            </div>
            
            <div style='background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888;'>
                <p style='margin: 0;'>
                    <a href='https://cruzaa.com' style='color: #ff0000; text-decoration: none; margin: 0 15px;'>Visit Website</a> | 
                    <a href='https://instagram.com/cruzaa_life' style='color: #ff0000; text-decoration: none; margin: 0 15px;'>Follow Us</a>
                </p>
            </div>
        </div>
        ";

        sendSmtpEmail($this->conn, $email, $subject, $htmlBody);
    }

    /**
     * Send notification email to admin
     */
    private function sendAdminNotificationEmail($email)
    {
        // Get admin email from settings
        try {
            $stmt = $this->conn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'admin_email' LIMIT 1");
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $adminEmail = $result['setting_value'] ?? 'hi@cruzaa.com';
        } catch (Exception $e) {
            $adminEmail = 'hi@cruzaa.com';
        }

        $subject = 'New Newsletter Subscription';

        $htmlBody = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background-color: #ff0000; padding: 20px; text-align: center; color: white;'>
                <h2 style='margin: 0;'>New Subscriber Alert</h2>
            </div>
            
            <div style='padding: 30px; background-color: #f5f5f5;'>
                <p style='font-size: 16px; color: #333;'>Hello Admin,</p>
                
                <p style='font-size: 14px; color: #666; line-height: 1.6;'>
                    A new email has subscribed to your newsletter:
                </p>
                
                <div style='background-color: white; padding: 20px; border-left: 4px solid #ff0000; margin: 20px 0;'>
                    <p style='margin: 0; font-size: 14px; color: #333;'>
                        <strong>Email:</strong> {$email}
                    </p>
                    <p style='margin: 5px 0 0 0; font-size: 12px; color: #666;'>
                        <strong>Subscribed:</strong> " . date('Y-m-d H:i:s') . "
                    </p>
                </div>
                
                <p style='font-size: 12px; color: #999; margin-top: 30px;'>
                    You can manage newsletter subscribers from your admin panel.
                </p>
            </div>
        </div>
        ";

        sendSmtpEmail($this->conn, $adminEmail, $subject, $htmlBody);
    }

    /**
     * Get all subscribers (admin only)
     * GET /api/newsletter/subscribers
     */
    public function getSubscribers()
    {
        try {
            $sql = "SELECT email, status, subscribed_at FROM {$this->table} WHERE status = 'active' ORDER BY subscribed_at DESC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $subscribers = $stmt->fetchAll();

            Response::success(['subscribers' => $subscribers, 'total' => count($subscribers)]);
        } catch (Exception $e) {
            error_log("Newsletter error: " . $e->getMessage());
            Response::error('Failed to fetch subscribers', 500);
        }
    }

    /**
     * Unsubscribe from newsletter
     * POST /api/newsletter/unsubscribe
     */
    public function unsubscribe()
    {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->email) || empty($data->email)) {
            Response::error('Email is required', 400);
            return;
        }

        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);

        try {
            $sql = "UPDATE {$this->table} SET status = 'unsubscribed' WHERE email = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$email]);

            Response::success([], 'Unsubscribed successfully');
        } catch (Exception $e) {
            error_log("Newsletter unsubscribe error: " . $e->getMessage());
            Response::error('Unsubscribe failed', 500);
        }
    }
}
