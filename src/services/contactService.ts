/**
 * Contact Service
 * Handles contact form submissions and management
 */

import api from './api';

export interface ContactSubmission {
    id: number;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    ip_address?: string;
    user_agent?: string;
    is_read: boolean;
    is_replied: boolean;
    status: 'new' | 'in_progress' | 'resolved' | 'spam';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ContactListParams {
    page?: number;
    limit?: number;
    status?: string;
    is_read?: 0 | 1;
    search?: string;
}

export interface ContactListResponse {
    submissions: ContactSubmission[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
}

export interface UpdateContactStatusRequest {
    status: 'new' | 'in_progress' | 'resolved' | 'spam';
    is_replied?: 0 | 1;
    notes?: string;
}

class ContactService {
    /**
     * Get contact submissions list
     */
    async getSubmissions(params?: ContactListParams): Promise<ContactListResponse> {
        const response = await api.get('/contact', { params });
        return response.data.data;
    }

    /**
     * Get single submission
     */
    async getSubmission(id: number): Promise<ContactSubmission> {
        const response = await api.get(`/contact/${id}`);
        return response.data.data;
    }

    /**
     * Update submission status
     */
    async updateStatus(id: number, data: UpdateContactStatusRequest): Promise<void> {
        await api.put(`/contact/${id}/status`, data);
    }

    /**
     * Delete submission
     */
    async deleteSubmission(id: number): Promise<void> {
        await api.delete(`/contact/${id}`);
    }
}

export default new ContactService();
