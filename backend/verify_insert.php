<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/FileUpload.php';

try {
    $db = (new Database())->getConnection();

    // Clear the table first to be sure
    $db->exec("TRUNCATE TABLE hero_sliders");
    echo "Table truncated.\n";

    $data = [
        [
            'title' => 'Test Slide 1',
            'subtitle' => 'Subtitle 1',
            'description' => 'Desc 1',
            'image' => 'img1.jpg',
            'cta_text' => 'CTA 1',
            'cta_link' => 'link1',
            'badge' => 'Badge 1',
            'sort_order' => 0,
            'is_active' => 1
        ]
    ];

    foreach ($data as $index => $slide) {
        $stmt = $db->prepare("
            INSERT INTO hero_sliders (
                title, subtitle, description, image, cta_text, cta_link, badge, sort_order, is_active
            ) VALUES (
                :title, :subtitle, :description, :image, :cta_text, :cta_link, :badge, :sort_order, :is_active
            )
        ");

        $stmt->bindValue(':title', $slide['title'] ?? '');
        $stmt->bindValue(':subtitle', $slide['subtitle'] ?? '');
        $stmt->bindValue(':description', $slide['description'] ?? '');
        $stmt->bindValue(':image', $slide['image'] ?? '');
        $stmt->bindValue(':cta_text', $slide['cta_text'] ?? '');
        $stmt->bindValue(':cta_link', $slide['cta_link'] ?? '');
        $stmt->bindValue(':badge', $slide['badge'] ?? '');
        $stmt->bindValue(':sort_order', $index, PDO::PARAM_INT);
        $stmt->bindValue(':is_active', (int) ($slide['is_active'] ?? 1), PDO::PARAM_INT);

        $stmt->execute();
        echo "Inserted slide, ID: " . $db->lastInsertId() . "\n";
    }

    $stmt = $db->query("SELECT * FROM hero_sliders");
    $rows = $stmt->fetchAll();
    echo "Final count in DB: " . count($rows) . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
