<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'cruzaa_admin');
define('DB_USER', 'root');
define('DB_PASS', '');

try {
    $db = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASS);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Clear existing footer links to avoid duplicates
    $db->exec("DELETE FROM navigation_menu WHERE menu_location = 'footer'");

    // 2. Define the links from the reference image
    $links = [
        // Column 1
        ['title' => 'Home', 'url' => '/', 'sort_order' => 1],
        ['title' => 'Limited Edition E Scooters', 'url' => '/products/limited-edition-e-scooters', 'sort_order' => 2],
        ['title' => 'E Scooters', 'url' => '/products/electric-scooters', 'sort_order' => 3],
        ['title' => 'E-Bikes', 'url' => '/products/electric-bikes', 'sort_order' => 4],
        ['title' => 'Cruzaa Family', 'url' => '/cruzaa-family', 'sort_order' => 5],
        ['title' => 'Our Story', 'url' => '/our-story', 'sort_order' => 6],
        
        // Column 2
        ['title' => 'Cycle to Work Scheme', 'url' => '/cycle-to-work-scheme', 'sort_order' => 7],
        ['title' => 'Wholesale', 'url' => '/joinus', 'sort_order' => 8],
        ['title' => 'Contact Us', 'url' => '/contact', 'sort_order' => 9],
        ['title' => 'Terms & Conditions', 'url' => '/terms', 'sort_order' => 10],
        ['title' => 'Privacy Policy', 'url' => '/privacy', 'sort_order' => 11],
    ];

    $stmt = $db->prepare("INSERT INTO navigation_menu (title, url, menu_location, sort_order, is_active) VALUES (?, ?, 'footer', ?, 1)");

    foreach ($links as $link) {
        $stmt->execute([$link['title'], $link['url'], $link['sort_order']]);
        echo "Inserted: " . $link['title'] . "\n";
    }

    echo "Footer navigation synced successfully.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
