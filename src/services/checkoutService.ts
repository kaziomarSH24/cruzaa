import api from './api';

export interface CheckoutPaymentMethod {
    id: number;
    name: string;
    code: string;
    description: string;
    is_active?: number;
}

export interface OrderItem {
    product_id: number | string;
    name: string;
    quantity: number;
    price: number;
}

export interface PlaceOrderData {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address: string;
    payment_method: string;
    payment_intent_id?: string;
    total_amount: number;
    items: OrderItem[];
    user_id?: number;
}

class CheckoutService {
    async getPaymentMethods(): Promise<CheckoutPaymentMethod[]> {
        const response = await api.get('/checkout/payment-methods');
        return response.data.data;
    }

    async placeOrder(data: PlaceOrderData): Promise<{ order_id: number; order_number: string }> {
        const response = await api.post('/checkout/place-order', data);
        return response.data.data;
    }
}

export default new CheckoutService();
