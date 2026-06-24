import { useState, useEffect } from 'react';
import contentService, { DynamicContent } from '@/services/contentService';

/**
 * Hook to fetch and manage dynamic content
 */
export const useContent = (group?: string) => {
    const [content, setContent] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Use public group API if group is provided, otherwise falls back to general public show
                const data = group && group !== 'all'
                    ? await contentService.getContentByGroup(group)
                    : await contentService.getContent();

                const mapped: Record<string, string> = {};
                data.forEach(item => {
                    if (Number(item.is_active)) {
                        mapped[item.content_key] = item.content_value;
                    }
                });
                setContent(mapped);
            } catch (error) {
                console.error('Error fetching dynamic content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [group]);

    const getContent = (key: string, fallback: string = ''): string => {
        return content[key] || fallback;
    };

    return { content, getContent, loading };
};
