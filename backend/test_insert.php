<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/FileUpload.php';

class MockAuth
{
    public static function authenticate()
    {
        return ['id' => 1];
    }
}

try {
    $db = (new Database())->getConnection();
    $data = [
        [
            'title' => 'Test Slide ' . time(),
            'subtitle' => 'Test Subtitle',
            'description' => 'Test Description',
            'image' => 'test.jpg',
            'cta_text' => 'Shop Now',
            'cta_link' => '/products',
            'badge' => 'New',
            'is_active' => 1
        ]
    ];

    $existingIds = $db->query("SELECT id FROM hero_sliders")->fetchAll(PDO::FETCH_COLUMN);
    $newIds = array_filter(array_column($data, 'id'));

    foreach ($data as $index => $slide) {
        $stmt = $db->prepare("
            INSERT INTO hero_sliders (
                title, subtitle, description, image, cta_text, cta_link, badge, sort_order, is_active
            ) VALUES (
                :title, :subtitle, :description, :image, :cta_text, :cta_link, :badge, :sort_order, :is_active
            )
        ");

        $stmt->bindValue(':title', $slide['title']);
        $stmt->bindValue(':subtitle', $slide['subtitle']);
        $stmt->bindValue(':description', $slide['description']);
        $stmt->bindValue(':image', $slide['image']);
        $stmt->bindValue(':cta_text', $slide['cta_text']);
        $stmt->bindValue(':cta_link', $slide['cta_link']);
        $stmt->bindValue(':badge', $slide['badge']);
        $stmt->bindValue(':sort_order', $index);
        $stmt->bindValue(':is_active', 1, PDO::PARAM_INT);

        $stmt->execute();
    }

    echo "Successfully inserted test slide. New count: " . $db->query("SELECT COUNT(*) FROM hero_sliders")->fetchColumn();

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
