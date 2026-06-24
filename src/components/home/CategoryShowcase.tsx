import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import categoryService, { Category } from "@/services/categoryService";
import { useContent } from "@/hooks/useContent";

// Fallback images if category has no image
import scooterMain from "@/assets/products/scooter-main.jpg";
import scooterDetail1 from "@/assets/products/scooter-detail-1.jpg";
import scooterDetail3 from "@/assets/products/scooter-detail-3.jpg";

const fallbackImages = [scooterMain, scooterDetail1, scooterDetail3];

const CategoryShowcase = () => {
  const { getContent } = useContent('homepage');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const homeCategories = await categoryService.getHomeCategories();
        if (homeCategories.length > 0) {
          setCategories(homeCategories);
        } else {
          // Fallback to static or first few categories if none marked for home
          const allCats = await categoryService.getCategories();
          setCategories(allCats.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="section-padding flex justify-center items-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12"
        >
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">{getContent('cats_badge', 'Categories')}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2">{getContent('cats_title', 'Shop by Category')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("left")}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary hover:border-primary/50 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("right")}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-border flex items-center justify-center hover:bg-secondary hover:border-primary/50 transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Categories Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[380px] snap-start"
            >
              <Link
                to={`/${category.slug}`}
                className="group block relative overflow-hidden rounded-2xl aspect-[4/5] shadow-lg hover:shadow-2xl transition-shadow duration-500"
              >
                <motion.img
                  src={category.image_url || fallbackImages[index % fallbackImages.length]}
                  alt={category.name}
                  className="w-full h-full object-fill"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent group-hover:via-charcoal/50 transition-all duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold text-white mb-2"
                    whileHover={{ x: 5 }}
                  >
                    {category.name}
                  </motion.h3>
                  {category.description && (
                    <p className="text-white/70 mb-4 text-sm md:text-base line-clamp-2">{category.description}</p>
                  )}
                  <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm md:text-base">
                    Shop Now
                    <motion.span
                      className="inline-block"
                      whileHover={{ x: 8 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
