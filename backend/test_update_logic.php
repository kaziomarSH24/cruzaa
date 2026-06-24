<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/FileUpload.php';
require_once __DIR__ . '/controllers/HeroSliderController.php';

class AuthMiddleware
{
    public static function authenticate()
    {
        return ['id' => 1];
    }
}

$controller = new HeroSliderController();

// Simulate POST payload
$data = [
    [
        'id' => 5, // Existing one
        'title' => 'Updated Title',
        'subtitle' => 'Updated Subtitle',
        'description' => 'Updated Desc',
        'image' => '',
        'cta_text' => 'Shop',
        'cta_link' => '/',
        'badge' => 'Hot',
        'is_active' => 1
    ],
    [
        // New one
        'title' => 'New Dynamic Slide',
        'subtitle' => 'New Dynamic Subtitle',
        'description' => 'New Dynamic Desc',
        'image' => '',
        'cta_text' => 'Buy',
        'cta_link' => '/buy',
        'badge' => 'New',
        'is_active' => 1
    ]
];

$_SERVER['REQUEST_METHOD'] = 'POST';
$json = json_encode($data);

// We need to mock php://input. In PHP we can't easily mock it for a script.
// But we can modify updateAll to accept data if we really wanted to test it this way.
// Alternatively, let's just run the logic manually here to see if it works.

echo "--- Testing updateAll logic manually ---\n";

try {
    $db = (new Database())->getConnection();
    $db->beginTransaction();

    $stmt = $db->query("SELECT id FROM hero_sliders");
    $existingIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $existingIds = array_map('strval', $existingIds);

    echo "Existing IDs: " . implode(', ', $existingIds) . "\n";

    $newIds = [];
    foreach ($data as $slide) {
        if (isset($slide['id']) && $slide['id'] !== null && $slide['id'] !== '') {
            $newIds[] = strval($slide['id']);
        }
    }

    $idsToDelete = array_diff($existingIds, $newIds);
    echo "IDs to delete: " . implode(', ', $idsToDelete) . "\n";

    foreach ($data as $index => $slide) {
        $id = isset($slide['id']) ? strval($slide['id']) : null;
        $isUpdate = ($id !== null && in_array($id, $existingIds));

        if ($isUpdate) {
            echo "Updating ID $id...\n";
            $stmt = $db->prepare("UPDATE hero_sliders SET title = :title WHERE id = :id");
            $stmt->bindValue(':id', $id);
        } else {
            echo "Inserting new slide...\n";
            $stmt = $db->prepare("INSERT INTO hero_sliders (title, subtitle, description, image, cta_text, cta_link, badge, sort_order, is_active) VALUES (:title, :subtitle, :description, :image, :cta_text, :cta_link, :badge, :sort_order, :is_active)");
        }

        $stmt->bindValue(':title', $slide['title']);
        if (!$isUpdate) {
            $stmt->bindValue(':subtitle', $slide['subtitle']);
            $stmt->bindValue(':description', $slide['description']);
            $stmt->bindValue(':image', $slide['image']);
            $stmt->bindValue(':cta_text', $slide['cta_text']);
            $stmt->bindValue(':cta_link', $slide['cta_link']);
            $stmt->bindValue(':badge', $slide['badge']);
            $stmt->bindValue(':sort_order', $index, PDO::PARAM_INT);
            $stmt->bindValue(':is_active', (int) ($slide['is_active'] ?? 1), PDO::PARAM_INT);
        }

        $stmt->execute();
    }

    $db->commit();
    echo "Success!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
