import { useEffect } from "react";
import settingsService from "@/services/settingsService";

/**
 * Syncs site title and favicon with database settings
 */
const DynamicMeta = () => {
    useEffect(() => {
        const syncMeta = async () => {
            try {
                const settings = await settingsService.getPublicSettings();
                if (!settings) return;

                // Update Title
                if (settings.site_name) {
                    const tagline = settings.site_tagline ? ` | ${settings.site_tagline}` : '';
                    document.title = `${settings.site_name}${tagline}`;
                }

                // Update Favicon
                if (settings.site_favicon) {
                    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.href = settings.site_favicon;
                }

                // Update SEO Meta
                if (settings.seo_meta_description) {
                    let meta = document.querySelector("meta[name='description']");
                    if (!meta) {
                        meta = document.createElement('meta');
                        meta.setAttribute('name', 'description');
                        document.head.appendChild(meta);
                    }
                    meta.setAttribute('content', settings.seo_meta_description);
                }
            } catch (error) {
                console.error("Failed to sync meta settings:", error);
            }
        };

        syncMeta();
    }, []);

    return null;
};

export default DynamicMeta;
