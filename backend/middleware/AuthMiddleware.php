<?php

/**
 * Authentication Middleware
 */
class AuthMiddleware
{
    /**
     * Helper function to extract Authorization header safely (Nginx & Apache compatible)
     */
    private static function getBearerToken()
    {
        $headers = null;

        if (isset($_SERVER['HTTP_X_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_X_AUTHORIZATION']);
        }
        else if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        }
        // Nginx/FastCGI HTTP_AUTHORIZATION 
        else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        }
        // ৪. Fallback for Apache
        elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['X-Authorization'])) {
                $headers = trim($requestHeaders['X-Authorization']);
            } elseif (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        // Extract token from "Bearer <token>"
        if (!empty($headers)) {
            if (preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Verify JWT token and authenticate user
     */
    public static function authenticate()
    {
        // Use our new powerful token extractor
        $token = self::getBearerToken();

        if (!$token) {
            Response::unauthorized('No authorization token provided');
        }

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

        $token = self::getBearerToken();

        if (!$token)
            return false;

        try {
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
