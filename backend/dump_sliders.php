<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = (new Database())->getConnection();

    $stmt = $db->query("SELECT * FROM hero_sliders");
    $hero_sliders = $stmt->fetchAll();

    $result = [
        'hero_sliders_count' => count($hero_sliders),
        'hero_sliders' => $hero_sliders,
    ];

    $stmt = $db->prepare("SELECT * FROM dynamic_content WHERE content_key = 'homepage_slider'");
    $stmt->execute();
    $content_slider = $stmt->fetch();
    if ($content_slider) {
        $result['dynamic_content_slider'] = json_decode($content_slider['content_value'], true);
    }

    file_put_contents('slider_dump.json', json_encode($result, JSON_PRETTY_PRINT));
    echo "Dumped to slider_dump.json";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
