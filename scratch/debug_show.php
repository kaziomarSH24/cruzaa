<?php
require_once 'backend/config/Database.php';
require_once 'backend/config/config.php';
require_once 'backend/controllers/ProductController.php';
require_once 'backend/utils/Response.php';

// Mock server vars
$_SERVER['HTTP_HOST'] = 'localhost';
$_SERVER['SCRIPT_NAME'] = '/backend/index.php';
$_SERVER['REQUEST_METHOD'] = 'GET';

class DebugResponse extends Response {
    public static function success($data = null, $message = null, $code = 200) {
        echo json_encode($data, JSON_PRETTY_PRINT);
        exit;
    }
}

// Override Response if possible or just use a script that calls the controller logic
$db = (new Database())->getConnection();
$stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([10]);
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if ($product) {
    $productId = $product['id'];
    $stmt = $db->prepare("SELECT * FROM product_images WHERE product_id = :product_id ORDER BY sort_order");
    $stmt->bindParam(':product_id', $productId);
    $stmt->execute();
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($images as &$image) {
        $image['url'] = FileUpload::getUrl($image['image_url']);
    }
    $product['images'] = $images;
    echo json_encode($product, JSON_PRETTY_PRINT);
}
