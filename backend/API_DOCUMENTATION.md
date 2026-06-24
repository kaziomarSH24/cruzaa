# API Documentation - Cruzaa Admin Panel

## Base URL
```
http://localhost/backend
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer {your-jwt-token}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {...}  // Optional validation errors
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## Authentication Endpoints

### POST /auth/login
Admin login with email and password.

**Request:**
```json
{
  "email": "admin@cruzaa.com",
  "password": "admin123"
}
```

**Response (No 2FA):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@cruzaa.com",
      "role": "super_admin"
    }
  }
}
```

**Response (2FA Required):**
```json
{
  "success": true,
  "message": "2FA verification required",
  "data": {
    "requires_2fa": true,
    "temp_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### POST /auth/verify-2fa
Verify 2FA code after login.

**Request:**
```json
{
  "temp_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "code": "123456"
}
```

### POST /auth/setup-2fa
🔒 **Requires Authentication**

Generate 2FA secret and QR code.

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qr_code_url": "https://chart.googleapis.com/chart?chs=200x200..."
  }
}
```

### POST /auth/enable-2fa
🔒 **Requires Authentication**

Enable 2FA after scanning QR code.

**Request:**
```json
{
  "code": "123456"
}
```

### POST /auth/disable-2fa
🔒 **Requires Authentication**

Disable 2FA.

**Request:**
```json
{
  "code": "123456"
}
```

### GET /auth/profile
🔒 **Requires Authentication**

Get current user profile.

---

## Product Endpoints

### GET /products
🔒 **Requires Authentication**

List products with pagination and filters.

**Query Parameters:**
- `page` (int) - Page number (default: 1)
- `limit` (int) - Items per page (default: 20, max: 100)
- `search` (string) - Search in name, SKU, description
- `category_id` (int) - Filter by category
- `status` (0|1) - Filter by active status
- `featured` (0|1) - Filter by featured status

**Example:**
```
GET /products?page=1&limit=20&search=bike&category_id=5&featured=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

### GET /products/{id}
🔒 **Requires Authentication**

Get single product.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "E-Bike Pro",
    "slug": "e-bike-pro",
    "price": "999.99",
    "sale_price": "899.99",
    "stock_quantity": 50,
    "images": [
      {
        "id": 1,
        "image_url": "products/image1.jpg",
        "url": "/backend/uploads/products/image1.jpg"
      }
    ],
    ...
  }
}
```

### POST /products
🔒 **Requires Authentication**

Create new product.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (required)
- `slug` (required, unique)
- `sku` (optional, unique)
- `price` (required)
- `sale_price` (optional)
- `description` (optional)
- `category_id` (optional)
- `stock_quantity` (optional)
- `featured_image` (file, optional)
- `images[]` (files, optional, multiple)
- `seo_title` (optional)
- `seo_description` (optional)
- `is_featured` (0|1)
- `is_active` (0|1)

### PUT /products/{id}
🔒 **Requires Authentication**

Update product. Same fields as POST.

### DELETE /products/{id}
🔒 **Requires Authentication**

Delete product.

### DELETE /products/{id}/images/{imageId}
🔒 **Requires Authentication**

Delete product image.

---

## Category Endpoints

### GET /categories
🔒 **Requires Authentication**

List categories in hierarchical tree structure.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "E-Bikes",
      "slug": "e-bikes",
      "children": [
        {
          "id": 2,
          "name": "Mountain E-Bikes",
          "slug": "mountain-e-bikes",
          "parent_id": 1
        }
      ]
    }
  ]
}
```

### GET /categories/{id}
🔒 **Requires Authentication**

Get single category with subcategories.

### POST /categories
🔒 **Requires Authentication**

Create category.

**Form Data:**
- `name` (required)
- `slug` (required, unique)
- `description` (optional)
- `parent_id` (optional) - Set for sub-category
- `image` (file, optional)
- `sort_order` (optional)
- `seo_title` (optional)
- `is_active` (0|1)

### PUT /categories/{id}
🔒 **Requires Authentication**

Update category.

### DELETE /categories/{id}
🔒 **Requires Authentication**

Delete category (must have no subcategories).

---

## Contact Form Endpoints

### POST /contact
🌐 **Public Endpoint**

Submit contact form.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Product Inquiry",
  "message": "I would like to know more about..."
}
```

### GET /contact
🔒 **Requires Authentication**

List contact submissions.

**Query Parameters:**
- `page` (int)
- `limit` (int)
- `status` (new|in_progress|resolved|spam)
- `is_read` (0|1)
- `search` (string)

### GET /contact/{id}
🔒 **Requires Authentication**

Get single submission (marks as read).

### PUT /contact/{id}/status
🔒 **Requires Authentication**

Update submission status.

**Request:**
```json
{
  "status": "resolved",
  "is_replied": 1,
  "notes": "Contacted customer via email"
}
```

### DELETE /contact/{id}
🔒 **Requires Authentication**

Delete submission.

---

## Dynamic Content Endpoints

### GET /content
🔒 **Requires Authentication**

List all dynamic content.

**Query Parameters:**
- `group` (string) - Filter by group

### GET /content/{key}
🌐 **Public Endpoint**

Get content by key.

**Example:**
```
GET /content/homepage_hero_title
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content_key": "homepage_hero_title",
    "content_type": "text",
    "content_value": "Welcome to Cruzaa",
    "content_group": "homepage"
  }
}
```

### GET /content/group/{group}
🌐 **Public Endpoint**

Get all content in a group.

**Example:**
```
GET /content/group/homepage
```

### POST /content
🔒 **Requires Authentication**

Create or update content.

**Form Data:**
- `content_key` (required, unique)
- `content_type` (text|html|image|json)
- `content_value` (required)
- `content_group` (optional)
- `description` (optional)
- `file` (for image type)

### DELETE /content/{key}
🔒 **Requires Authentication**

Delete content.

---

## Navigation Endpoints

### GET /navigation
🌐 **Public Endpoint**

Get navigation menu (active items only).

**Query Parameters:**
- `location` (header|footer|sidebar)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Home",
      "url": "/",
      "target": "_self",
      "children": [...]
    }
  ]
}
```

### GET /navigation/admin
🔒 **Requires Authentication**

Get all navigation items (including inactive).

### GET /navigation/{id}
🔒 **Requires Authentication**

Get single navigation item.

### POST /navigation
🔒 **Requires Authentication**

Create navigation item.

**Request:**
```json
{
  "title": "Products",
  "url": "/products",
  "target": "_self",
  "parent_id": null,
  "menu_location": "header",
  "sort_order": 1,
  "icon": "shopping-cart",
  "is_active": 1
}
```

### PUT /navigation/{id}
🔒 **Requires Authentication**

Update navigation item.

### DELETE /navigation/{id}
🔒 **Requires Authentication**

Delete navigation item.

---

## Settings Endpoints

### GET /settings
🔒 **Requires Authentication**

Get all settings grouped by type.

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "site_name": {"value": "Cruzaa", "description": "Site Name"},
      "contact_email": {"value": "info@cruzaa.com", "description": "Contact Email"}
    },
    "smtp": {...},
    "seo": {...},
    "stripe": {...}
  }
}
```

### GET /settings/public
🌐 **Public Endpoint**

Get public settings only.

### GET /settings/{key}
🔒 **Requires Authentication**

Get single setting.

### PUT /settings
🔒 **Requires Authentication**

Update settings (bulk).

**Request:**
```json
{
  "site_name": "Cruzaa E-Mobility",
  "contact_email": "info@cruzaa.com",
  "smtp_enabled": "1",
  "smtp_host": "smtp.gmail.com",
  "stripe_enabled": "1"
}
```

### POST /settings/test-smtp
🔒 **Requires Authentication**

Test SMTP configuration.

**Request:**
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": "587",
  "smtp_username": "user@gmail.com",
  "smtp_password": "password",
  "smtp_encryption": "tls"
}
```

---

## Payment Method Endpoints

### GET /payment-methods
🌐 **Public Endpoint** (shows active only without auth)

List payment methods.

**Query Parameters:**
- `show_inactive` (1) - Show inactive methods (requires auth)

### GET /payment-methods/{id}
🔒 **Requires Authentication**

Get single payment method.

### POST /payment-methods
🔒 **Requires Authentication**

Create payment method.

**Request:**
```json
{
  "name": "PayPal",
  "code": "paypal",
  "description": "Pay securely with PayPal",
  "config": {
    "client_id": "...",
    "client_secret": "..."
  },
  "is_active": 1,
  "sort_order": 2
}
```

### PUT /payment-methods/{id}
🔒 **Requires Authentication**

Update payment method.

### DELETE /payment-methods/{id}
🔒 **Requires Authentication**

Delete payment method.

---

## Stripe Endpoints

### GET /stripe/publishable-key
🌐 **Public Endpoint**

Get Stripe publishable key.

**Response:**
```json
{
  "success": true,
  "data": {
    "publishable_key": "pk_test_...",
    "enabled": true
  }
}
```

### POST /stripe/create-checkout-session
🌐 **Public Endpoint**

Create Stripe checkout session.

**Request:**
```json
{
  "items": [
    {
      "name": "E-Bike Pro",
      "price": 999.99,
      "quantity": 1,
      "image": "https://example.com/image.jpg"
    }
  ],
  "email": "customer@example.com",
  "success_url": "https://yoursite.com/success",
  "cancel_url": "https://yoursite.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "cs_test_...",
    "checkout_url": "https://checkout.stripe.com/..."
  }
}
```

### POST /stripe/webhook
🌐 **Public Endpoint** (Called by Stripe)

Stripe webhook handler for payment events.

---

## Error Codes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid request data"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "No authorization token provided"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 422 - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
  }
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding for production.

## Webhooks

### Stripe Webhook
Configure in Stripe Dashboard:
```
Endpoint: https://yourdomain.com/backend/stripe/webhook
Events: checkout.session.completed, payment_intent.succeeded
```

---

## Testing

Use the included `postman_collection.json` for complete API testing.

1. Import into Postman
2. Set `base_url` variable
3. Login to get JWT token
4. Start testing!

---

**Last Updated:** 2024
**API Version:** 1.0.0
