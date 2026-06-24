/**
 * Pages Service
 * Handles dynamic pages CRUD and image management
 */
import api, { API_BASE_URL } from './api';

export interface PageImage {
    id: number;
    page_id: number;
    image_url: string;
    caption?: string;
    sort_order: number;
}

export interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    meta_title?: string;
    meta_description?: string;
    status: 'published' | 'draft';
    sort_order: number;
    images: PageImage[] | string[];
    created_at: string;
    updated_at: string;
}

class PagesService {
    async getPages(): Promise<Page[]> {
        const res = await api.get('/pages');
        return res.data.data;
    }

    async getPage(slug: string): Promise<Page> {
        const res = await api.get(`/pages/${slug}`);
        return res.data.data;
    }

    async createPage(data: Partial<Page>): Promise<{ id: number; slug: string }> {
        const res = await api.post('/pages', data);
        return res.data.data;
    }

    async updatePage(id: number, data: Partial<Page>): Promise<void> {
        await api.post(`/pages/${id}`, data);
    }

    async deletePage(id: number): Promise<void> {
        await api.delete(`/pages/${id}`);
    }

    async uploadImage(pageId: number, file: File, caption?: string, sortOrder?: number): Promise<{ id: number; url: string }> {
        const formData = new FormData();
        formData.append('image', file);
        if (caption) formData.append('caption', caption);
        if (sortOrder !== undefined) formData.append('sort_order', String(sortOrder));
        const res = await api.post(`/pages/${pageId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.data;
    }

    async deleteImage(pageId: number, imageId: number): Promise<void> {
        await api.delete(`/pages/${pageId}/images/${imageId}`);
    }

    async getDashboardStats(): Promise<{
        products: number;
        orders: number;
        revenue: number;
        new_contacts: number;
        recent_orders: any[];
        recent_contacts: any[];
    }> {
        const res = await api.get('/dashboard/stats');
        return res.data.data;
    }
}

export default new PagesService();
