import api from './api';

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number | null;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export interface Order {
    id: number;
    order_number: string;
    user_id: number | null;
    user_email?: string;
    user_first_name?: string;
    user_last_name?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_amount: number;
    payment_method: string;
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shipping_address: string;
    created_at: string;
    items?: OrderItem[];
}

class OrderService {
    async getOrders(): Promise<Order[]> {
        const response = await api.get('/orders');
        return response.data.data;
    }

    async getOrder(id: number): Promise<Order> {
        const response = await api.get(`/orders/${id}`);
        return response.data.data;
    }

    async updateOrderStatus(id: number, status: string): Promise<void> {
        await api.put(`/orders/${id}/status`, { status });
    }

    async updatePaymentStatus(id: number, status: string): Promise<void> {
        await api.put(`/orders/${id}/payment-status`, { status });
    }

    async deleteOrder(id: number): Promise<void> {
        await api.delete(`/orders/${id}`);
    }
}

export default new OrderService();
