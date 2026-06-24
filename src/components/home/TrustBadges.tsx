import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On all UK orders",
  },
  {
    icon: Shield,
    title: "2 Year Warranty",
    description: "Full coverage included",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description: "Easy hassle-free returns",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Expert help anytime",
  },
];

const TrustBadges = () => {
  return (
    <section className="py-6 md:py-8 bg-secondary/50 border-b border-border">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, x: 5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3 md:gap-4 cursor-pointer group"
            >
              <motion.div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </motion.div>
              <div>
                <h4 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors">{feature.title}</h4>
                <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
