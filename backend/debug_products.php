<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/utils/FileUpload.php';

// Mock Auth
class AuthMiddleware
{
    public static function authenticate()
    {
        return ['id' => 1];
    }
    public static function isAuthenticated()
    {
        return true;
    }
}

try {
    $ctrl = new ProductController();
    $_GET['page'] = 1;
    $_GET['limit'] = 10;

    // We need to capture the response because Response::success calls exit()
    // But since this is a CLI script, we just want to see if it even runs without error.

    echo "Attempting to fetch products...\n";
    $ctrl->index();
} catch (Exception $e) {
    echo "Caught: " . $e->getMessage() . "\n";
}
