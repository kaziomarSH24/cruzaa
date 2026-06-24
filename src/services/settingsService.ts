/**
 * Settings Service
 * Handles all system settings API calls
 */

import api, { createFormData } from './api';

export interface Settings {
    general?: Record<string, { value: string; description: string }>;
    smtp?: Record<string, { value: string; description: string }>;
    seo?: Record<string, { value: string; description: string }>;
    stripe?: Record<string, { value: string; description: string }>;
    cart?: Record<string, { value: string; description: string }>;
    appearance?: Record<string, { value: string; description: string }>;
}

export interface PublicSettings {
    site_name?: string;
    site_tagline?: string;
    site_logo?: string;
    site_dark_logo?: string;
    site_favicon?: string;
    contact_email?: string;
    contact_phone?: string;
    currency?: string;
    currency_symbol?: string;
    cart_enabled?: string;
    guest_checkout_enabled?: string;
    stripe_enabled?: string;
    seo_meta_title?: string;
    seo_meta_description?: string;
    seo_meta_keywords?: string;
    seo_og_image?: string;
}

class SettingsService {
    /**
     * Get all settings
     */
    async getSettings(type?: string): Promise<Settings> {
        const response = await api.get('/settings', { params: { type } });
        return response.data.data;
    }

    /**
     * Get public settings
     */
    async getPublicSettings(): Promise<PublicSettings> {
        try {
            const response = await api.get('/settings/public');
            return response.data.data || {};
        } catch (error) {
            console.error('Failed to fetch public settings:', error);
            return {};
        }
    }

    /**
     * Get single setting
     */
    async getSetting(key: string): Promise<any> {
        const response = await api.get(`/settings/${key}`);
        return response.data.data;
    }

    /**
     * Update settings
     */
    async updateSettings(data: FormData | Record<string, any>): Promise<void> {
        const formData = data instanceof FormData ? data : createFormData(data);
        await api.post('/settings', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }

    /**
     * Test SMTP configuration
     */
    async testSMTP(config: Record<string, any>): Promise<void> {
        await api.post('/settings/test-smtp', config);
    }
}

export default new SettingsService();
