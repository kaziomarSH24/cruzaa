# Cruzaa Admin Panel Backend API

A complete, professional PHP backend admin panel API with all modern features for e-commerce management.

## 🚀 Features

### ✅ Completed Features

1. **Product Management (Complete CRUD)**
   - Create, Read, Update, Delete products
   - Multiple image uploads
   - Stock management
   - Featured products
   - SEO fields
   - Pagination and filtering

2. **Categories & Sub-categories**
   - Hierarchical category tree
   - Unlimited nesting
   - Image support
   - SEO optimization

3. **Contact Form Management**
   - Public submission endpoint
   - Admin dashboard view
   - Status tracking (new, in progress, resolved, spam)
   - Read/unread status

4. **Dynamic Content (WordPress-like)**
   - Key-value content storage
   - Support for text, HTML, images, JSON
   - Group organization
   - Public API for frontend

5. **Dynamic Navigation**
   - Multiple menu locations (header, footer, sidebar)
   - Hierarchical menu structure
   - Icons and CSS classes support

6. **Settings Management**
   - **SMTP Settings**: Full email configuration
   - **SEO Settings**: Meta tags, analytics, OG images
   - **Appearance**: Logo, favicon, custom code injection
   - **General**: Site name, contact info
   - **Cart Settings**: Enable/disable cart, currency
   - **Stripe Settings**: Complete Stripe integration config

7. **Admin Authentication**
   - JWT-based authentication
   - Secure password hashing
   - Role-based access control

8. **Google 2FA (Two-Factor Authentication)**
   - Secret generation
   - QR code for Google Authenticator
   - Enable/disable 2FA
   - Verification during login

9. **Stripe Integration**
   - Checkout session creation
   - Webhook handling
   - Guest checkout support
   - Enable/disable from admin panel

10. **Payment Methods**
    - Add/edit/delete payment methods
    - Enable/disable individual methods
    - Custom configuration per method

11. **Contact Form Dashboard**
    - View all submissions
    - Mark as read/replied
    - Status management
    - Search and filter

## 📁 Project Structure

```
backend/
├── config/
│   ├── config.php          # Global configuration
│   └── database.php        # Database connection
├── controllers/
│   ├── AuthController.php  # Authentication & 2FA
│   ├── ProductController.php
│   ├── CategoryController.php
│   ├── ContactController.php
│   ├── ContentController.php
│   ├── NavigationController.php
│   ├── SettingsController.php
│   ├── PaymentMethodController.php
│   └── StripeController.php
├── middleware/
│   └── AuthMiddleware.php  # JWT authentication
├── utils/
│   ├── JWT.php             # JWT token management
│   ├── TwoFactorAuth.php   # Google 2FA
│   ├── Response.php        # API response helper
│   ├── Validator.php       # Input validation
│   └── FileUpload.php      # File upload handler
├── database/
│   └── schema.sql          # Database schema
├── uploads/                # Uploaded files
├── logs/                   # Application logs
├── .htaccess              # URL rewriting
├── index.php              # API router
└── README.md              # This file
```

## 🛠️ Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache with mod_rewrite enabled
- Composer (optional, for Stripe SDK)

### Step 1: Database Setup

1. Create a new database:
```sql
CREATE DATABASE cruzaa_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import the schema:
```bash
mysql -u root -p cruzaa_admin < database/schema.sql
```

3. Update database credentials in `config/database.php`:
```php
private $host = "localhost";
private $db_name = "cruzaa_admin";
private $username = "root";
private $password = "your_password";
```

### Step 2: Configure Application

1. Update `config/config.php`:
   - Set `JWT_SECRET_KEY` to a strong random string
   - Configure paths if needed
   - Set timezone

2. Set proper permissions:
```bash
chmod 777 uploads/
chmod 777 logs/
```

### Step 3: Apache Configuration

Ensure `mod_rewrite` is enabled:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Step 4: Install Stripe SDK (Optional)

For full Stripe functionality:
```bash
composer require stripe/stripe-php
```

Then uncomment Stripe API calls in `controllers/StripeController.php`.

## 🔑 Default Credentials

- **Username**: admin
- **Email**: admin@cruzaa.com
- **Password**: admin123

**⚠️ Change these credentials immediately after installation!**

## 📡 API Endpoints

### Authentication
```
POST   /backend/auth/login                 # Admin login
POST   /backend/auth/verify-2fa            # Verify 2FA code
GET    /backend/auth/profile               # Get current user
POST   /backend/auth/setup-2fa             # Setup 2FA
POST   /backend/auth/enable-2fa            # Enable 2FA
POST   /backend/auth/disable-2fa           # Disable 2FA
```

### Products
```
GET    /backend/products                   # List products (pagination, filters)
GET    /backend/products/{id}              # Get single product
POST   /backend/products                   # Create product
PUT    /backend/products/{id}              # Update product
DELETE /backend/products/{id}              # Delete product
DELETE /backend/products/{id}/images/{imageId} # Delete product image
```

### Categories
```
GET    /backend/categories                 # List categories (tree structure)
GET    /backend/categories/{id}            # Get single category
POST   /backend/categories                 # Create category
PUT    /backend/categories/{id}            # Update category
DELETE /backend/categories/{id}            # Delete category
```

### Contact Forms
```
GET    /backend/contact                    # List submissions (admin)
GET    /backend/contact/{id}               # Get single submission
POST   /backend/contact                    # Submit form (public)
PUT    /backend/contact/{id}/status        # Update status
DELETE /backend/contact/{id}               # Delete submission
```

### Dynamic Content
```
GET    /backend/content                    # List all content
GET    /backend/content/{key}              # Get content by key (public)
GET    /backend/content/group/{group}      # Get content by group (public)
POST   /backend/content                    # Create/update content
DELETE /backend/content/{key}              # Delete content
```

### Navigation
```
GET    /backend/navigation                 # Get navigation (public)
GET    /backend/navigation/admin           # Get all navigation (admin)
GET    /backend/navigation/{id}            # Get single item
POST   /backend/navigation                 # Create navigation item
PUT    /backend/navigation/{id}            # Update navigation item
DELETE /backend/navigation/{id}            # Delete navigation item
```

### Settings
```
GET    /backend/settings                   # Get all settings
GET    /backend/settings/public            # Get public settings
GET    /backend/settings/{key}             # Get single setting
PUT    /backend/settings                   # Update settings
POST   /backend/settings/test-smtp         # Test SMTP configuration
```

### Payment Methods
```
GET    /backend/payment-methods            # List payment methods
GET    /backend/payment-methods/{id}       # Get single method
POST   /backend/payment-methods            # Create method
PUT    /backend/payment-methods/{id}       # Update method
DELETE /backend/payment-methods/{id}       # Delete method
```

### Stripe
```
POST   /backend/stripe/create-checkout-session  # Create checkout
POST   /backend/stripe/webhook                  # Stripe webhook
GET    /backend/stripe/publishable-key          # Get public key
```

## 🔐 Authentication

All admin endpoints require JWT token authentication.

### Headers
```
Authorization: Bearer {your-jwt-token}
```

### Login Flow
1. POST to `/backend/auth/login` with email and password
2. If 2FA is enabled, you'll get a temporary token
3. POST to `/backend/auth/verify-2fa` with the temp token and 2FA code
4. Receive full access JWT token
5. Use token in Authorization header for all subsequent requests

## 💾 File Uploads

Supported endpoints for file uploads:
- Products: featured_image, images[]
- Categories: image
- Settings: site_logo, site_favicon, seo_og_image
- Content: file (for image type content)

### Upload Requirements
- Max file size: 5MB
- Allowed types: JPEG, PNG, GIF, WebP
- Files are stored in `/backend/uploads/{category}/`

## 🔄 Response Format

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
  "message": "Error message",
  "errors": {...}  // Optional validation errors
}
```

## 🛡️ Security Features

- ✅ JWT authentication with expiration
- ✅ Password hashing (bcrypt)
- ✅ Google 2FA support
- ✅ SQL injection prevention (PDO prepared statements)
- ✅ CORS configuration
- ✅ File upload validation
- ✅ Input validation and sanitization
- ✅ Activity logging
- ✅ Protected config files

## 📊 Activity Logging

All admin actions are logged in the `activity_logs` table:
- User actions
- IP addresses
- User agents
- Timestamps
- Entity details

## 🎨 Customization

### Adding New Settings
Edit `database/schema.sql` to add new settings:
```sql
INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('your_key', 'default_value', 'general', 'Description');
```

### Adding New Payment Methods
Use the Payment Methods API or add directly:
```sql
INSERT INTO payment_methods (name, code, description, is_active) VALUES
('PayPal', 'paypal', 'Pay with PayPal', 1);
```

## 🚨 Troubleshooting

### 404 Errors
- Ensure `.htaccess` is present and `mod_rewrite` is enabled
- Check Apache virtual host configuration

### Database Connection Failed
- Verify credentials in `config/database.php`
- Ensure MySQL is running
- Check database exists

### File Upload Fails
- Check folder permissions (uploads directory should be writable)
- Verify PHP `upload_max_filesize` and `post_max_size` settings

### CORS Issues
- Update CORS headers in `config/config.php`
- Check `.htaccess` CORS configuration

## 📝 Development

### Adding a New Controller

1. Create controller in `controllers/` directory
2. Extend base functionality if needed
3. Add routes in `index.php`
4. Implement authentication where needed

### Database Migrations

When updating schema:
1. Backup database
2. Update `database/schema.sql`
3. Run migration SQL separately
4. Update controllers if needed

## 🤝 Support

For issues or questions:
- Check logs in `/backend/logs/`
- Review database error logs
- Check PHP error logs

## 📜 License

Proprietary - Cruzaa E-Mobility Hub

---

**Built with ❤️ for Cruzaa Admin Panel**
