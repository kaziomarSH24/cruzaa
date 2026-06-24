import api from './api';

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    is_active: boolean;
    last_login: string | null;
    created_at: string;
}

class UserService {
    async getUsers(): Promise<User[]> {
        const response = await api.get('/users');
        return response.data.data;
    }

    async getUser(id: number): Promise<User> {
        const response = await api.get(`/users/${id}`);
        return response.data.data;
    }

    async toggleStatus(id: number): Promise<void> {
        await api.put(`/users/${id}/toggle-status`);
    }

    async deleteUser(id: number): Promise<void> {
        await api.delete(`/users/${id}`);
    }
}

export default new UserService();
