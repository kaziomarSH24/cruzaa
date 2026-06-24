import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import productService, { Product } from "@/services/productService";
import contentService from "@/services/contentService";

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({
    subtitle: "Our Collection",
    title: "Featured Products",
    description: "Discover our best-selling electric vehicles designed for the modern urban lifestyle.",
  });

  useEffect(() => {
    const init = async () => {
      try {
        // Fetch Content Config
        try {
          const [subConf, titleConf, descConf, limitConf] = await Promise.all([
            contentService.getContentByKey("featured_subtitle").catch(() => null),
            contentService.getContentByKey("featured_title").catch(() => null),
            contentService.getContentByKey("featured_desc").catch(() => null),
            contentService.getContentByKey("featured_limit").catch(() => null),
          ]);

          setContent(prev => ({
            subtitle: subConf?.is_active ? subConf.content_value : prev.subtitle,
            title: titleConf?.is_active ? titleConf.content_value : prev.title,
            description: descConf?.is_active ? descConf.content_value : prev.description,
          }));

          // Determine limit
          const limit = limitConf?.is_active && !isNaN(Number(limitConf.content_value))
            ? Number(limitConf.content_value)
            : 6;

          // Fetch Products
          const res = await productService.getProducts({ featured: 1, limit });
          setFeaturedProducts(res.products);

        } catch (e) {
          console.error("Error loading featured section config", e);
          // Fallback fetch
          const res = await productService.getProducts({ featured: 1, limit: 6 });
          setFeaturedProducts(res.products);
        }

      } catch (err) {
        console.error("Failed to fetch featured products", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return null; // Or skeleton
  if (featuredProducts.length === 0) return null;

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12"
        >
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {content.subtitle}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2">
              {content.title}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base">
              {content.description}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-sm md:text-base"
          >
            View All Products
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
