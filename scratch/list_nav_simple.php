<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$stmt = $db->query("SELECT id, title, url FROM navigation_menu");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "ID: {$row['id']} | Title: {$row['title']} | URL: {$row['url']}\n";
}
