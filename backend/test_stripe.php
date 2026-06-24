#!/usr/bin/env php
<?php
/**
 * Quick test to verify Stripe PaymentIntent creation
 */

require_once __DIR__ . '/config/database.php';

echo "🔍 Testing Stripe Integration...\n\n";

try {
    $db = (new Database())->getConnection();

    // Check Stripe settings
    echo "1️⃣ Checking Stripe Settings...\n";
    $stmt = $db->prepare("SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'stripe_%'");
    $stmt->execute();
    $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    $hasPublishable = isset($settings['stripe_publishable_key']) && !empty($settings['stripe_publishable_key']);
    $hasSecret = isset($settings['stripe_secret_key']) && !empty($settings['stripe_secret_key']);
    $isEnabled = isset($settings['stripe_enabled']) && $settings['stripe_enabled'] == '1';

    echo "   Publishable Key: " . ($hasPublishable ? "✅ Set" : "❌ Not set") . "\n";
    echo "   Secret Key: " . ($hasSecret ? "✅ Set" : "❌ Not set") . "\n";
    echo "   Stripe Enabled: " . ($isEnabled ? "✅ Yes" : "❌ No") . "\n\n";

    if (!$hasSecret) {
        echo "❌ Stripe secret key not configured. Please add in Admin → Settings → Stripe\n";
        exit(1);
    }

    // Test PaymentIntent Creation
    echo "2️⃣ Testing PaymentIntent Creation...\n";

    if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
        echo "❌ Stripe SDK not installed. Run: cd backend && composer install\n";
        exit(1);
    }

    require_once __DIR__ . '/vendor/autoload.php';

    \Stripe\Stripe::setApiKey($settings['stripe_secret_key']);

    $paymentIntent = \Stripe\PaymentIntent::create([
        'amount' => 100, // £1.00 in pence
        'currency' => 'gbp',
        'payment_method_types' => ['card'],
        'metadata' => [
            'test' => 'integration_test',
        ],
    ]);

    echo "   PaymentIntent ID: " . $paymentIntent->id . "\n";
    echo "   Amount: £" . ($paymentIntent->amount / 100) . "\n";
    echo "   Currency: " . strtoupper($paymentIntent->currency) . "\n";
    echo "   Status: " . $paymentIntent->status . "\n";
    echo "   Payment Methods: " . implode(', ', $paymentIntent->payment_method_types) . "\n";
    echo "   Client Secret: " . substr($paymentIntent->client_secret, 0, 30) . "...\n\n";

    echo "✅ PaymentIntent created successfully!\n\n";

    // Check if payment method is set
    if (in_array('card', $paymentIntent->payment_method_types)) {
        echo "✅ Payment method type 'card' is configured correctly\n";
        echo "   This means Stripe dashboard will show 'card' instead of 'none'\n\n";
    } else {
        echo "⚠️ Payment method types: " . implode(', ', $paymentIntent->payment_method_types) . "\n\n";
    }

    // Check payment methods in database
    echo "3️⃣ Checking Payment Methods...\n";
    $stmt = $db->query("SELECT name, code, is_active FROM payment_methods ORDER BY sort_order");
    $methods = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($methods as $method) {
        $status = $method['is_active'] ? "✅ Active" : "❌ Inactive";
        echo "   {$method['name']} ({$method['code']}): $status\n";
    }

    echo "\n✅ All checks completed!\n";
    echo "\n📝 Summary:\n";
    echo "   - Stripe is configured\n";
    echo "   - PaymentIntent can be created\n";
    echo "   - Payment method type is 'card'\n";
    echo "   - Ready for testing\n\n";

    echo "🎯 Next: Go to checkout and test with card: 4242 4242 4242 4242\n";

} catch (\Stripe\Exception\AuthenticationException $e) {
    echo "\n❌ Stripe Authentication Failed!\n";
    echo "   Error: " . $e->getMessage() . "\n";
    echo "   Fix: Check your Stripe secret key in Admin → Settings → Stripe\n";
    exit(1);
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
