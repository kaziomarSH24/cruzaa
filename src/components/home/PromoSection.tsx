import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import scooterMain from "@/assets/products/scooter-main.jpg";

import { useContent } from "@/hooks/useContent";

const PromoSection = () => {
  const { getContent } = useContent('homepage');

  return (
    <section className="py-8 md:py-12">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Big Promo Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-white md:row-span-2 min-h-[300px] md:min-h-[500px]"
          >
            <div className="absolute inset-0 opacity-20">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                  backgroundSize: "30px 30px",
                }}
              />
            </div>
            <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                  {getContent('promo_badge_1', 'Limited Time Offer')}
                </span>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight"
                  dangerouslySetInnerHTML={{ __html: getContent('promo_title_1', 'Up to 20% Off<br />All Scooters') }}
                />
                <p className="text-white/80 text-sm md:text-base max-w-xs mb-6">
                  {getContent('promo_desc_1', 'Don\'t miss out on our biggest sale of the year. Premium electric mobility at unbeatable prices.')}
                </p>
              </div>
              <Link
                to={getContent('promo_link_1', '/products')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-full hover:bg-white/90 transition-colors w-fit"
              >
                {getContent('promo_btn_1', 'Shop the Sale')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <img
              src={getContent('promo_image_1', scooterMain)}
              alt="Sale"
              className="absolute -right-16 -bottom-16 w-64 md:w-80 opacity-30 md:opacity-50"
            />
          </motion.div>

          {/* Small Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-charcoal text-white min-h-[200px] md:min-h-[240px]"
          >
            <div className="absolute inset-0 flex items-center justify-end pr-4 md:pr-8">
              <img
                src={getContent('promo_image_2', scooterMain)}
                alt="New Arrivals"
                className="w-32 md:w-48 opacity-60"
              />
            </div>
            <div className="relative h-full flex flex-col justify-center p-6 md:p-8">
              <span className="text-gold text-sm font-medium mb-2">{getContent('promo_badge_2', 'New Arrivals')}</span>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">{getContent('promo_title_2', '2024 Collection')}</h3>
              <Link
                to={getContent('promo_link_2', '/products')}
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm md:text-base"
              >
                {getContent('promo_btn_2', 'Explore Now')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-secondary min-h-[200px] md:min-h-[240px]"
          >
            <div className="h-full flex flex-col justify-center p-6 md:p-8">
              <div className="flex items-center gap-1 text-gold mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">{getContent('promo_title_3', '50K+ Happy Riders')}</h3>
              <p className="text-muted-foreground text-sm md:text-base mb-4">
                {getContent('promo_desc_3', 'Join thousands of satisfied customers across the UK')}
              </p>
              <Link
                to={getContent('promo_link_3', '/our-story')}
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm md:text-base"
              >
                {getContent('promo_btn_3', 'Read Reviews')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
