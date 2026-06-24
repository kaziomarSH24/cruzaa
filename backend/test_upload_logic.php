<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/utils/FileUpload.php';

// Prepare a mock file
$tmpFile = tempnam(sys_get_temp_dir(), 'test');
file_put_contents($tmpFile, 'test content');

$file = [
    'name' => 'test_upload.txt',
    'type' => 'text/plain',
    'tmp_name' => $tmpFile,
    'error' => 0,
    'size' => filesize($tmpFile)
];

// We can't use is_uploaded_file because it's not a real upload.
// I'll temporarily disable that check in a copy of FileUpload or mock it.

try {
    // For testing, I'll bypass the is_uploaded_file check by making a copy of the utility
    $code = file_get_contents(__DIR__ . '/utils/FileUpload.php');
    $code = str_replace('is_uploaded_file($file[\'tmp_name\'])', 'true', $code);
    eval ('?>' . $code);

    $rel = FileUpload::upload($file, 'test_dest', ['text/plain']);
    echo "Relative path: $rel\n";
    $full = UPLOAD_PATH . $rel;
    echo "Full path: $full\n";
    echo "Exists: " . (file_exists($full) ? 'Yes' : 'No') . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} finally {
    if (file_exists($tmpFile))
        unlink($tmpFile);
}
