import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/layout/SEO';
import pagesService, { Page, PageImage } from '@/services/pagesService';
import Products from './Products';

const DynamicPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setNotFound(false);
        pagesService.getPage(slug)
            .then(data => {
                setPage(data);
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center pt-32">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            </Layout>
        );
    }

    if (notFound || !page) {
        return <Products categoryOverride={slug} />;
    }

    const imageList = (Array.isArray(page.images) ? page.images : []) as PageImage[];

    return (
        <Layout>
            {page && (
                <SEO 
                    title={page.meta_title || page.title}
                    description={page.meta_description || page.title}
                />
            )}
            {/* Hero */}
            <section className="pt-10 pb-16 bg-gradient-to-b from-secondary/50 to-background relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />
                <div className="container-custom">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-foreground font-medium">{page.title}</span>
                    </nav>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">{page.title}</h1>
                        <div className="w-16 h-1.5 bg-primary rounded-full" />
                    </motion.div>
                </div>
            </section>

            {/* Content + Images */}
            <section className="pb-24">
                <div className="container-custom">
                    <div className={imageList.length > 0 ? 'grid lg:grid-cols-2 gap-16 items-start' : 'max-w-3xl'}>
                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground"
                            dangerouslySetInnerHTML={{ __html: page.content || '' }}
                        />

                        {/* Images Gallery */}
                        {imageList.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                                className="space-y-4 lg:sticky lg:top-28"
                            >
                                {imageList.length === 1 ? (
                                    <div className="relative group rounded-2xl overflow-hidden shadow-2xl">
                                        <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-gold/20 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity" />
                                        <img
                                            src={imageList[0].image_url}
                                            alt={imageList[0].caption || page.title}
                                            className="relative w-full h-auto object-cover rounded-2xl"
                                        />
                                        {imageList[0].caption && (
                                            <p className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 text-white text-sm font-medium rounded-b-2xl">
                                                {imageList[0].caption}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {imageList.map((img, i) => (
                                            <motion.div
                                                key={img.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`relative group rounded-xl overflow-hidden shadow-lg ${i === 0 && imageList.length % 2 !== 0 ? 'col-span-2' : ''}`}
                                            >
                                                <img
                                                    src={img.image_url}
                                                    alt={img.caption || `${page.title} - Image ${i + 1}`}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {img.caption && (
                                                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {img.caption}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default DynamicPage;
