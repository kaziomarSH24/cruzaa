import api from './api';

export interface NavigationItem {
    id: number;
    title: string;
    url?: string;
    target?: string;
    parent_id?: number;
    menu_location: string;
    sort_order: number;
    icon?: string;
    css_class?: string;
    is_active: number;
    children?: NavigationItem[];
    href?: string; // Frontend compatibility
    name?: string; // Frontend compatibility
}

class NavigationService {
    /**
     * Normalize internal navigation URLs so React Router treats them as absolute.
     */
    private normalizeHref(url?: string): string {
        if (!url) return '#';

        if (
            url.startsWith('/') ||
            url.startsWith('http://') ||
            url.startsWith('https://') ||
            url.startsWith('mailto:') ||
            url.startsWith('tel:') ||
            url.startsWith('#')
        ) {
            return url;
        }

        return `/${url.replace(/^\/+/, '')}`;
    }

    /**
     * Get navigation tree by location (active only)
     */
    async getNavigation(location: string = 'header'): Promise<NavigationItem[]> {
        const response = await api.get('/navigation', { params: { location } });
        return response.data.data.map((item: NavigationItem) => this.mapItem(item));
    }

    /**
     * Get all navigation items for admin (including inactive)
     */
    async getAdminNavigation(location: string = 'header'): Promise<NavigationItem[]> {
        const response = await api.get('/navigation/admin', { params: { location } });
        return response.data.data.map((item: NavigationItem) => this.mapItem(item));
    }

    /**
     * Create navigation item
     */
    async createNavigationItem(data: Partial<NavigationItem>): Promise<NavigationItem> {
        const response = await api.post('/navigation', data);
        return response.data.data;
    }

    /**
     * Update navigation item
     */
    async updateNavigationItem(id: number, data: Partial<NavigationItem>): Promise<NavigationItem> {
        const response = await api.put(`/navigation/${id}`, data);
        return response.data.data;
    }

    /**
     * Delete navigation item
     */
    async deleteNavigationItem(id: number): Promise<void> {
        await api.delete(`/navigation/${id}`);
    }

    /**
     * Recursively map backend items to frontend-friendly tokens
     */
    private mapItem(item: NavigationItem): any {
        return {
            ...item,
            name: item.title,
            href: this.normalizeHref(item.url),
            children: item.children ? item.children.map(c => this.mapItem(c)) : undefined
        };
    }
}

export default new NavigationService();
