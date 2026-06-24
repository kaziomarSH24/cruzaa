import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import testimonialService, { Testimonial } from "@/services/testimonialService";

const TestimonialsSection = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const data = await testimonialService.getTestimonials();
                setTestimonials(data.filter(t => Boolean(Number(t.is_active))));
            } catch (e) {
                console.error("Failed to load testimonials");
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    const next = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    if (loading || testimonials.length === 0) return null;

    return (
        <section className="section-padding bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-blue-600/10 blur-[100px] rounded-full translate-y-1/2" />

            <div className="container-custom relative z-10">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-primary font-bold uppercase tracking-widest text-sm"
                    >
                        Testimonials
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold mt-4"
                    >
                        Loved by <span className="text-primary">Thousands</span> of Riders
                    </motion.h2>
                </div>

                <div className="max-w-4xl mx-auto relative px-4">
                    <div className="relative aspect-[16/10] md:aspect-[21/9] flex items-center justify-center">
                        {testimonials.map((t, idx) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, scale: 0.8, x: 100 }}
                                animate={{
                                    opacity: activeIndex === idx ? 1 : 0,
                                    scale: activeIndex === idx ? 1 : 0.8,
                                    x: activeIndex === idx ? 0 : (idx < activeIndex ? -100 : 100),
                                    zIndex: activeIndex === idx ? 20 : 0
                                }}
                                transition={{ duration: 0.5, type: "spring", damping: 20 }}
                                className={`absolute inset-0 flex flex-col items-center justify-center text-center ${activeIndex === idx ? 'pointer-events-auto' : 'pointer-events-none'}`}
                            >
                                <div className="mb-8 relative">
                                    <Quote className="absolute -top-6 -left-8 w-16 h-16 text-primary/20 -rotate-12" />
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-primary/20 p-1 relative z-10 mx-auto mb-6">
                                        {t.avatar ? (
                                            <img src={t.avatar} alt={t.name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold">{t.name[0]}</div>
                                        )}
                                    </div>
                                    <div className="flex justify-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-primary fill-primary' : 'text-slate-700'}`} />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed italic mb-8 max-w-2xl">
                                    "{t.content}"
                                </p>

                                <div>
                                    <h4 className="text-lg font-bold">{t.name}</h4>
                                    <p className="text-primary text-sm font-medium">{t.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-6 mt-12">
                        <button
                            onClick={prev}
                            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary transition-all group"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:text-primary" />
                        </button>
                        <div className="flex gap-2">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${activeIndex === idx ? 'w-8 bg-primary' : 'bg-white/20'}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={next}
                            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-primary transition-all group"
                        >
                            <ChevronRight className="w-6 h-6 group-hover:text-primary" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
