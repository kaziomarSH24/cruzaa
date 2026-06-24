<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/FileUpload.php';
require_once __DIR__ . '/controllers/HeroSliderController.php';

// Mock AuthMiddleware to avoid token requirement for this test
class AuthMiddleware
{
    public static function authenticate()
    {
        return ['id' => 1];
    }
}

$_GET['admin'] = 'true';
$controller = new HeroSliderController();

echo "--- Simulating GET /hero-slider?admin=true ---\n";
try {
    // We need to capture the output of Response::success
    ob_start();
    $controller->index();
    $output = ob_get_clean();
    echo $output;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
