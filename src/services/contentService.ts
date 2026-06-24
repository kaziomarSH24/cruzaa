/**
 * Content Service
 * Handles dynamic content (WordPress-like CMS)
 */

import api, { createFormData } from './api';

export interface DynamicContent {
    id?: number;
    content_key: string;
    content_type: 'text' | 'html' | 'image' | 'json';
    content_value: string;
    content_group?: string;
    description?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

class ContentService {
    /**
     * Get all dynamic content
     */
    async getContent(group?: string): Promise<DynamicContent[]> {
        const params: any = { _t: Date.now() };
        if (group && group !== 'all') {
            params.group = group;
        }
        const response = await api.get('/content', { params });
        return response.data.data;
    }

    /**
     * Get content by key
     */
    async getContentByKey(key: string): Promise<DynamicContent> {
        const response = await api.get(`/content/${key}`);
        return response.data.data;
    }

    /**
     * Get content by group
     */
    async getContentByGroup(group: string): Promise<DynamicContent[]> {
        const response = await api.get(`/content/group/${group}`, {
            params: { _t: Date.now() }
        });
        return response.data.data;
    }

    /**
     * Create or update content
     */
    async upsertContent(data: FormData | Record<string, any>): Promise<void> {
        const formData = data instanceof FormData ? data : createFormData(data);
        await api.post('/content', formData);
    }

    /**
     * Delete content
     */
    async deleteContent(key: string): Promise<void> {
        await api.delete(`/content/${key}`);
    }
}

export default new ContentService();
