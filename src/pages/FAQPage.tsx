import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import faqService, { FAQ } from "@/services/faqService";
import { Link } from "react-router-dom";

const FAQPage = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [openId, setOpenId] = useState<number | null>(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const data = await faqService.getFAQs();
                setFaqs(data.filter(f => Boolean(Number(f.is_active))));
            } catch (e) {
                console.error("Failed to load FAQs");
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const filtered = faqs.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <section className="pt-32 pb-16 bg-gradient-to-b from-secondary/50 to-background">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked <span className="text-primary">Questions</span></h1>
                        <p className="text-lg text-muted-foreground mb-12">
                            Everything you need to know about our products, shipping, and warranty.
                        </p>

                        <div className="relative max-w-xl mx-auto mb-16">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for answers..."
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-secondary/50 animate-pulse rounded-2xl" />)
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
                                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <p className="text-muted-foreground font-medium">No results found for your search.</p>
                                <button onClick={() => setSearch("")} className="text-primary mt-2 font-bold">Clear Search</button>
                            </div>
                        ) : (
                            filtered.map((faq, index) => (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white rounded-2xl border transition-all ${openId === faq.id ? 'border-primary shadow-lg ring-1 ring-primary/10' : 'border-border hover:border-primary/50'}`}
                                >
                                    <button
                                        className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                                        onClick={() => setOpenId(openId === faq.id ? null : faq.id!)}
                                    >
                                        <span className="font-bold text-slate-900 pr-8">{faq.question}</span>
                                        {openId === faq.id ? <ChevronUp className="shrink-0 text-primary" /> : <ChevronDown className="shrink-0 text-muted-foreground" />}
                                    </button>

                                    <AnimatePresence>
                                        {openId === faq.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-5 md:p-6 pt-0 text-muted-foreground leading-relaxed border-t border-slate-50">
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="mt-20 max-w-2xl mx-auto bg-primary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-3xl" />

                        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                        <p className="opacity-90 mb-8">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                        <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary font-bold rounded-full hover:bg-white/90 transition-colors shadow-xl">
                            <MessageCircle className="w-5 h-5" /> Get in Touch
                        </Link>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default FAQPage;
