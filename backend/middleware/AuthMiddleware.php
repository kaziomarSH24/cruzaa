<?php
/**
 * Authentication Middleware
 */
class AuthMiddleware
{

    /**
     * Verify JWT token and authenticate user
     */
    public static function authenticate()
    {
        $headers = getallheaders();

        if (!isset($headers['Authorization'])) {
            Response::unauthorized('No authorization token provided');
        }

        $authHeader = $headers['Authorization'];

        // Extract token from "Bearer <token>"
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::unauthorized('Invalid authorization format');
        }

        $token = $matches[1];

        try {
            $payload = JWT::decode($token);

            // Verify user exists and is active
            $db = (new Database())->getConnection();
            $stmt = $db->prepare("SELECT * FROM admin_users WHERE id = :id AND is_active = 1");
            $stmt->bindParam(':id', $payload['user_id']);
            $stmt->execute();

            $user = $stmt->fetch();

            if (!$user) {
                Response::unauthorized('User not found or inactive');
            }

            // Store user in global variable
            $GLOBALS['current_user'] = $user;

            return $user;

        } catch (Exception $e) {
            Response::unauthorized('Invalid or expired token: ' . $e->getMessage());
        }
    }

    /**
     * Alias for authenticate()
     */
    public static function requireAuth()
    {
        return self::authenticate();
    }

    /**
     * Check if user has required role
     */
    public static function requireRole($roles = [])
    {
        $user = self::authenticate();

        if (!in_array($user['role'], $roles)) {
            Response::forbidden('Insufficient permissions');
        }

        return $user;
    }

    /**
     * Get current authenticated user
     */
    public static function getCurrentUser()
    {
        return $GLOBALS['current_user'] ?? null;
    }

    /**
     * Check if request is authenticated (doesn't exit on fail)
     */
    public static function isAuthenticated()
    {
        if (self::getCurrentUser())
            return true;

        $headers = getallheaders();
        if (!isset($headers['Authorization']))
            return false;

        $authHeader = $headers['Authorization'];
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches))
            return false;

        try {
            $token = $matches[1];
            $payload = JWT::decode($token);
            $db = (new Database())->getConnection();
            $stmt = $db->prepare("SELECT id FROM admin_users WHERE id = :id AND is_active = 1");
            $stmt->bindParam(':id', $payload['user_id']);
            $stmt->execute();
            return (bool) $stmt->fetch();
        } catch (Exception $e) {
            return false;
        }
    }
}
