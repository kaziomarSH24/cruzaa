import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import settingsService from '@/services/settingsService';

/**
 * Handles Facebook Pixel and Google Analytics initialization and page view tracking
 */
const TrackingPixels = () => {
    const location = useLocation();

    useEffect(() => {
        const initTracking = async () => {
            try {
                const settings = await settingsService.getPublicSettings();
                if (!settings) {
                    console.warn('TrackingPixels: Settings not loaded yet.');
                    return;
                }
                
                const pixelId = settings.facebook_pixel_id;
                const gaId = settings.google_analytics_id;

                // --- Facebook Pixel ---
                if (pixelId) {
                    // @ts-ignore
                    if (!window.fbq) {
                        // Standard FB Pixel boilerplate
                        (function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js'));
                        
                        // @ts-ignore
                        window.fbq('init', pixelId);
                    }
                    // Track PageView on route change
                    // @ts-ignore
                    window.fbq('track', 'PageView');
                }

                // --- Google Analytics ---
                if (gaId) {
                    // @ts-ignore
                    if (!window.gtag) {
                        const script = document.createElement('script');
                        script.async = true;
                        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
                        document.head.appendChild(script);

                        // @ts-ignore
                        window.dataLayer = window.dataLayer || [];
                        // @ts-ignore
                        function gtag(){window.dataLayer.push(arguments);}
                        // @ts-ignore
                        window.gtag = gtag;
                        // @ts-ignore
                        gtag('js', new Date());
                        // @ts-ignore
                        gtag('config', gaId);
                    } else {
                        // Track PageView on route change
                        // @ts-ignore
                        window.gtag('event', 'page_view', {
                            page_path: location.pathname + location.search,
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to initialize tracking:", error);
            }
        };

        initTracking();
    }, [location.pathname, location.search]);

    return null;
};

export default TrackingPixels;
