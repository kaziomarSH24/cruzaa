import { motion } from "framer-motion";
import { Battery, Gauge, Music, Shield, Package, Zap, Sparkles } from "lucide-react";
import scooterDetail2 from "@/assets/products/scooter-detail-2.jpg";

// Custom Icons
import icon1 from "@/assets/icons/1ico.png";
import icon2 from "@/assets/icons/2ico.png";
import icon4 from "@/assets/icons/4ico.png";
import icon5 from "@/assets/icons/5ico.png";
import icon6 from "@/assets/icons/6ico.png";
import icon8 from "@/assets/icons/8ico.png";
import icon9 from "@/assets/icons/9ico.png";
import icon10 from "@/assets/icons/ico10.png";

const features = [
  { icon: icon1, title: "Detachable Battery", desc: "Easy swap & charge anywhere" },
  { icon: icon6, title: "LED Display", desc: "Real-time speed & battery info" },
  { icon: icon2, title: "Built in Speakers", desc: "Stream music" },
  { icon: icon10, title: "Water Resistant", desc: "IP54 Rated, tackles water in light wet conditions" },
  { icon: icon5, title: "Lightweight and Portable", desc: "Foldable and lightweight frame, allowing easy transport" },
  { icon: icon9, title: "Throttle modes", desc: "Cruise control & control speed from multiple speed modes" },
];

import { useContent } from "@/hooks/useContent";

const FeaturesShowcase = () => {
  const { getContent } = useContent('features');

  // Custom features from JSON if available
  let dynamicFeatures = features;
  try {
    const custom = getContent('features_list');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed)) dynamicFeatures = parsed;
    }
  } catch (e) {
    // Handle JSON parse error silently
  }

  return (
    <section className="section-padding bg-charcoal text-white overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">{getContent('features_badge', 'Why Cruzaa?')}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-2 mb-4 md:mb-6"
              dangerouslySetInnerHTML={{ __html: getContent('features_title', 'Packed with <span className="text-primary"> premium features</span>') }}
            />
            <p className="text-base md:text-lg text-white/70 mb-6 md:mb-8 max-w-lg">
              {getContent('features_desc', 'Every Cruzaa vehicle is designed with cutting-edge technology and premium materials to deliver an unmatched riding experience.')}
            </p>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {dynamicFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 md:gap-4"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    {typeof feature.icon === 'string' ? (
                      <img src={feature.icon} alt={feature.title} className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                    ) : feature.icon ? (
                      <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    ) : (
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm md:text-base mb-0.5">{feature.title}</h4>
                    <p className="text-xs md:text-sm text-white/60">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-first lg:order-last"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-gold/30 rounded-3xl blur-2xl" />
            <img
              src={scooterDetail2}
              alt="Cruzaa Features"
              className="relative rounded-2xl w-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;
