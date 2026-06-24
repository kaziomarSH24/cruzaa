<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$stmt = $db->query("SELECT * FROM navigation_menu WHERE menu_location = 'header'");
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($items as $item) {
    echo "ID: {$item['id']} | Title: {$item['title']} | URL: {$item['url']}\n";
}
