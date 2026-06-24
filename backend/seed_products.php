<?php
require_once __DIR__ . '/config/Database.php';

function seedProduct($data) {
    try {
        $db = (new Database())->getConnection();
        
        // Check if product exists
        $stmt = $db->prepare("SELECT id FROM products WHERE slug = ?");
        $stmt->execute([$data['slug']]);
        if ($stmt->fetch()) {
            echo "Product with slug '{$data['slug']}' already exists. Skipping.\n";
            return;
        }

        $sql = "INSERT INTO products (
            name, slug, description, short_description, 
            category_id, price, sale_price, 
            is_active, is_featured, specs
        ) VALUES (
            :name, :slug, :description, :short_description, 
            :category_id, :price, :sale_price, 
            1, 1, :specs
        )";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':name' => $data['name'],
            ':slug' => $data['slug'],
            ':description' => $data['description'],
            ':short_description' => $data['short_description'],
            ':category_id' => $data['category_id'],
            ':price' => $data['price'],
            ':sale_price' => $data['sale_price'],
            ':specs' => json_encode($data['specs'])
        ]);

        echo "Successfully added product: " . $data['name'] . "\n";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

// Product 1 Data
$product1 = [
    'name' => 'The Commuta PRO Max E-Scooter 100km Range – 40kmh Top Speed',
    'slug' => 'the-pro-max-commuta-e-scooter',
    'price' => 899.00,
    'sale_price' => 699.99,
    'category_id' => 3, // Electric Scooter
    'short_description' => 'The unique, long range Commuta Pro Max is a rear-wheel-drive 500w motor electric scooter with 10” wider tyres and up to 100km range.',
    'description' => 'The unique, long range Commuta Pro Max is a rear-wheel-drive 500w motor electric scooter with 10” wider tyres, comes with robust front & rear brake discs, along with a safety rear bright brake light. The Pro Max is 100% electric making every day social and transport an effortless pleasure, with an impressive range of up to 100km (62 miles) and reaching a top speed of 25mph which can be adjusted. The Pro Max is unique in having the beauty of a detachable battery for portable charging and to swap over if needed on those long journeys, being a very lightweight foldable scooter, making it easy to transport. The wider foot deck allows comfortability to make that journey a great experience. The Cruzaa Commuta Pro Max Electric Scooter is an exclusive premium scooter and most powerful with the best miles range under the Cruzaa products family range.',
    'specs' => [
        'Top speed' => '25 mph',
        'Max range' => '62 miles',
        'Rated Power' => '500W / 48V / 15.6 AH',
        'Wheel size' => '10 inch with wider tyres',
        'Display' => 'Smart digital LCD Display',
        'Cruise control' => 'Available',
        'Lights' => 'Front beam headlight, Rear bright brake light',
        'Brakes' => 'Rear & front brake disc',
        'Drive' => 'Rear wheel drive',
        'Battery' => 'Detachable for portable charging',
        'Resistance' => 'Water resistant foldable (IP54)',
        'Gears' => 'Adjustable gear speeds',
        'Net Weight' => '21kg',
        'Max Loading' => '150kg'
    ]
];

seedProduct($product1);
