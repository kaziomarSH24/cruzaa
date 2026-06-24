import api from './api';

export interface HeroSlide {
    id?: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    video_url?: string;
    cta_text: string;
    cta_link: string;
    badge?: string;
    sort_order?: number;
    is_active?: boolean;
}

class HeroSliderService {
    /**
     * Get all slides
     */
    async getSlides(admin = false): Promise<HeroSlide[]> {
        const response = await api.get('/hero-slider', {
            params: { admin: admin ? 'true' : 'false' }
        });
        return response.data.data || [];
    }

    /**
     * Update all slides (Bulk)
     */
    async updateSlides(slides: HeroSlide[]): Promise<void> {
        await api.post('/hero-slider', slides);
    }
}

export default new HeroSliderService();
