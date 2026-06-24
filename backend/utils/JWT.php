<?php
/**
 * JWT (JSON Web Token) Utility
 */
class JWT
{

    /**
     * Generate JWT token
     */
    public static function encode($payload)
    {
        $header = [
            'typ' => 'JWT',
            'alg' => JWT_ALGORITHM
        ];

        // Add expiration
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRATION;

        $segments = [];
        $segments[] = self::base64UrlEncode(json_encode($header));
        $segments[] = self::base64UrlEncode(json_encode($payload));

        $signing_input = implode('.', $segments);
        $signature = self::sign($signing_input, JWT_SECRET_KEY);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    /**
     * Decode JWT token
     */
    public static function decode($token)
    {
        $segments = explode('.', $token);

        if (count($segments) !== 3) {
            throw new Exception('Invalid token format');
        }

        list($header64, $payload64, $signature64) = $segments;

        // Verify signature
        $signing_input = $header64 . '.' . $payload64;
        $signature = self::base64UrlDecode($signature64);

        if (!self::verify($signing_input, $signature, JWT_SECRET_KEY)) {
            throw new Exception('Invalid signature');
        }

        $payload = json_decode(self::base64UrlDecode($payload64), true);

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token has expired');
        }

        return $payload;
    }

    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($data)
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     */
    private static function base64UrlDecode($data)
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Sign data
     */
    private static function sign($data, $key)
    {
        return hash_hmac('sha256', $data, $key, true);
    }

    /**
     * Verify signature
     */
    private static function verify($data, $signature, $key)
    {
        $hash = self::sign($data, $key);
        return hash_equals($signature, $hash);
    }
}
