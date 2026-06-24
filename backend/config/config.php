<?php
/**
 * Global Configuration
 */

// Handle OPTIONS preflight early if index.php didn't catch it
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Error reporting (Production: 0)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('UTC');

// App Settings
define('APP_NAME', 'Cruzaa Admin Panel');
define('APP_VERSION', '1.0.0');
define('DEFAULT_PAGE_SIZE', 10);
define('MAX_PAGE_SIZE', 100);

// Paths
define('BASE_PATH', dirname(__DIR__));
define('UPLOAD_PATH', BASE_PATH . '/uploads/');
define('LOGS_PATH', BASE_PATH . '/logs/');

// Create required directories
if (!file_exists(UPLOAD_PATH)) {
    mkdir(UPLOAD_PATH, 0777, true);
}
if (!file_exists(LOGS_PATH)) {
    mkdir(LOGS_PATH, 0777, true);
}

// JWT Settings
define('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400); // 24 hours

// Upload Settings
define('MAX_FILE_SIZE', 5242880); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

// Autoload classes
spl_autoload_register(function ($class_name) {
    $paths = [
        BASE_PATH . '/models/',
        BASE_PATH . '/controllers/',
        BASE_PATH . '/middleware/',
        BASE_PATH . '/utils/',
    ];

    foreach ($paths as $path) {
        $file = $path . $class_name . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});
