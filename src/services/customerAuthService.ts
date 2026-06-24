import axios from 'axios';
import { API_BASE_URL } from './api';

// Separate axios instance for customer API (no admin token)
const customerApi = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

customerApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('customer_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export interface CustomerUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    created_at?: string;
}

export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        user: CustomerUser;
    };
}

class CustomerAuthService {
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await customerApi.post('/customer/register', data);
        return response.data;
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await customerApi.post('/customer/login', data);
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await customerApi.post('/customer/logout');
        } catch (_) { /* silently fail */ }
        this.clearSession();
    }

    async getProfile(): Promise<CustomerUser> {
        const response = await customerApi.get('/customer/profile');
        return response.data.data;
    }

    async updateProfile(data: Partial<CustomerUser> & { password?: string; password_confirmation?: string; current_password?: string }): Promise<CustomerUser> {
        const response = await customerApi.put('/customer/profile', data);
        return response.data.data;
    }

    async getOrders(): Promise<any[]> {
        const response = await customerApi.get('/customer/orders');
        return response.data.data;
    }

    async getOrder(id: number): Promise<any> {
        const response = await customerApi.get(`/customer/orders/${id}`);
        return response.data.data;
    }

    async getAddresses(): Promise<any[]> {
        const response = await customerApi.get('/customer/addresses');
        return response.data.data;
    }

    async addAddress(data: any): Promise<any> {
        const response = await customerApi.post('/customer/addresses', data);
        return response.data;
    }

    async updateAddress(id: number, data: any): Promise<any> {
        const response = await customerApi.put(`/customer/addresses/${id}`, data);
        return response.data;
    }

    async deleteAddress(id: number): Promise<any> {
        const response = await customerApi.delete(`/customer/addresses/${id}`);
        return response.data;
    }

    async getPaymentMethods(): Promise<any[]> {
        const response = await customerApi.get('/customer/payment-methods');
        return response.data.data;
    }

    async deletePaymentMethod(id: number): Promise<any> {
        const response = await customerApi.delete(`/customer/payment-methods/${id}`);
        return response.data;
    }

    async forgotPassword(email: string): Promise<any> {
        const response = await customerApi.post('/customer/forgot-password', { email });
        return response.data;
    }

    setSession(token: string, user: CustomerUser): void {
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer_user', JSON.stringify(user));
    }

    clearSession(): void {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
    }

    getToken(): string | null {
        return localStorage.getItem('customer_token');
    }

    getUser(): CustomerUser | null {
        const data = localStorage.getItem('customer_user');
        return data ? JSON.parse(data) : null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken() && !!this.getUser();
    }
}

export default new CustomerAuthService();
export { customerApi };
