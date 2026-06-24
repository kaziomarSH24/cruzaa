/**
 * Stripe Service
 * Handles Stripe payment integration
 */

import api from './api';

export interface StripePublicKeyResponse {
    publishable_key: string;
    enabled: boolean;
}

export interface CheckoutSessionRequest {
    items: Array<{
        name: string;
        price: number;
        quantity: number;
        image?: string;
    }>;
    email?: string;
    success_url: string;
    cancel_url: string;
}

export interface CheckoutSessionResponse {
    session_id: string;
    checkout_url: string;
}

class StripeService {
    /**
     * Get Stripe publishable key
     */
    async getPublishableKey(): Promise<StripePublicKeyResponse> {
        const response = await api.get('/stripe/publishable-key');
        return response.data.data;
    }

    /**
     * Create checkout session
     */
    async createCheckoutSession(data: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
        const response = await api.post('/stripe/create-checkout-session', data);
        return response.data.data;
    }
}

export default new StripeService();
