<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Clear existing footer nav
    $db->exec("DELETE FROM navigation_menu WHERE menu_location = 'footer'");

    $menus = [
        [
            'title' => 'Products',
            'children' => [
                ['title' => 'Electric Scooters', 'url' => '/products/electric-scooter'],
                ['title' => 'Electric Bikes', 'url' => '/products/electric-bike'],
            ]
        ],
        [
            'title' => 'Company',
            'children' => [
                ['title' => 'About Us', 'url' => '/our-story'],
                ['title' => 'Contact', 'url' => '/contact'],
                ['title' => 'Wholesale', 'url' => '/pages/joinus'],
                ['title' => 'Careers', 'url' => '#'],
            ]
        ],
        [
            'title' => 'Support',
            'children' => [
                ['title' => 'Help Center', 'url' => '/contact'],
                ['title' => 'Cycle to work scheme', 'url' => '/pages/cycle-to-work-scheme'],
                ['title' => 'Shipping Info', 'url' => '#'],
                ['title' => 'Returns', 'url' => '#'],
                ['title' => 'Warranty', 'url' => '#'],
            ]
        ],
        [
            'title' => 'Legal',
            'children' => [
                ['title' => 'Privacy Policy', 'url' => '#'],
                ['title' => 'Terms & Conditions', 'url' => '#'],
                ['title' => 'Cookie Policy', 'url' => '#'],
            ]
        ]
    ];

    $sort_order = 1;
    foreach ($menus as $menu) {
        // Insert parent
        $stmt = $db->prepare("INSERT INTO navigation_menu (title, url, menu_location, sort_order) VALUES (?, ?, 'footer', ?)");
        $stmt->execute([$menu['title'], '', $sort_order++]);
        $parent_id = $db->lastInsertId();

        $child_sort = 1;
        foreach ($menu['children'] as $child) {
            $stmt = $db->prepare("INSERT INTO navigation_menu (title, url, menu_location, parent_id, sort_order) VALUES (?, ?, 'footer', ?, ?)");
            $stmt->execute([$child['title'], $child['url'], $parent_id, $child_sort++]);
        }
    }

    echo "Successfully seeded footer navigation.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
