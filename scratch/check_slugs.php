<?php
require_once __DIR__ . '/../backend/config/config.php';
require_once __DIR__ . '/../backend/config/database.php';

$db = (new Database())->getConnection();

echo "CATEGORIES:\n";
$stmt = $db->query("SELECT name, slug FROM categories");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "- {$row['name']} ({$row['slug']})\n";
}

echo "\nPAGES:\n";
$stmt = $db->query("SELECT title, slug FROM pages");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "- {$row['title']} ({$row['slug']})\n";
}
