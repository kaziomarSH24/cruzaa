/**
 * Authentication Service
 * Handles login, 2FA, profile, and authentication state
 */

import api from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        token?: string;
        requires_2fa?: boolean;
        temp_token?: string;
        user?: AdminUser;
    };
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: 'super_admin' | 'admin' | 'editor';
    two_fa_enabled: boolean;
}

export interface Verify2FARequest {
    temp_token: string;
    code: string;
}

export interface Setup2FAResponse {
    success: boolean;
    data: {
        secret: string;
        qr_code_url: string;
    };
}

class AuthService {
    /**
     * Login with email and password
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    }

    /**
     * Verify 2FA code
     */
    async verify2FA(data: Verify2FARequest): Promise<LoginResponse> {
        const response = await api.post('/auth/verify-2fa', data);
        return response.data;
    }

    /**
     * Get current user profile
     */
    async getProfile(): Promise<AdminUser> {
        const response = await api.get('/auth/profile');
        return response.data.data;
    }

    /**
     * Setup 2FA - Generate secret and QR code
     */
    async setup2FA(): Promise<Setup2FAResponse> {
        const response = await api.post('/auth/setup-2fa');
        return response.data;
    }

    /**
     * Enable 2FA after verification
     */
    async enable2FA(code: string): Promise<void> {
        await api.post('/auth/enable-2fa', { code });
    }

    /**
     * Disable 2FA
     */
    async disable2FA(code: string): Promise<void> {
        await api.post('/auth/disable-2fa', { code });
    }

    /**
     * Update Profile Info
     */
    async updateProfile(data: { full_name: string; email: string }): Promise<void> {
        await api.put('/auth/profile', data);
    }

    /**
     * Update Password
     */
    async updatePassword(data: { current_password: string; new_password: string }): Promise<void> {
        await api.put('/auth/password', data);
    }

    /**
     * Store authentication token
     */
    setToken(token: string): void {
        localStorage.setItem('admin_token', token);
    }

    /**
     * Get authentication token
     */
    getToken(): string | null {
        return localStorage.getItem('admin_token');
    }

    /**
     * Store user data
     */
    setUser(user: AdminUser): void {
        localStorage.setItem('admin_user', JSON.stringify(user));
    }

    /**
     * Get stored user data
     */
    getUser(): AdminUser | null {
        const userData = localStorage.getItem('admin_user');
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Logout - Clear authentication
     */
    logout(): void {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export default new AuthService();
