<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$productId = 4;
$name = "The Commuta PRO Max E-Scooter 100km Range – 40kmh Top Speed";
$slug = "the-pro-max-commuta-e-scooter";
$description = "The unique, long range Commuta Pro Max is a rear-wheel-drive 500w motor electric scooter with 10” wider tyres, comes with robust front & rear brake discs, along with a safety rear bright brake light. The Pro Max is 100% electric making every day social and transport an effortless pleasure, with an impressive range of up to 100km (62 miles) and reaching a top speed of 25mph which can be adjusted. The Pro Max is unique in having the beauty of a detachable battery for portable charging and to swap over if needed on those long journeys, being a very lightweight foldable scooter, making it easy to transport. The wider foot deck allows comfortability to make that journey a great experience. The Cruzaa Commuta Pro Max Electric Scooter is an exclusive premium scooter and most powerful with the best miles range under the Cruzaa products family range.";

$specs = json_encode([
    'Top speed' => '25 mph',
    'Max range' => '62 miles',
    'Rated Power' => '500W / 48V / 15.6 AH',
    'Wheel size' => '10 inch with wider tyres',
    'Display' => 'Smart digital LCD',
    'Cruise control' => 'Mode enabled',
    'Headlight' => 'Front beam',
    'Brakes' => 'Front & Rear Disc',
    'Drive' => 'Rear wheel drive',
    'Battery' => 'Detachable / Portable charging',
    'Water Resistance' => 'IP54 foldable',
    'Gears' => 'Adjustable gear speeds',
    'Net Weight' => '21kg',
    'Max Loading Weight' => '150kg'
]);

$stmt = $db->prepare("UPDATE products SET name = ?, slug = ?, description = ?, specs = ? WHERE id = ?");
$stmt->execute([$name, $slug, $description, $specs, $productId]);

echo "Product ID 4 (Commuta Pro Max) updated with full content and correct slug.\n";
