<?php
/**
 * File Upload Utility
 */
class FileUpload
{

    /**
     * Upload single file
     */
    public static function upload($file, $destination = 'general', $allowedTypes = null)
    {
        // Check for PHP upload errors
        if (isset($file['error']) && $file['error'] !== UPLOAD_ERR_OK) {
            $errors = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize in php.ini',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE in HTML form',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
            ];
            $message = $errors[$file['error']] ?? 'Unknown upload error';
            throw new Exception($message);
        }

        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception('Invalid file upload or file not found');
        }

        // Check file size (Disabled)
        // if ($file['size'] > MAX_FILE_SIZE) {
        //     throw new Exception('File size exceeds maximum allowed size');
        // }

        // Check file type
        $fileType = mime_content_type($file['tmp_name']);
        $allowed = $allowedTypes ?? ALLOWED_IMAGE_TYPES;

        if (!in_array($fileType, $allowed)) {
            throw new Exception('File type not allowed');
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;

        // Create destination directory if it doesn't exist
        $uploadDir = UPLOAD_PATH . $destination . '/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filepath = $uploadDir . $filename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new Exception('Failed to move uploaded file');
        }

        // Return relative path
        return $destination . '/' . $filename;
    }

    /**
     * Upload multiple files
     */
    public static function uploadMultiple($files, $destination = 'general', $allowedTypes = null)
    {
        $uploadedFiles = [];

        foreach ($files['tmp_name'] as $key => $tmp_name) {
            $file = [
                'name' => $files['name'][$key],
                'type' => $files['type'][$key],
                'tmp_name' => $tmp_name,
                'error' => $files['error'][$key],
                'size' => $files['size'][$key]
            ];

            try {
                $uploadedFiles[] = self::upload($file, $destination, $allowedTypes);
            } catch (Exception $e) {
                // Continue with other files
                continue;
            }
        }

        return $uploadedFiles;
    }

    /**
     * Delete file
     */
    public static function delete($filepath)
    {
        $fullPath = UPLOAD_PATH . $filepath;

        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }

        return false;
    }

    public static function getUrl($filepath)
    {
        if (empty($filepath)) {
            return null;
        }

        // If it's already a full URL, return it
        if (strpos($filepath, 'http://') === 0 || strpos($filepath, 'https://') === 0) {
            return $filepath;
        }

        // Return absolute URL for better compatibility with frontend
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

        // Dynamically determine the script directory to handle different installation paths
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $baseDir = str_replace('\\', '/', dirname($scriptName));
        $baseDir = rtrim($baseDir, '/');

        // Construct the base URL for uploads
        $baseUrl = $protocol . '://' . $host . $baseDir . '/uploads/';

        return $baseUrl . ltrim($filepath, '/');
    }
}
