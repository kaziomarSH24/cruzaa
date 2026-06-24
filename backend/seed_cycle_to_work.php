<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $title = 'Cycle to work scheme';
    $slug = 'cycle-to-work-scheme';
    $content = '<h3>Frequently Asked Questions</h3>
<h4>How to order</h4>
<p><strong>Step 1</strong> Get a quote by adding the products to your shopping basket on our website. Make sure to include your accessories in the shopping basket. Take a note of the total amount of the shopping basket.</p>
<p><strong>Step 2</strong> Get the certificate from your employer, by visiting <a href="https://www.cyclescheme.co.uk/retailer/cruzaa" target="_blank">https://www.cyclescheme.co.uk/retailer/cruzaa</a>. You can check that your employer is enrolled in the programme. If you have any questions, contact your HR team.</p>
<p><strong>Step 3</strong> Once you’ve received your certificate, please email us the certificate on <a href="mailto:hi@cruzaa.com">hi@cruzaa.com</a>. We’ll then provide you with a special code so you can place your order through our website as normal, postponing the payment via Cyclescheme.</p>
<p>Use the Cyclescheme calculator to check how much you can save. If you’d like to request a certificate based off the generated quote, please follow the link : <a href="https://www.cyclescheme.co.uk/retailer/cruzaa" target="_blank">https://www.cyclescheme.co.uk/retailer/cruzaa</a></p>

<h4>What can I get?</h4>
<p>You can pair your bike with a range of accessories that keep you cycling and the wheels turning. Some components are not eligible on the scheme, which you find out about using the the link: <a href="https://help.cyclescheme.co.uk/article/53-what-can-i-get-on-the-cycle-to-work-scheme" target="_blank">https://help.cyclescheme.co.uk/article/53-what-can-i-get-on-the-cycle-to-work-scheme</a></p>

<h4>What is Cyclescheme?</h4>
<p>Cyclescheme is a way to pay for your new bike through a monthly salary sacrifice. The payments are taken directly from your gross salary, whilst also meaning you don’t pay tax, national insurance or interest fees. How does the scheme work? Purchasing through Cyclescheme allows you to save between 25% and 39%, offering a tax-efficient way to buy your next bike. Once you’ve checked your employer is signed up to Cyclescheme, you can go ahead and ask us for a quote or place an order if you’ve already got a certificate</p>

<h4>How much can I spend?</h4>
<p>Most employers choose not to limit the order value with Cyclescheme. This means you can browse the entire range of bikes, including e-bikes, and pair with complimentary accessories. Please check with your employer for any order value limit before applying for your certificate.</p>
<p><strong>Can I add my own funds to the transaction?</strong> You cannot add your own funds to the transaction, this is determined by the guidance from the Department for Transport who have clarified that the entire order value must be included on your certificate and adding funds is not possible.</p>

<h4>What happens with returns?</h4>
<p>We have a 14 day return policy. Please see more in our Returns, Repairs & Warranties section of the website.</p>

<h4>How long does it take for my Certificate to be approved?</h4>
<p>Once you have applied for your Certificate, the process typically takes between 3-14 days, depending on how quickly your employer processes your application. If you have an application in place, you can check the status via your Cyclescheme login here</p>

<h4>How often can I apply for a Cyclescheme Certificate?</h4>
<p>The standard period for a Cyclescheme Certificate is 12 months. Some employers do offer 6, 18 and 24 month schemes. You will ultimately need to check with your employer. For any questions about Cyclescheme, please visit <a href="http://www.cyclescheme.co.uk" target="_blank">www.cyclescheme.co.uk</a>.</p>
<p>For help with purchasing an e-bike using a Cyclescheme certificate, email us at <a href="mailto:hi@cruzaa.com">hi@cruzaa.com</a>.</p>';

    // Check if page exists
    $check = $db->prepare("SELECT id FROM pages WHERE slug = ?");
    $check->execute([$slug]);
    if ($check->fetch()) {
        $stmt = $db->prepare("UPDATE pages SET title = ?, content = ?, status = 'published' WHERE slug = ?");
        $stmt->execute([$title, $content, $slug]);
        echo "Page updated: $title\n";
    } else {
        $stmt = $db->prepare("INSERT INTO pages (title, slug, content, status) VALUES (?, ?, ?, 'published')");
        $stmt->execute([$title, $slug, $content]);
        echo "Page created: $title\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
