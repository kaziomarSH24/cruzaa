<?php
require_once 'backend/config/Database.php';
require_once 'backend/config/config.php';

$db = (new Database())->getConnection();

function getSlug($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    return strtolower($text);
}

function uploadLocalFile($sourcePath, $destination = 'products') {
    $extension = pathinfo($sourcePath, PATHINFO_EXTENSION);
    $filename = 'imported_' . uniqid() . '_' . time() . '.' . $extension;
    $uploadDir = UPLOAD_PATH . $destination . '/';
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $destPath = $uploadDir . $filename;
    if (copy($sourcePath, $destPath)) {
        return $destination . '/' . $filename;
    }
    return null;
}

$mapping = [
    'E bikes/Solarbeam Yellow' => ['name' => 'The Cruzaa E-Bike Solarbeam Yellow with Built-in Speakers & Bluetooth'],
    'E bikes/Gunmetal Grey' => ['name' => 'The Cruzaa E-Bike Gunmetal Grey with Built-in Speakers & Bluetooth'],
    'E bikes/Racing White' => ['name' => 'The Cruzaa E-Bike Racing White with Built-in Speakers & Bluetooth'],
    'E bikes/Carbon Black' => ['name' => 'The Cruzaa E-Bike Carbon Black with Built-in Speakers & Bluetooth'],
    'Cruzaa E Scooter/Carbon Black' => ['name' => 'Cruzaa E-Scooter Carbon Black – with Built-in Speakers & Bluetooth'],
    'Cruzaa E Scooter/Racing White' => ['name' => 'Cruzaa E-Scooter Racing White – with Built-in Speakers & Bluetooth'],
    'Cruzaa Pro/Carbon Black' => ['name' => 'Cruzaa E-Scooter Pro Carbon Black – with Built-in Speakers & Bluetooth'],
    'Cruzaa Pro/Racing White' => ['name' => 'Cruzaa E-Scooter Pro Racing White – with Built-in Speakers & Bluetooth'],
    'Cruzaa Pro Max' => ['name' => 'The Commuta PRO Max E-Scooter 100km Range – 40kmh Top Speed'],
    'Cruzaa Commuta' => ['name' => 'Cruzaa Commuta E-Scooter', 'is_new' => true]
];

$results = [];

foreach ($mapping as $folder => $info) {
    $fullFolderPath = "content/" . $folder;
    if (!is_dir($fullFolderPath)) {
        $results[] = "Folder $fullFolderPath not found.";
        continue;
    }

    $productName = $info['name'];
    $stmt = $db->prepare("SELECT id FROM products WHERE name LIKE ? OR name LIKE ?");
    $searchTerm = "%" . str_replace('–', '-', $productName) . "%";
    $searchTerm2 = "%" . $productName . "%";
    $stmt->execute([$searchTerm, $searchTerm2]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        if (isset($info['is_new'])) {
            // Create new product
            $slug = getSlug($productName);
            $stmt = $db->prepare("INSERT INTO products (name, slug, category_id, price, stock_quantity, is_active) VALUES (?, ?, 3, 499.99, 50, 1)");
            $stmt->execute([$productName, $slug]);
            $productId = $db->lastInsertId();
            $results[] = "Created new product: $productName (ID: $productId)";
        } else {
            $results[] = "Product $productName not found in DB, skipping.";
            continue;
        }
    } else {
        $productId = $product['id'];
        $results[] = "Found existing product: $productName (ID: $productId)";
    }

    // Process images
    $files = scandir($fullFolderPath);
    $uploadedCount = 0;
    $firstImage = null;

    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $filePath = $fullFolderPath . "/" . $file;
        if (is_dir($filePath)) continue;

        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) continue;

        $relPath = uploadLocalFile($filePath);
        if ($relPath) {
            // Insert into product_images
            $stmt = $db->prepare("INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)");
            $stmt->execute([$productId, $relPath, $uploadedCount]);
            $uploadedCount++;
            if (!$firstImage) $firstImage = $relPath;
        }
    }

    // Update featured image if not set
    if ($firstImage) {
        $stmt = $db->prepare("UPDATE products SET featured_image = ? WHERE id = ? AND (featured_image IS NULL OR featured_image = '')");
        $stmt->execute([$firstImage, $productId]);
    }

    $results[] = "Uploaded $uploadedCount images for product ID $productId.";
}

echo implode("\n", $results);
