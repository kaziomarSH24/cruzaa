<?php
$allowed_origins = ['https://cruzaa.kaziomar.me', 'http://localhost:8080', 'https://cruzaa.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Authorization, X-Requested-With");
// header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}
/**
 * API Router - Main Entry Point
 */

// Now include your dependencies safely
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// Global Error Handler for detailed logging
// ... rest of your code ...

// Global Error Handler for detailed logging
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return false;
    $message = "ERROR [$errno] $errstr in $errfile on line $errline";
    error_log($message);
    // If it's a fatal-like error (like the trim error), we can choose to throw or just log
    // But since it's already crashing, let's just make sure it's logged.
    return false; // Let standard PHP error handling continue or handle it
});

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Auto-detect base path or set manually
$basePath = (strpos($_SERVER['REQUEST_URI'], '/backend') === 0) ? '/backend' : '';
$uri = str_replace($basePath, '', $uri);
$uri = rtrim($uri, '/');

// Split URI into parts
$parts = array_filter(explode('/', $uri));
$parts = array_values($parts); // Re-index array

try {
    if (empty($parts)) {
        Response::success(['status' => 'online'], 'Cruzaa API v1.0');
    }

    // AUTHENTICATION ROUTES
    if ($parts[0] === 'auth') {
        $controller = new AuthController();
        switch ($parts[1] ?? '') {
            case 'login':
                if ($method === 'POST')
                    $controller->login();
                break;
            case 'verify-2fa':
                if ($method === 'POST')
                    $controller->verify2FA();
                break;
            case 'profile':
                if ($method === 'GET')
                    $controller->getProfile();
                else if ($method === 'PUT')
                    $controller->updateProfile();
                break;
            case 'password':
                if ($method === 'PUT')
                    $controller->updatePassword();
                break;
            case 'setup-2fa':
                if ($method === 'POST')
                    $controller->setup2FA();
                break;
            case 'enable-2fa':
                if ($method === 'POST')
                    $controller->enable2FA();
                break;
            case 'disable-2fa':
                if ($method === 'POST')
                    $controller->disable2FA();
                break;
            default:
                Response::notFound();
        }
    }

    // PRODUCT ROUTES
    else if ($parts[0] === 'products') {
        $controller = new ProductController();
        $id = $parts[1] ?? null;
        $sub = $parts[2] ?? null;

        if ($id && $sub === 'images') {
            // /products/{id}/images/{imageId}
            $imageId = $parts[3] ?? null;
            if ($method === 'DELETE' && $imageId) {
                $controller->deleteImage($id, $imageId);
            } else {
                Response::error('Invalid image deletion request');
            }
        } else {
            switch ($method) {
                case 'GET':
                    $id ? $controller->show($id) : $controller->index();
                    break;
                case 'POST':
                    if ($id && ($parts[2] ?? '') === 'duplicate') {
                        $controller->duplicate($id);
                    } else {
                        $id ? $controller->update($id) : $controller->create();
                    }
                    break;
                case 'PUT':
                    if ($id)
                        $controller->update($id);
                    break;
                case 'DELETE':
                    if ($id)
                        $controller->delete($id);
                    break;
            }
        }
    }

    // CATEGORY ROUTES
    else if ($parts[0] === 'categories') {
        $controller = new CategoryController();
        $id = $parts[1] ?? null;
        switch ($method) {
            case 'GET':
                $id ? $controller->show($id) : $controller->index();
                break;
            case 'POST':
                $id ? $controller->update($id) : $controller->create();
                break;
            case 'PUT':
                if ($id)
                    $controller->update($id);
                break;
            case 'DELETE':
                if ($id)
                    $controller->delete($id);
                break;
        }
    }

    // CONTACT ROUTES
    else if ($parts[0] === 'contact') {
        $controller = new ContactController();
        if (!isset($parts[1])) {
            if ($method === 'GET')
                $controller->index();
            else if ($method === 'POST')
                $controller->submit();
        } else {
            $id = $parts[1];
            if (($parts[2] ?? '') === 'status') {
                if ($method === 'PUT')
                    $controller->updateStatus($id);
            } else {
                if ($method === 'GET')
                    $controller->show($id);
                else if ($method === 'DELETE')
                    $controller->delete($id);
            }
        }
    }

    // DYNAMIC CONTENT ROUTES
    else if ($parts[0] === 'content') {
        $controller = new ContentController();
        if (($parts[1] ?? '') === 'group') {
            $controller->getByGroup($parts[2]);
        } else {
            $key = $parts[1] ?? null;
            if ($method === 'GET')
                $key ? $controller->show($key) : $controller->index();
            else if ($method === 'POST')
                $controller->upsert();
            else if ($method === 'DELETE')
                $key ? $controller->delete($key) : Response::error('Key required for delete');
        }
    }

    // HERO SLIDER ROUTES
    else if ($parts[0] === 'hero-slider') {
        $controller = new HeroSliderController();
        if ($method === 'GET') {
            $controller->index();
        } else if ($method === 'POST') {
            $controller->updateAll();
        } else if ($method === 'DELETE' && isset($parts[1])) {
            $controller->delete($parts[1]);
        } else {
            Response::notFound();
        }
    }

    // UPLOAD ROUTES
    else if ($parts[0] === 'upload') {
        $controller = new UploadController();
        if ($method === 'POST') {
            // Handle both /upload and /upload/image
            $controller->uploadImage();
        } else {
            Response::error('Method not allowed', 405);
        }
    }

    // NAVIGATION ROUTES
    else if ($parts[0] === 'navigation') {
        $controller = new NavigationController();
        if (($parts[1] ?? '') === 'admin')
            $controller->adminIndex();
        else {
            $id = $parts[1] ?? null;
            switch ($method) {
                case 'GET':
                    $id ? $controller->show($id) : $controller->index();
                    break;
                case 'POST':
                    $controller->create();
                    break;
                case 'PUT':
                    if ($id)
                        $controller->update($id);
                    break;
                case 'DELETE':
                    if ($id)
                        $controller->delete($id);
                    break;
            }
        }
    }

    // SETTINGS ROUTES
    else if ($parts[0] === 'settings') {
        $controller = new SettingsController();
        if (($parts[1] ?? '') === 'public')
            $controller->getPublic();
        else if (($parts[1] ?? '') === 'test-smtp')
            $controller->testSMTP();
        else {
            if ($method === 'GET')
                $controller->index();
            else
                $controller->update();
        }
    }

    // PAYMENT METHODS
    else if ($parts[0] === 'payment-methods') {
        $controller = new PaymentMethodController();
        $id = $parts[1] ?? null;
        switch ($method) {
            case 'GET':
                $id ? $controller->show($id) : $controller->index();
                break;
            case 'POST':
                $controller->create();
                break;
            case 'PUT':
                if ($id)
                    $controller->update($id);
                break;
            case 'DELETE':
                if ($id)
                    $controller->delete($id);
                break;
        }
    }

    // USERS ROUTES
    else if ($parts[0] === 'users') {
        $controller = new UserController();
        $id = $parts[1] ?? null;
        switch ($method) {
            case 'GET':
                $id ? $controller->show($id) : $controller->index();
                break;
            case 'PUT':
                if ($id && ($parts[2] ?? '') === 'toggle-status')
                    $controller->toggleStatus($id);
                break;
            case 'DELETE':
                if ($id)
                    $controller->delete($id);
                break;
        }
    }

    // ORDERS ROUTES
    else if ($parts[0] === 'orders') {
        $controller = new OrderController();
        $id = $parts[1] ?? null;
        switch ($method) {
            case 'GET':
                $id ? $controller->show($id) : $controller->index();
                break;
            case 'PUT':
                if ($id) {
                    if (($parts[2] ?? '') === 'status')
                        $controller->updateStatus($id);
                    else if (($parts[2] ?? '') === 'payment-status')
                        $controller->updatePaymentStatus($id);
                }
                break;
            case 'DELETE':
                if ($id)
                    $controller->delete($id);
                break;
        }
    }

    // FAQ ROUTES
    else if ($parts[0] === 'faqs') {
        $controller = new FAQController();
        $id = $parts[1] ?? null;
        if ($method === 'GET') {
            $controller->index();
        } else if ($method === 'POST') {
            $controller->store();
        } else if ($method === 'DELETE' && $id) {
            $controller->delete($id);
        }
    }

    // TESTIMONIAL ROUTES
    else if ($parts[0] === 'testimonials') {
        $controller = new TestimonialController();
        $id = $parts[1] ?? null;
        if ($method === 'GET') {
            $controller->index();
        } else if ($method === 'POST') {
            $controller->store();
        } else if ($method === 'DELETE' && $id) {
            $controller->delete($id);
        }
    }

    // PAGES ROUTES
    else if ($parts[0] === 'pages') {
        $controller = new PagesController();
        $id = $parts[1] ?? null;
        $sub = $parts[2] ?? null;

        if ($id === 'stats' && $method === 'GET') {
            $controller->stats();
        } else if ($id && $sub === 'images') {
            // /pages/{id}/images
            $imageId = $parts[3] ?? null;
            if ($method === 'POST') {
                $controller->uploadImage($id);
            } else if ($method === 'DELETE' && $imageId) {
                $controller->deleteImage($id, $imageId);
            }
        } else {
            switch ($method) {
                case 'GET':
                    $id ? $controller->show($id) : $controller->index();
                    break;
                case 'POST':
                    $id ? $controller->update($id) : $controller->create();
                    break;
                case 'PUT':
                    if ($id) $controller->update($id);
                    break;
                case 'DELETE':
                    if ($id) $controller->delete($id);
                    break;
            }
        }
    }

    // DASHBOARD STATS ROUTE
    else if ($parts[0] === 'dashboard' && ($parts[1] ?? '') === 'stats') {
        AuthMiddleware::requireAuth();
        $database = new Database();
        $db = $database->getConnection();

        $products = $db->query("SELECT COUNT(*) as c FROM products WHERE is_active = 1")->fetch(PDO::FETCH_ASSOC)['c'];
        $orders = $db->query("SELECT COUNT(*) as c FROM orders")->fetch(PDO::FETCH_ASSOC)['c'];
        $revenue = $db->query("SELECT COALESCE(SUM(total_amount),0) as r FROM orders WHERE payment_status='paid'")->fetch(PDO::FETCH_ASSOC)['r'];
        $contacts = $db->query("SELECT COUNT(*) as c FROM contact_submissions WHERE status='new'")->fetch(PDO::FETCH_ASSOC)['c'];
        $recentOrders = $db->query("SELECT o.*, COUNT(oi.id) as item_count FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
        $recentContacts = $db->query("SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);

        Response::success([
            'products'       => intval($products),
            'orders'         => intval($orders),
            'revenue'        => floatval($revenue),
            'new_contacts'   => intval($contacts),
            'recent_orders'  => $recentOrders,
            'recent_contacts' => $recentContacts,
        ]);
    }

    // CHECKOUT ROUTES
    else if ($parts[0] === 'checkout') {
        $controller = new CheckoutController();
        if (($parts[1] ?? '') === 'payment-methods' && $method === 'GET') {
            $controller->getPaymentMethods();
        } else if (($parts[1] ?? '') === 'place-order' && $method === 'POST') {
            $controller->placeOrder();
        } else if (($parts[1] ?? '') === 'create-payment-intent' && $method === 'POST') {
            $controller->createPaymentIntent();
        } else {
            Response::notFound();
        }
    }

    // CUSTOMER AUTH ROUTES
    else if ($parts[0] === 'customer') {
        $controller = new CustomerController();
        $sub = $parts[1] ?? '';
        switch ($sub) {
            case 'register':
                if ($method === 'POST')
                    $controller->register();
                else
                    Response::error('Method not allowed', 405);
                break;
            case 'login':
                if ($method === 'POST')
                    $controller->login();
                else
                    Response::error('Method not allowed', 405);
                break;
            case 'logout':
                if ($method === 'POST')
                    $controller->logout();
                else
                    Response::error('Method not allowed', 405);
                break;
            case 'profile':
                if ($method === 'GET')
                    $controller->getProfile();
                else if ($method === 'PUT')
                    $controller->updateProfile();
                else
                    Response::error('Method not allowed', 405);
                break;
            case 'orders':
                $orderId = $parts[2] ?? null;
                if ($method === 'GET') {
                    $orderId ? $controller->getOrder($orderId) : $controller->getOrders();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
            case 'addresses':
                $addressId = $parts[2] ?? null;
                if ($method === 'GET')
                    $controller->getAddresses();
                else if ($method === 'POST')
                    $controller->addAddress();
                else if ($method === 'PUT' && $addressId)
                    $controller->updateAddress($addressId);
                else if ($method === 'DELETE' && $addressId)
                    $controller->deleteAddress($addressId);
                else
                    Response::error('Method not allowed or missing ID', 405);
                break;
            case 'payment-methods':
                $pmId = $parts[2] ?? null;
                if ($method === 'GET')
                    $controller->getPaymentMethods();
                else if ($method === 'DELETE' && $pmId)
                    $controller->deletePaymentMethod($pmId);
                else
                    Response::error('Method not allowed or missing ID', 405);
                break;
            case 'forgot-password':
                if ($method === 'POST')
                    $controller->forgotPassword();
                else
                    Response::error('Method not allowed', 405);
                break;
            default:
                Response::notFound('Customer endpoint not found');
        }
    } else {
        Response::notFound('API Endpoint Not Found');
    }
} catch (Throwable $e) {
    Response::serverError($e->getMessage());
}
