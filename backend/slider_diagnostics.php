<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = (new Database())->getConnection();

    echo "--- hero_sliders table ---\n";
    $stmt = $db->query("SELECT * FROM hero_sliders");
    $hero_sliders = $stmt->fetchAll();
    echo "Count: " . count($hero_sliders) . "\n";
    print_r($hero_sliders);

    echo "\n--- dynamic_content table (homepage_slider) ---\n";
    $stmt = $db->prepare("SELECT * FROM dynamic_content WHERE content_key = 'homepage_slider'");
    $stmt->execute();
    $content_slider = $stmt->fetch();
    if ($content_slider) {
        echo "Found in dynamic_content\n";
        print_r(json_decode($content_slider['content_value'], true));
    } else {
        echo "Not found in dynamic_content\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
