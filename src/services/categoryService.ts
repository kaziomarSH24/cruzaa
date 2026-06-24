/**
 * Category Service
 * Handles category and sub-category API calls
 */

import api, { createFormData } from './api';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    parent_id?: number | null;
    image?: string;
    image_url?: string;
    sort_order: number;
    is_active: boolean;
    show_on_home: boolean;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    children?: Category[];
    parent?: {
        id: number;
        name: string;
        slug: string;
    };
    subcategories?: Category[];
    created_at: string;
    updated_at: string;
}

class CategoryService {
    /**
     * Get all categories (hierarchical tree)
     */
    async getCategories(showInactive = false): Promise<Category[]> {
        const response = await api.get('/categories', {
            params: { show_inactive: showInactive ? '1' : '0' },
        });
        return this.mapCategories(response.data.data);
    }

    /**
     * Helper to recursively map category types
     */
    private mapCategories(cats: Category[]): Category[] {
        return cats.map(cat => ({
            ...cat,
            is_active: Boolean(Number(cat.is_active)),
            show_on_home: Boolean(Number(cat.show_on_home)),
            sort_order: Number(cat.sort_order),
            children: cat.children ? this.mapCategories(cat.children) : []
        }));
    }

    /**
     * Get categories for home page
     */
    async getHomeCategories(): Promise<Category[]> {
        const allCategories = await this.getCategories();

        // Filter those marked for home
        const filterHome = (cats: Category[]): Category[] => {
            const result: Category[] = [];
            cats.forEach(c => {
                if (c.show_on_home) result.push(c);
                if (c.children) result.push(...filterHome(c.children));
            });
            return result;
        };

        return filterHome(allCategories);
    }

    /**
     * Get single category
     */
    async getCategory(id: number): Promise<Category> {
        const response = await api.get(`/categories/${id}`);
        const cat = response.data.data;
        return {
            ...cat,
            is_active: Boolean(Number(cat.is_active)),
            show_on_home: Boolean(Number(cat.show_on_home)),
            sort_order: Number(cat.sort_order),
            subcategories: cat.subcategories ? this.mapCategories(cat.subcategories) : []
        };
    }

    /**
     * Create category
     */
    async createCategory(data: FormData | Record<string, any>): Promise<{ id: number }> {
        const formData = data instanceof FormData ? data : createFormData(data);
        const response = await api.post('/categories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    }

    /**
     * Update category
     */
    async updateCategory(id: number, data: FormData | Record<string, any>): Promise<void> {
        const formData = data instanceof FormData ? data : createFormData(data);
        await api.post(`/categories/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }

    /**
     * Delete category
     */
    async deleteCategory(id: number): Promise<void> {
        await api.delete(`/categories/${id}`);
    }

    /**
     * Flatten category tree for dropdown
     */
    flattenCategories(categories: Category[], level = 0): Array<Category & { level: number; label: string }> {
        const result: Array<Category & { level: number; label: string }> = [];

        categories.forEach((category) => {
            result.push({
                ...category,
                level,
                label: '—'.repeat(level) + (level > 0 ? ' ' : '') + category.name,
            });

            if (category.children && category.children.length > 0) {
                result.push(...this.flattenCategories(category.children, level + 1));
            }
        });

        return result;
    }
}

export default new CategoryService();
