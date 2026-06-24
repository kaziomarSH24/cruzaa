import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div 
      className="product-card group"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-secondary/50">
        {product.badge && (
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-4 left-4 z-10 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-lg"
          >
            {product.badge}
          </motion.span>
        )}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Quick actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.1, backgroundColor: "#000", color: "#fff" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => addItem(product)}
            className="w-12 h-12 bg-white text-foreground border border-foreground flex items-center justify-center shadow-xl"
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
          <Link to={`/product/${product.slug}`}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.1, backgroundColor: "#000", color: "#fff" }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-white text-foreground border border-foreground flex items-center justify-center shadow-xl"
            >
              <Eye className="w-5 h-5" />
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {product.categoryName}
        </span>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-lg font-bold mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-primary">£{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              £{product.originalPrice}
            </span>
          )}
        </div>
        
        <motion.button
          whileHover={{ backgroundColor: "#000", color: "#fff" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addItem(product)}
          className="w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground border border-foreground bg-white transition-all duration-300"
        >
          Add to basket
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
