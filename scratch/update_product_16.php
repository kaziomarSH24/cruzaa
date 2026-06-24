<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$productId = 16;
$name = "The Commuta E-Scooter – 45km Range – 25kmh Top Speed";
$slug = "commuta-e-scooter";
$price = 649.00;
$sale_price = 499.99;
$description = "The Cruzaa Commuta Electric Scooter is a premium 10” 350W motor e-scooter under the Cruzaa product family range. The Commuta is 100% electric, making every day social and transport an effortless pleasure, with a range of up to 30 miles range and reaching a maximum speed of 15.5 mph, with an integrated large LED Screen display, and has 3 throttle speed modes in which different level of speeds can be adjusted, with also a cool cruise control mode. The Commuta is unique with the beauty of a detachable battery for portable charging and to swap over if needed on those long journeys, being a very lightweight foldable electric scooter, making it easy to transport.";

$specs = json_encode([
    'Top speed' => '15.5 mph',
    'Max range' => '30 miles',
    'Rated Power' => '350W / 36V / 10ah',
    'Wheel size' => '10 inch',
    'Display' => 'Smart digital LCD',
    'Headlight' => 'Front beam',
    'Cruise control' => 'Mode enabled',
    'Brakes' => 'Rear brake disc',
    'Battery' => 'Detachable / Portable charging',
    'Water Resistance' => 'IP54 foldable',
    'Gears' => 'Adjustable gear speeds',
    'Portability' => 'Lightweight',
    'Net Weight' => '15kg',
    'Max Loading Weight' => '150kg'
]);

$stmt = $db->prepare("UPDATE products SET name = ?, slug = ?, price = ?, sale_price = ?, description = ?, specs = ? WHERE id = ?");
$stmt->execute([$name, $slug, $price, $sale_price, $description, $specs, $productId]);

echo "Product ID 16 (Commuta E-Scooter) updated successfully.\n";
