<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$menuItems = [
    // Parent Items
    ['id' => 9, 'title' => 'LIMITED EDITION'],
    ['id' => 10, 'title' => 'E-SCOOTERS'],
    ['id' => 11, 'title' => 'E-BIKES'],
    ['id' => 12, 'title' => 'CYCLE 2 WORK'],
    ['id' => 13, 'title' => 'CRUZAA FAMILY'],
    ['id' => 8, 'title' => 'CONTACT US'],
    
    // Children of LIMITED EDITION (parent_id = 9)
    ['id' => 14, 'title' => 'DENIM BLUE'],
    ['id' => 15, 'title' => 'MAGNO GREEN'],
    ['id' => 16, 'title' => 'PRO CARBON BLACK'],
    ['id' => 18, 'title' => 'PRO RACING WHITE'],
    
    // Children of E-SCOOTERS (parent_id = 10)
    ['id' => 19, 'title' => 'CRUZAA CARBON BLACK'],
    ['id' => 20, 'title' => 'CRUZAA RACING WHITE'],
    ['id' => 21, 'title' => 'COMMUTA'],
    ['id' => 22, 'title' => 'COMMUTA PRO MAX'],
    
    // Children of E-BIKES (parent_id = 11)
    ['id' => 24, 'title' => 'CARBON BLACK'],
    ['id' => 25, 'title' => 'GUNMETAL GREY'],
    ['id' => 26, 'title' => 'SOLARBEAM YELLOW'],
    ['id' => 27, 'title' => 'RACING WHITE']
];

$stmt = $db->prepare("UPDATE navigation_menu SET title = ? WHERE id = ?");

foreach ($menuItems as $item) {
    $stmt->execute([$item['title'], $item['id']]);
}

echo "Navigation menu titles updated to UPPERCASE as per branding requirements.\n";
