<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/utils/FileUpload.php';

echo "UPLOAD_PATH: " . UPLOAD_PATH . "\n";
echo "Exists: " . (file_exists(UPLOAD_PATH) ? 'Yes' : 'No') . "\n";

// List contents of uploads
function list_dir($dir)
{
    echo "Listing $dir:\n";
    if (!file_exists($dir))
        return;
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..')
            continue;
        $path = $dir . '/' . $file;
        echo " - $file " . (is_dir($path) ? '[DIR]' : '[' . filesize($path) . ' bytes]') . "\n";
        if (is_dir($path))
            list_dir($path);
    }
}

list_dir(UPLOAD_PATH);

echo "\n--- Testing FileUpload::getUrl ---\n";
// Mock SERVER variables for consistent testing
$_SERVER['HTTP_HOST'] = 'localhost:8001';
$_SERVER['HTTPS'] = 'off';

echo "getUrl('images/test.jpg'): " . FileUpload::getUrl('images/test.jpg') . "\n";
