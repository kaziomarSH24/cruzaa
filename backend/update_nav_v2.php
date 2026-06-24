<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $updates = [
        'Denim Blue' => '/product/cruzaa-e-scooter-limited-edition-denim-blue-with-built-in-speakers-bluetooth',
        'Magno Green' => '/product/cruzaa-e-scooter-limited-edition-mango-green-with-built-in-speakers-bluetooth',
        'Pro Cabon Black ' => '/product/cruzaa-e-scooter-pro-carbon-black-with-built-in-speakers-bluetooth',
        'Pro Racing White' => '/product/cruzaa-e-scooter-pro-racing-white-with-built-in-speakers-bluetooth',
        'Cruzaa Carbon Black' => '/product/cruzaa-e-scooter-carbon-black-with-built-in-speakers-bluetooth',
        'Cruzaa Racing White' => '/product/cruzaa-e-scooter-racing-white-with-built-in-speakers-bluetooth',
        'Commuta' => '/product/the-commuta-e-scooter-45km-range-25kmh-top-speed',
        'Commuta Pro Max' => '/product/the-pro-max-commuta-e-scooter',
        'Cycle 2 Work' => '/pages/cycle-to-work-scheme',
        'Limited Edition' => '/products/limited-editions',
        'E-Scooters' => '/products/electric-scooter',
        'E-Bikes' => '/products/electric-bike',
        'Carbon Black' => '/product/the-cruzaa-e-bike-carbon-black-with-built-in-speakers-bluetooth',
        'Racing White' => '/product/the-cruzaa-e-bike-racing-white-with-built-in-speakers-bluetooth',
        'Solarbeam Yellow' => '/product/the-cruzaa-e-bike-solarbeam-yellow-with-built-in-speakers-bluetooth',
        'Gunmetal Grey' => '/product/the-cruzaa-e-bike-gunmetal-grey-with-built-in-speakers-bluetooth'
    ];

    foreach ($updates as $title => $url) {
        $stmt = $db->prepare("UPDATE navigation_menu SET url = ? WHERE title = ?");
        $stmt->execute([$url, $title]);
        echo "Updated Nav: $title -> $url\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
