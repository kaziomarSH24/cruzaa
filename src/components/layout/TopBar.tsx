import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const TopBar = () => {
  return (
    <motion.div 
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-white text-sm py-2 hidden sm:block fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-primary"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Left - Contact Info */}
          <div className="flex items-center gap-6">
            <a 
              href="tel:02033268888" 
              className="flex items-center gap-2 hover:text-charcoal transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0203 326 8888</span>
            </a>
            <a 
              href="mailto:info@cruzaa.com" 
              className="flex items-center gap-2 hover:text-charcoal transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden md:inline">hi@cruzaa.com</span>
            </a>
          </div>


          {/* Right - Quick Links */}
          <div className="flex items-center gap-4">
            <Link to="/our-story" className="hover:text-charcoal transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-charcoal transition-colors">
              Support
            </Link>
           
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TopBar;
