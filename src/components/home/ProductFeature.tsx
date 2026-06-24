import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import contentService, { DynamicContent } from "@/services/contentService";

const ProductFeature = () => {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch all content belonging to 'product_feature' group
                const data = await contentService.getContentByGroup('product_feature');

                if (data && data.length > 0) {
                    const mapped: any = {};
                    data.forEach((item: DynamicContent) => {
                        if (item.is_active) {
                            mapped[item.content_key] = item.content_value;
                        }
                    });

                    // Parse images if they exist (expected pipe | or comma , separated)
                    if (mapped.images) {
                        try {
                            // Try JSON first, fallback to split
                            mapped.imageArray = JSON.parse(mapped.images);
                        } catch {
                            mapped.imageArray = mapped.images.split('|').map((s: string) => s.trim());
                        }
                    } else {
                        mapped.imageArray = ["/cruzaa-feature.png"]; // Default fallback
                    }

                    setContent(mapped);
                }
            } catch (err) {
                console.error("Failed to load product feature content", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) return null;
    if (!content) return null;

    const displayImage = content.imageArray[activeIndex];

    return (
        <section className="relative py-28 lg:py-40 bg-[#050505] text-white overflow-hidden min-h-[900px] lg:min-h-[1000px] flex flex-col justify-center font-sans">
            {/* Studio Atmosphere Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Main Spotlight */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_closest-side,rgba(255,255,255,0.06),transparent_100%)] blur-[10px]" />
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)]" />
            </div>

            <div className="container-custom relative z-10 w-full">
                <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-12 lg:gap-16 items-center">

                    {/* LEFT: Product Visual */}
                    <div className="relative flex justify-center order-2 lg:order-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={displayImage}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1.25 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="relative w-full max-w-[1200px] lg:-ml-[15%] isolate"
                            >
                                {/* Studio Ground Shadow */}
                                <div className="absolute bottom-[10%] left-[20%] w-[60%] h-[40px] bg-black/90 blur-[45px] rounded-[100%] rotate-[-5deg] opacity-70" />

                                {/* The Hero Image - Perfectly Blended */}
                                <img
                                    src={displayImage}
                                    alt={content.title || "Featured Product"}
                                    className="relative z-10 w-full h-auto object-contain [mask-image:radial-gradient(ellipse_80%_75%_at_50%_50%,black_35%,transparent_88%)]"
                                />

                                {/* Extra Bottom Blend */}
                                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050505] to-transparent z-20 pointer-events-none" />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* RIGHT: High-End Content Layout */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-6 order-1 lg:order-2"
                    >
                        <div className="space-y-4">
                            <span className="text-primary font-black tracking-[0.25em] text-[10px] sm:text-xs uppercase">
                                {content.badge || "100% Electric"}
                            </span>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[0.9]">
                                    {content.title || "The Cruzaa"}
                                </h2>
                                {content.sub_title && (
                                    <div className="bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-sm tracking-[0.1em] uppercase inline-block self-start">
                                        {content.sub_title}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thin Horizontal Divider */}
                        <div className="h-[1px] w-full bg-white/20 my-8" />

                        {/* Description */}
                        <p
                            className="text-gray-300 leading-relaxed text-sm md:text-[15px] max-w-xl font-medium"
                            dangerouslySetInnerHTML={{ __html: content.description || "" }}
                        />

                        {/* Image Gallery Selector (if multiple images) */}
                        {content.imageArray.length > 1 && (
                            <div className="flex flex-wrap gap-3 pt-6">
                                {content.imageArray.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveIndex(idx)}
                                        className={`w-14 h-14 rounded border-2 transition-all duration-300 overflow-hidden bg-[#111] p-1 ${activeIndex === idx
                                            ? "border-primary scale-110 shadow-[0_0_15px_rgba(255,46,57,0.3)]"
                                            : "border-white/10 hover:border-white/30"
                                            }`}
                                    >
                                        <img src={img} className="w-full h-full object-contain" alt={`Thumbnail ${idx}`} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* LEARN MORE Button */}
                        <div className="pt-8">
                            <Link
                                to={content.link || "/products"}
                                className="inline-flex items-center justify-center px-12 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:brightness-110 transition-all text-xs tracking-[0.2em] uppercase shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                            >
                                {content.button_text || "Learn More"}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ProductFeature;