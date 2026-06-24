import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';
import checkoutService from '@/services/checkoutService';

export default function StripeDiagnostics() {
    const [checks, setChecks] = useState({
        settings: { status: 'loading', message: '' },
        paymentMethods: { status: 'loading', message: '' },
        paymentIntent: { status: 'loading', message: '' },
        stripeJs: { status: 'loading', message: '' }
    });

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = async () => {
        // Check 1: Settings
        try {
            const res = await api.get('/settings/public');
            const settings = res.data.data;

            if (settings.stripe_publishable_key && settings.stripe_publishable_key.startsWith('pk_')) {
                setChecks(prev => ({
                    ...prev,
                    settings: { status: 'success', message: `Publishable key configured: ${settings.stripe_publishable_key.substring(0, 20)}...` }
                }));
            } else {
                setChecks(prev => ({
                    ...prev,
                    settings: { status: 'error', message: 'Stripe publishable key not configured or invalid' }
                }));
            }
        } catch (err: any) {
            setChecks(prev => ({
                ...prev,
                settings: { status: 'error', message: `Failed to fetch settings: ${err.message}` }
            }));
        }

        // Check 2: Payment Methods
        try {
            const methods = await checkoutService.getPaymentMethods();
            const stripeMethod = methods.find(m => m.code === 'stripe');

            if (stripeMethod) {
                setChecks(prev => ({
                    ...prev,
                    paymentMethods: { status: 'success', message: `Stripe payment method found: ${stripeMethod.name}` }
                }));
            } else {
                setChecks(prev => ({
                    ...prev,
                    paymentMethods: { status: 'warning', message: 'Stripe payment method not found in active methods' }
                }));
            }
        } catch (err: any) {
            setChecks(prev => ({
                ...prev,
                paymentMethods: { status: 'error', message: `Failed to fetch payment methods: ${err.message}` }
            }));
        }

        // Check 3: Payment Intent Creation
        try {
            const res = await api.post('/checkout/create-payment-intent', { amount: 0.50 });

            if (res.data.data.clientSecret) {
                setChecks(prev => ({
                    ...prev,
                    paymentIntent: { status: 'success', message: 'Test PaymentIntent created successfully' }
                }));
            } else {
                setChecks(prev => ({
                    ...prev,
                    paymentIntent: { status: 'error', message: 'PaymentIntent created but no clientSecret returned' }
                }));
            }
        } catch (err: any) {
            setChecks(prev => ({
                ...prev,
                paymentIntent: { status: 'error', message: `Failed to create PaymentIntent: ${err.response?.data?.message || err.message}` }
            }));
        }

        // Check 4: Stripe.js Loading
        try {
            const stripeJs = await import('@stripe/stripe-js');
            setChecks(prev => ({
                ...prev,
                stripeJs: { status: 'success', message: 'Stripe.js library loaded successfully' }
            }));
        } catch (err: any) {
            setChecks(prev => ({
                ...prev,
                stripeJs: { status: 'error', message: `Stripe.js failed to load: ${err.message}` }
            }));
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        if (status === 'loading') return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
        if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />;
        if (status === 'warning') return <AlertCircle className="w-5 h-5 text-yellow-500" />;
        return <XCircle className="w-5 h-5 text-red-500" />;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold mb-6">Stripe Integration Diagnostics</h1>

                    <div className="space-y-4">
                        {Object.entries(checks).map(([key, check]) => (
                            <div key={key} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                                <StatusIcon status={check.status} />
                                <div className="flex-1">
                                    <h3 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                                    <p className="text-sm text-slate-600">{check.message || 'Checking...'}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Next Steps:</h3>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                            <li>If any checks failed, go to Admin → Settings → Stripe</li>
                            <li>Ensure Stripe keys are configured correctly</li>
                            <li>Verify "Enable Stripe" is toggled ON</li>
                            <li>Check that Stripe payment method is active in Admin → Payments</li>
                            <li>Open browser console (F12) for detailed error logs</li>
                        </ul>
                    </div>

                    <button
                        onClick={runDiagnostics}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        Run Diagnostics Again
                    </button>
                </div>
            </div>
        </div>
    );
}
