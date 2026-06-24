import api from './api';

export interface FAQ {
    id?: number;
    question: string;
    answer: string;
    category: string;
    sort_order: number;
    is_active: number;
}

const faqService = {
    getFAQs: async (): Promise<FAQ[]> => {
        const response = await api.get('/faqs');
        return response.data.data;
    },

    saveFAQ: async (data: FAQ): Promise<void> => {
        await api.post('/faqs', data);
    },

    deleteFAQ: async (id: number): Promise<void> => {
        await api.delete(`/faqs/${id}`);
    }
};

export default faqService;
