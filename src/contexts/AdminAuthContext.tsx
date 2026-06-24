/**
 * Admin Authentication Context
 * Manages authentication state for admin panel
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { AdminUser, LoginCredentials, Verify2FARequest } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
    user: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    verify2FA: (data: Verify2FARequest) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

interface LoginResponse {
    requires_2fa: boolean;
    temp_token?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const userData = await authService.getProfile();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                authService.logout();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
        try {
            const response = await authService.login(credentials);

            if (response.data.requires_2fa) {
                // Return temp token for 2FA verification
                return {
                    requires_2fa: true,
                    temp_token: response.data.temp_token,
                };
            }

            // No 2FA - store token and user
            if (response.data.token) {
                authService.setToken(response.data.token);
            }

            if (response.data.user) {
                authService.setUser(response.data.user);
                setUser(response.data.user);
            }

            toast.success('Login successful!');

            return { requires_2fa: false };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const verify2FA = async (data: Verify2FARequest): Promise<void> => {
        try {
            const response = await authService.verify2FA(data);

            if (response.data.token) {
                authService.setToken(response.data.token);
            }

            if (response.data.user) {
                authService.setUser(response.data.user);
                setUser(response.data.user);
            }

            toast.success('2FA verification successful!');
        } catch (error: any) {
            const message = error.response?.data?.message || '2FA verification failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        toast.info('Logged out successfully');
        navigate('/admin/login');
    };

    const refreshUser = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData);
            authService.setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verify2FA,
        logout,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
}
