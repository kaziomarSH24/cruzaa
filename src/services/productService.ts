/**
 * Product Service
 * Handles all product-related API calls
 */

import api, { createFormData } from './api';
import { Product as GlobalProduct } from '@/types/product';

export type Product = GlobalProduct;

export interface ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    url: string;
    sort_order: number;
    is_primary: boolean;
}

export interface ProductListParams {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    category_slug?: string;
    status?: 0 | 1;
    featured?: 0 | 1;
}

export interface ProductListResponse {
    products: Product[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

class ProductService {
    /**
     * Get products list with filters
     */
    async getProducts(params?: ProductListParams): Promise<ProductListResponse> {
        const response = await api.get('/products', { params });
        const data = response.data.data;
        return {
            ...data,
            products: data.products.map((p: any) => this.mapProduct(p))
        };
    }

    /**
     * Map product types from API
     */
    private mapProduct(p: any): Product {
        if (!p) return {} as Product;

        let specs = {};
        if (p.specs) {
            if (typeof p.specs === 'string') {
                try { specs = JSON.parse(p.specs); } catch (e) { specs = {}; }
            } else if (typeof p.specs === 'object' && !Array.isArray(p.specs)) {
                specs = p.specs;
            }
        }

        // Convert ProductImage objects to string URLs for legacy frontend support
        const imageUrls = p.images ? p.images.map((img: any) => img.url || img.image_url) : [];
        if (p.featured_image_url && !imageUrls.includes(p.featured_image_url)) {
            imageUrls.unshift(p.featured_image_url);
        }

        let colors = [];
        if (p.colors) {
            if (typeof p.colors === 'string') {
                try { colors = JSON.parse(p.colors); } catch (e) { colors = []; }
            } else if (Array.isArray(p.colors)) {
                colors = p.colors;
            }
        }

        return {
            ...p,
            id: p.id,
            is_active: Boolean(Number(p.is_active || 0)),
            inStock: Boolean(Number(p.is_active || 0)),
            is_featured: Boolean(Number(p.is_featured || 0)),
            // Frontend display price: use sale_price if set, otherwise price
            price: p.sale_price && Number(p.sale_price) > 0 ? Number(p.sale_price) : Number(p.price || 0),
            sale_price: p.sale_price !== null && p.sale_price !== undefined ? Number(p.sale_price) : undefined,
            originalPrice: p.sale_price && Number(p.sale_price) > 0 ? Number(p.price) : undefined,
            // Raw DB values for admin form (unmodified)
            rawPrice: Number(p.price || 0),
            rawSalePrice: p.sale_price && Number(p.sale_price) > 0 ? Number(p.sale_price) : null,
            description: p.description || '',
            shortDescription: p.short_description || '',
            categoryName: p.category_name || '',
            images: imageUrls,
            rawImages: p.images || [],  // ← full objects with id + url for gallery management
            specs: specs,
            colors: colors,
            features: p.features || []
        };
    }

    /**
     * Get single product
     */
    async getProduct(id: number): Promise<Product> {
        const response = await api.get(`/products/${id}`);
        return this.mapProduct(response.data.data);
    }

    /**
     * Create new product
     */
    async createProduct(data: FormData | Record<string, any>): Promise<{ id: number }> {
        const formData = data instanceof FormData ? data : createFormData(data);
        const response = await api.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    }

    /**
     * Update product
     */
    async updateProduct(id: number, data: FormData | Record<string, any>): Promise<void> {
        const formData = data instanceof FormData ? data : createFormData(data);
        await api.post(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }

    /**
     * Delete product
     */
    async deleteProduct(id: number): Promise<void> {
        await api.delete(`/products/${id}`);
    }

    /**
     * Duplicate product
     */
    async duplicateProduct(id: number): Promise<{ id: number }> {
        const response = await api.post(`/products/${id}/duplicate`);
        return response.data.data;
    }

    /**
     * Delete product image
     */
    async deleteProductImage(productId: number, imageId: number): Promise<void> {
        await api.delete(`/products/${productId}/images/${imageId}`);
    }
}

export default new ProductService();
