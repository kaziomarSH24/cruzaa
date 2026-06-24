import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import customerAuthService, { CustomerUser } from '@/services/customerAuthService';

interface UserAuthContextType {
    user: CustomerUser | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone?: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<CustomerUser | null>(customerAuthService.getUser());
    const [isLoading, setIsLoading] = useState(false);

    const refreshUser = async () => {
        if (!customerAuthService.isLoggedIn()) return;
        try {
            const fresh = await customerAuthService.getProfile();
            setUser(fresh);
            localStorage.setItem('customer_user', JSON.stringify(fresh));
        } catch {
            customerAuthService.clearSession();
            setUser(null);
        }
    };

    useEffect(() => {
        if (customerAuthService.isLoggedIn()) {
            refreshUser();
        }
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await customerAuthService.login({ email, password });
            customerAuthService.setSession(res.data.token, res.data.user);
            setUser(res.data.user);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: Parameters<typeof customerAuthService.register>[0]) => {
        setIsLoading(true);
        try {
            const res = await customerAuthService.register(data);
            customerAuthService.setSession(res.data.token, res.data.user);
            setUser(res.data.user);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await customerAuthService.logout();
        setUser(null);
    };

    return (
        <UserAuthContext.Provider value={{
            user,
            isLoggedIn: !!user,
            isLoading,
            login,
            register,
            logout,
            refreshUser,
        }}>
            {children}
        </UserAuthContext.Provider>
    );
};

export const useUserAuth = () => {
    const ctx = useContext(UserAuthContext);
    if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
    return ctx;
};
