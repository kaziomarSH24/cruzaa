<?php
/**
 * Product Seeder - Batch 2
 * Adds the Commuta E-Scooter and the Cruzaa E-Bike range
 */

require_once 'config/database.php';

function slugify($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return $text;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $products = [
        [
            'name' => 'The Commuta E-Scooter – 45km Range – 25kmh Top Speed',
            'category_id' => 3, // Electric Scooter
            'price' => 649.00,
            'sale_price' => 499.99,
            'description' => 'The Cruzaa Commuta Electric Scooter is a premium 10” 350W motor e-scooter under the Cruzaa product family range. The Commuta is 100% electric, making every day social and transport an effortless pleasure, with a range of up to 30 miles range and reaching a maximum speed of 15.5 mph, with an integrated large LED Screen display, and has 3 throttle speed modes in which different level of speeds can be adjusted, with also a cool cruise control mode. The Commuta is unique with the beauty of a detachable battery for portable charging and to swap over if needed on those long journeys, being a very lightweight foldable electric scooter, making it easy to transport.',
            'short_description' => 'Premium 10” 350W motor e-scooter with 45km range and 25kmh top speed.',
            'stock_quantity' => 50,
            'sku' => 'CRZ-COM-STD',
            'specs' => [
                'Top speed' => '15.5 mph',
                'Max range' => '30 miles',
                'Rated Power' => '350W / 36V / 10ah',
                'Wheel size' => '10 inch',
                'Display' => 'Smart digital LCD',
                'Lighting' => 'Front beam headlight',
                'Cruise Control' => 'Yes',
                'Brakes' => 'Rear brake disc',
                'Battery' => 'Detachable for portable charging',
                'Water Resistance' => 'IP54',
                'Weight' => '15kg',
                'Max Load' => '150kg'
            ]
        ],
        [
            'name' => 'The Cruzaa E-Bike Solarbeam Yellow with Built-in Speakers & Bluetooth',
            'category_id' => 5, // Electric Bike
            'price' => 2399.00,
            'sale_price' => 1899.99,
            'description' => 'Move your own way and let the Cruzaa electric Bike do all the hard work for you. 100% electric with a unique aluminium lightweight frame design, the Cruzaa makes everyday transport an effortless pleasure. The integrated 4-stage 240W electric motor makes riding at ease helping you to tackle hills and long journeys. With a total range of up to 60km, the long-life lithium-ion battery pack is built to last and a full charge can be done in 3-4 hours. The exclusive E-Bike also comes with integrated speakers and the latest 5.0 Bluetooth, enabling music to be streamed to the E-Bike.',
            'short_description' => 'Exclusive E-Bike with 240W motor, 60km range, and built-in Bluetooth speakers.',
            'stock_quantity' => 25,
            'sku' => 'CRZ-EBK-YLW',
            'specs' => [
                'Top Speed' => '25 km/h (15.5 mph)',
                'Max Range' => '50 – 60 km (Up to 37 miles)',
                'Wheel Size' => '20”',
                'Charge Time' => '3 – 4 hours',
                'Rated Power' => '240 w / 36 v',
                'Water Resistant' => 'IPX4',
                'Total Weight' => '16.5 kg',
                'Max Weight' => '150 kg',
                'Bluetooth Speakers' => 'Yes',
                'Detachable Battery' => 'Yes',
                'Speed Gears' => '3 Speed',
                'Brakes' => 'Disk Brake System',
                'Suspension' => 'Yes'
            ]
        ],
        [
            'name' => 'The Cruzaa E-Bike Gunmetal Grey with Built-in Speakers & Bluetooth',
            'category_id' => 5,
            'price' => 2399.00,
            'sale_price' => 1899.99,
            'description' => 'Move your own way and let the Cruzaa electric Bike do all the hard work for you...',
            'short_description' => 'Exclusive E-Bike with 240W motor, 60km range, and built-in Bluetooth speakers.',
            'stock_quantity' => 25,
            'sku' => 'CRZ-EBK-GRY',
            'specs' => [
                'Top Speed' => '25 km/h (15.5 mph)',
                'Max Range' => '50 – 60 km (Up to 37 miles)',
                'Wheel Size' => '20”',
                'Charge Time' => '3 – 4 hours',
                'Bluetooth Speakers' => 'Yes'
            ]
        ],
        [
            'name' => 'The Cruzaa E-Bike Racing White with Built-in Speakers & Bluetooth',
            'category_id' => 5,
            'price' => 2399.00,
            'sale_price' => 1899.99,
            'description' => 'Move your own way and let the Cruzaa electric Bike do all the hard work for you...',
            'short_description' => 'Exclusive E-Bike with 240W motor, 60km range, and built-in Bluetooth speakers.',
            'stock_quantity' => 25,
            'sku' => 'CRZ-EBK-WHT',
            'specs' => [
                'Top Speed' => '25 km/h (15.5 mph)',
                'Max Range' => '50 – 60 km (Up to 37 miles)',
                'Wheel Size' => '20”',
                'Bluetooth Speakers' => 'Yes'
            ]
        ],
        [
            'name' => 'The Cruzaa E-Bike Carbon Black with Built-in Speakers & Bluetooth',
            'category_id' => 5,
            'price' => 2399.00,
            'sale_price' => 1899.99,
            'description' => 'Move your own way and let the Cruzaa electric Bike do all the hard work for you...',
            'short_description' => 'Exclusive E-Bike with 240W motor, 60km range, and built-in Bluetooth speakers.',
            'stock_quantity' => 25,
            'sku' => 'CRZ-EBK-BLK',
            'specs' => [
                'Top Speed' => '25 km/h (15.5 mph)',
                'Max Range' => '50 – 60 km (Up to 37 miles)',
                'Wheel Size' => '20”',
                'Bluetooth Speakers' => 'Yes'
            ]
        ]
    ];

    foreach ($products as $p) {
        $slug = slugify($p['name']);
        
        $stmt = $db->prepare("INSERT INTO products (name, slug, category_id, price, sale_price, description, short_description, stock_quantity, sku, specs, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
        
        $stmt->execute([
            $p['name'],
            $slug,
            $p['category_id'],
            $p['price'],
            $p['sale_price'],
            $p['description'],
            $p['short_description'],
            $p['stock_quantity'],
            $p['sku'],
            json_encode($p['specs'])
        ]);
        
        echo "Inserted: " . $p['name'] . "\n";
    }

    echo "Successfully seeded " . count($products) . " products.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
