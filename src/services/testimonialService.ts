import api, { createFormData } from './api';

export interface Testimonial {
    id?: number;
    name: string;
    role: string;
    content: string;
    avatar?: string;
    rating: number;
    is_active: number;
    sort_order: number;
}

const testimonialService = {
    getTestimonials: async (): Promise<Testimonial[]> => {
        const response = await api.get('/testimonials');
        return response.data.data;
    },

    saveTestimonial: async (formData: FormData): Promise<void> => {
        await api.post('/testimonials', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    deleteTestimonial: async (id: number): Promise<void> => {
        await api.delete(`/testimonials/${id}`);
    }
};

export default testimonialService;
