<?php
/**
 * Upload Controller - Handle File Uploads
 */
class UploadController
{
    /**
     * Upload Image
     */
    public function uploadImage()
    {
        AuthMiddleware::authenticate();

        if (!isset($_FILES['image'])) {
            Response::error('No image file provided', 400);
        }

        try {
            $file = $_FILES['image'];
            // Use FileUpload utility
            $relative_path = FileUpload::upload($file, 'images');
            $url = FileUpload::getUrl($relative_path);

            Response::success(['url' => $url], 'Image uploaded successfully');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
