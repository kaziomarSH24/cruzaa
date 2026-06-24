/**
 * Payment Methods Service
 * Handles payment method management
 */

import api from './api';

export interface PaymentMethod {
    id: number;
    name: string;
    code: string;
    description?: string;
    config?: Record<string, any>;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreatePaymentMethodRequest {
    name: string;
    code: string;
    description?: string;
    config?: Record<string, any>;
    is_active?: boolean;
    sort_order?: number;
}

class PaymentMethodService {
    /**
     * Get all payment methods
     */
    async getPaymentMethods(showInactive = false): Promise<PaymentMethod[]> {
        const response = await api.get('/payment-methods', {
            params: { show_inactive: showInactive ? '1' : '0' },
        });
        return response.data.data;
    }

    /**
     * Get single payment method
     */
    async getPaymentMethod(id: number): Promise<PaymentMethod> {
        const response = await api.get(`/payment-methods/${id}`);
        return response.data.data;
    }

    /**
     * Create payment method
     */
    async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<{ id: number }> {
        const response = await api.post('/payment-methods', data);
        return response.data.data;
    }

    /**
     * Update payment method
     */
    async updatePaymentMethod(id: number, data: CreatePaymentMethodRequest): Promise<void> {
        await api.put(`/payment-methods/${id}`, data);
    }

    /**
     * Delete payment method
     */
    async deletePaymentMethod(id: number): Promise<void> {
        await api.delete(`/payment-methods/${id}`);
    }
}

export default new PaymentMethodService();
