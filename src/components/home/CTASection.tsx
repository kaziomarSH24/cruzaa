import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { useContent } from "@/hooks/useContent";

const CTASection = () => {
  const { getContent } = useContent();
  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-primary to-primary/80">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
            {getContent('cta_title', 'Ready to transform your commute?')}
          </h2>
          <p className="text-lg md:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto">
            {getContent('cta_desc', 'Join thousands of happy riders who have made the switch to sustainable, stylish transportation.')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-primary font-bold rounded-full hover:bg-white/90 transition-colors shadow-lg text-sm md:text-base"
            >
              Explore Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors text-sm md:text-base"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
