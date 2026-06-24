import { useEffect } from 'react';
import settingsService from '@/services/settingsService';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
}

/**
 * SEO component to be used in individual pages to set meta tags
 */
const SEO = ({ title, description, image, url, type = 'website' }: SEOProps) => {
    useEffect(() => {
        const updateMeta = async () => {
            const settings = await settingsService.getPublicSettings();
            
            // 1. Update Title
            const siteName = settings.site_name || 'Cruzaa';
            const finalTitle = title 
                ? `${title} | ${siteName}` 
                : (settings.seo_meta_title || siteName);
            
            document.title = finalTitle;

            // 2. Update Description
            const finalDescription = description || settings.seo_meta_description || '';
            let metaDesc = document.querySelector("meta[name='description']");
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', finalDescription);

            // 3. Open Graph Tags
            const updateOG = (property: string, content: string) => {
                let tag = document.querySelector(`meta[property='${property}']`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('property', property);
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content);
            };

            updateOG('og:title', finalTitle);
            updateOG('og:description', finalDescription);
            updateOG('og:type', type);
            if (url || typeof window !== 'undefined') {
                updateOG('og:url', url || window.location.href);
            }
            if (image || settings.seo_og_image) {
                updateOG('og:image', image || settings.seo_og_image);
            }

            // 4. Twitter Tags
            const updateTwitter = (name: string, content: string) => {
                let tag = document.querySelector(`meta[name='${name}']`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('name', name);
                    document.head.appendChild(tag);
                }
                tag.setAttribute('content', content);
            };

            updateTwitter('twitter:title', finalTitle);
            updateTwitter('twitter:description', finalDescription);
            if (image || settings.seo_og_image) {
                updateTwitter('twitter:image', image || settings.seo_og_image);
            }
        };

        updateMeta();
    }, [title, description, image, url, type]);

    return null;
};

export default SEO;
