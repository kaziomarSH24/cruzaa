import api from '../services/api';
import orderService from '../services/orderService';
import paymentMethodService from '../services/paymentMethodService';
import contactService from '../services/contactService';
import contentService from '../services/contentService';
import authService from '../services/authService';

/**
 * Admin Panel Diagnostic Tests
 * Run these to verify all admin functionality
 */

export async function testAdminPanelEndpoints() {
    console.log('🧪 Starting Admin Panel Tests...\n');

    const results: Record<string, { status: 'pass' | 'fail' | 'skip', message: string }> = {};

    // Test 1: Orders Fetch
    try {
        console.log('1️⃣ Testing Orders Fetch...');
        const orders = await orderService.getOrders();
        results.orders = {
            status: 'pass',
            message: `✅ Fetched ${orders.length} orders successfully`
        };
        console.log(results.orders.message);
    } catch (error: any) {
        results.orders = {
            status: 'fail',
            message: `❌ Orders fetch failed: ${error.message}`
        };
        console.error(results.orders.message);
    }

    // Test 2: Payment Methods
    try {
        console.log('\n2️⃣ Testing Payment Methods...');
        const methods = await paymentMethodService.getPaymentMethods(true);
        results.paymentMethods = {
            status: 'pass',
            message: `✅ Fetched ${methods.length} payment methods`
        };
        console.log(results.paymentMethods.message);
    } catch (error: any) {
        results.paymentMethods = {
            status: 'fail',
            message: `❌ Payment methods fetch failed: ${error.message}`
        };
        console.error(results.paymentMethods.message);
    }

    // Test 3: Contact Submissions
    try {
        console.log('\n3️⃣ Testing Contact Inquiries...');
        const contacts = await contactService.getSubmissions({ search: '' });
        results.contacts = {
            status: 'pass',
            message: `✅ Fetched ${contacts.submissions.length} contact submissions`
        };
        console.log(results.contacts.message);
    } catch (error: any) {
        results.contacts = {
            status: 'fail',
            message: `❌ Contact fetch failed: ${error.message}`
        };
        console.error(results.contacts.message);
    }

    // Test 4: Hero Slider Content
    try {
        console.log('\n4️⃣ Testing Hero Slider Content...');
        const slider = await contentService.getContentByKey('homepage_slider');
        const slides = slider?.content_value ? JSON.parse(slider.content_value) : [];
        results.heroSlider = {
            status: 'pass',
            message: `✅ Hero slider has ${slides.length} slides`
        };
        console.log(results.heroSlider.message);
    } catch (error: any) {
        results.heroSlider = {
            status: 'fail',
            message: `❌ Hero slider fetch failed: ${error.message}`
        };
        console.error(results.heroSlider.message);
    }

    // Test 5: Auth Profile (requires auth)
    try {
        console.log('\n5️⃣ Testing Auth Profile...');
        const profile = await authService.getProfile();
        results.authProfile = {
            status: 'pass',
            message: `✅ Profile loaded: ${profile.email}, 2FA: ${profile.two_fa_enabled ? 'Enabled' : 'Disabled'}`
        };
        console.log(results.authProfile.message);
    } catch (error: any) {
        results.authProfile = {
            status: 'skip',
            message: `⚠️ Not authenticated: ${error.message}`
        };
        console.warn(results.authProfile.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));

    const passed = Object.values(results).filter(r => r.status === 'pass').length;
    const failed = Object.values(results).filter(r => r.status === 'fail').length;
    const skipped = Object.values(results).filter(r => r.status === 'skip').length;

    console.log(`
  ✅ Passed: ${passed}
  ❌ Failed: ${failed}
  ⚠️  Skipped: ${skipped}
  `);

    return results;
}

// Export for use in console or admin page
if (typeof window !== 'undefined') {
    (window as any).testAdminPanel = testAdminPanelEndpoints;
}

export default testAdminPanelEndpoints;
