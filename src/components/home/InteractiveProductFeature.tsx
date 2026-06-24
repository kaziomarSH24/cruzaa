import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown } from "lucide-react";
import contentService, { DynamicContent } from "@/services/contentService";

interface Hotspot {
    id: number;
    x: string;
    y: string;
    label: string;
    desc?: string;
}

const InteractiveProductFeature = () => {
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [selectedColor, setSelectedColor] = useState("Carbon Black");

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await contentService.getContentByGroup('product_feature');
                if (data && data.length > 0) {
                    const mapped: any = {};
                    data.forEach((item: DynamicContent) => {
                        mapped[item.content_key] = item.content_value;
                    });

                    // Parse hotspots
                    try {
                        mapped.hotspotArray = mapped.hotspots ? JSON.parse(mapped.hotspots) : [];
                    } catch {
                        mapped.hotspotArray = [];
                    }

                    setContent(mapped);
                }
            } catch (err) {
                console.error("Failed to load interactive feature content", err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) return (
        <section className="py-24 bg-black flex items-center justify-center min-h-[600px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </section>
    );

    if (!content) return null;

    const hotspots: Hotspot[] = content.hotspotArray || [];

    // Resolve image URL
    let scooterImg = "/hero-scooter.jpg";
    if (content.images) {
        const img = content.images;
        if (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) {
            scooterImg = img;
        } else if (img.startsWith('../')) {
            scooterImg = img.replace('../', '/');
        } else {
            scooterImg = `/uploads/${img}`;
        }
    }

    return (
        <section className="relative py-20 lg:py-28 bg-black text-white overflow-hidden font-sans">
            {/* Very subtle center spotlight */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_80%)]" />
            </div>

            <div className="container-custom relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

                    {/* LEFT: Product Visual (matching screenshot) */}
                    <div className="w-full lg:w-[58%] relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="relative lg:scale-125 origin-center z-20"
                        >
                            <img
                                src={scooterImg}
                                alt={content.title || "Cruzaa E Scooter"}
                                className="w-full h-auto object-contain mx-auto mix-blend-screen [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,black_20%,transparent_90%)]"
                            />

                            {/* Deep Studio Ground Shadow for realism */}
                            <div className="absolute bottom-[10%] left-[20%] w-[60%] h-16 bg-black/80 blur-[60px] rounded-[100%] -z-10" />

                            {/* Hotspots */}
                            <div className="absolute inset-0">
                                {hotspots.map((h) => (
                                    <div
                                        key={h.id}
                                        className="absolute group"
                                        style={{ left: h.x, top: h.y }}
                                        onMouseEnter={() => setActiveId(h.id)}
                                        onMouseLeave={() => setActiveId(null)}
                                    >
                                        <div className="relative flex items-center justify-center cursor-pointer p-4 -m-4">
                                            <motion.div
                                                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
                                                transition={{ repeat: Infinity, duration: 3 }}
                                                className="absolute w-10 h-10 bg-primary rounded-full"
                                            />
                                            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(255,46,57,1)] ${activeId === h.id ? "bg-white scale-125 shadow-[0_0_25px_white]" : "bg-primary"}`} />

                                            <AnimatePresence>
                                                {activeId === h.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-6 z-50 pointer-events-none"
                                                    >
                                                        <div className="bg-primary/95 backdrop-blur-sm text-white text-[10px] font-black px-4 py-2 rounded-full whitespace-nowrap shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-white/10">
                                                            {h.label}
                                                        </div>
                                                        <div className="w-2.5 h-2.5 bg-primary rotate-45 mx-auto -mt-1.5" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT: Information (matching screenshot) */}
                    <div className="w-full lg:w-[42%] lg:pl-16 relative z-30">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            className="space-y-6"
                        >
                            <div>
                                <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase block mb-3">
                                    {content.badge || "100% ELECTRIC"}
                                </span>

                                <div className="flex flex-wrap items-center gap-6 mt-2">
                                    <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                                        {content.title || "The Cruzaa"}
                                    </h2>
                                    
                                    <div className="relative group/select">
                                        <select
                                            value={selectedColor}
                                            onChange={(e) => setSelectedColor(e.target.value)}
                                            className="bg-white text-black text-[10px] md:text-[11px] font-black px-8 py-2.5 rounded-full tracking-[0.1em] uppercase appearance-none cursor-pointer focus:outline-none border-none pr-12 shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:bg-gray-100 transition-all duration-300"
                                        >
                                            <option value="Carbon Black">Carbon Black</option>
                                            <option value="Denim Blue">Denim Blue</option>
                                            <option value="Magno Green">Magno Green</option>
                                            <option value="Racing White">Racing White</option>
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronDown className="w-3.5 h-3.5 text-black" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] w-full bg-white/20" />

                            <p
                                className="text-gray-300 text-sm md:text-[15px] leading-relaxed max-w-xl font-medium"
                                dangerouslySetInnerHTML={{ __html: content.description || "" }}
                            />

                            <div className="pt-4">
                                <Link
                                    to={content.link || "/products"}
                                    className="inline-flex items-center justify-center px-12 py-3.5 bg-primary hover:brightness-110 text-primary-foreground font-bold rounded-full transition-all text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                                >
                                    {content.button_text || "Learn More"}
                                </Link>
                            </div>

                            {/* Active Feature Spotlight (Subtle) */}
                            <AnimatePresence>
                                {activeId && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="pt-6 border-t border-white/10"
                                    >
                                        <div className="flex items-center gap-3 text-primary mb-2">
                                            <div className="w-1 h-4 bg-primary rounded-full" />
                                            <h3 className="text-xs font-black uppercase tracking-widest">{hotspots.find(h => h.id === activeId)?.label}</h3>
                                        </div>
                                        <p className="text-gray-400 text-[13px] leading-relaxed italic">{hotspots.find(h => h.id === activeId)?.desc}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default InteractiveProductFeature;
