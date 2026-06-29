import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Check,
  Truck,
  RotateCcw,
  Shield,
  Loader2,
  Monitor,
  ShieldCheck,
  Zap,
  BatteryCharging,
  Recycle,
  CircleDashed,
  Move,
  CircleDot
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/products/ProductCard";
import productService, { Product } from "@/services/productService";
import api from "@/services/api";
import { useCart } from "@/contexts/CartContext";
import SEO from "@/components/layout/SEO";

// Custom Icons
import icon1 from "@/assets/icons/1ico.png";
import icon2 from "@/assets/icons/2ico.png";
import icon3 from "@/assets/icons/3ico.png";
import icon4 from "@/assets/icons/4ico.png";
import icon5 from "@/assets/icons/5ico.png";
import icon6 from "@/assets/icons/6ico.png";
import icon7 from "@/assets/icons/7ico.png";
import icon8 from "@/assets/icons/8ico.png";
import icon9 from "@/assets/icons/9ico.png";
import icon10 from "@/assets/icons/ico10.png";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        const productData = productService['mapProduct'](res.data.data);
        setProduct(productData);

        const relatedRes = await productService.getProducts({
          category_id: productData.category_id,
          limit: 4
        });
        setRelatedProducts(relatedRes.products.filter(p => p.id !== productData.id).slice(0, 3));
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link to="/products" className="text-primary hover:underline">
              Back to products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addItem({ ...product, selectedColor }, quantity);
    // @ts-ignore
    if (window.fbq) {
      // @ts-ignore
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'GBP'
      });
    }
  };

  const handleBuyNow = () => {
    addItem({ ...product, selectedColor }, quantity);
    // @ts-ignore
    if (window.fbq) {
      // @ts-ignore
      window.fbq('track', 'InitiateCheckout', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.price,
        currency: 'GBP'
      });
    }
    navigate("/checkout");
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <Layout>
      <SEO
        title={(product as any).seo_title || product.name}
        description={(product as any).seo_description || product.short_description}
        image={product.image}
        type="product"
      />

      {/* Main Product Section */}
      <section className="pt-10 sm:pt-32 pb-16 w-full overflow-hidden">
        <div className="container-custom">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link to="/" className="text-muted-foreground hover:text-primary shrink-0">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <Link to="/products" className="text-muted-foreground hover:text-primary shrink-0">Products</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <Link to={`/${product.category}`} className="text-muted-foreground hover:text-primary shrink-0">
              {product.categoryName}
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-foreground font-medium shrink-0 max-w-[120px] sm:max-w-xs truncate">{product.name}</span>
          </nav>

          {/* Product Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-16">

            {/* ─── Left: Image Gallery ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full min-w-0"
            >
              {/* Main Image Box */}
              <div className="relative w-full rounded-2xl overflow-hidden border border-border/30 bg-white mb-3"
                style={{ aspectRatio: '1 / 1' }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 w-full h-full object-contain p-6"
                  />
                </AnimatePresence>

                {/* Prev / Next */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                  </>
                )}

                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-3 left-3 z-10 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {product.badge}
                  </span>
                )}

                {/* Dot indicators */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {product.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === selectedImage ? 'bg-primary w-4' : 'bg-foreground/30'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-white transition-all duration-200 ${
                      selectedImage === index
                        ? 'border-primary shadow-md shadow-primary/20 scale-105'
                        : 'border-border/40 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* ─── Right: Product Info ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full min-w-0 flex flex-col"
            >
              {/* Category */}
              <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                {product.categoryName}
              </span>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-snug mb-4 text-foreground break-words">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                <span className="text-2xl sm:text-3xl font-black text-primary">
                  £{Number(product.price).toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-base sm:text-lg text-muted-foreground line-through">
                      £{Number(product.originalPrice).toFixed(2)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                      Save £{(Number(product.originalPrice) - Number(product.price)).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Klarna */}
              <div className="inline-flex items-center gap-2.5 mb-5 py-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200/80 w-full sm:w-auto">
                <span className="px-1.5 py-0.5 bg-[#FFB3C7] text-black font-black text-[9px] rounded tracking-tighter shrink-0">KLARNA.</span>
                <p className="text-xs text-slate-600">
                  3 interest-free payments of{" "}
                  <strong className="text-foreground">£{(Number(product.price) / 3).toFixed(2)}</strong>
                </p>
              </div>

              {/* Description */}
              <div 
                className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 break-words max-w-none [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-foreground [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_li]:my-1 [&_a]:text-primary [&_a]:hover:underline [&_p]:my-2"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: product.description || '' }} 
              />

              {/* Specs */}
              {product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs) &&
                Object.keys(product.specs).length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="bg-secondary/40 rounded-xl p-3 border border-border/30">
                        <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-medium">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-foreground break-words">
                          {value as string}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Key Features</h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/80 break-words">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6 p-4 bg-secondary/20 rounded-2xl border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold">Color</span>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {selectedColor?.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        title={color.name}
                        className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-200 ${
                          selectedColor?.hex === color.hex
                            ? 'ring-2 ring-primary ring-offset-2 scale-110'
                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selectedColor?.hex === color.hex && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Qty</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 mb-4">
                <button
                  onClick={handleAddToCart}
                  className="btn-hero-primary w-full py-3.5"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full btn-hero py-3.5 border-2 border-foreground text-foreground hover:bg-foreground hover:text-background"
                >
                  Buy Now
                </button>
              </div>

              {/* Wishlist & Share */}
              {/* <div className="flex gap-3 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl hover:bg-secondary transition-all text-sm font-medium">
                  <Heart className="w-4 h-4" /> Wishlist
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl hover:bg-secondary transition-all text-sm font-medium">
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div> */}

              {/* Trust Badges 
              <div className="grid grid-cols-3 gap-2 pt-5 border-t border-border/40">
                {[
                  { icon: Truck, label: 'Free Delivery' },
                  { icon: RotateCcw, label: '30-Day Returns' },
                  { icon: Shield, label: '2-Year Warranty' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-1.5">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight text-muted-foreground leading-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="pb-10 bg-white border-t border-border/40">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">Main Features</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
            {[
              {
                icon: icon6, // Monitor
                title: "Smart digital LCD display",
                desc: "Display shows mileage, throttle mode, speed and battery life."
              },
              {
                icon: icon10, // Water Resistant specific
                title: "Water Resistant",
                desc: "IP54 Rated, tackles water in wet conditions."
              },
              {
                icon: icon9, // Speedometer
                title: "Throttle modes",
                desc: "Control your top speed by choosing from multiple speed modes."
              },
              {
                icon: icon1, // Battery with bolt
                title: "Powerful battery",
                desc: "Lithium battery that allows scoota to reach speeds of up to 15 mph."
              },
              {
                icon: icon4, // Recycle
                title: "Environmentally friendly",
                desc: "100% electric with easy home friendly charging capability."
              },
              {
                icon: icon8, // Tyre tread
                title: "Road tyres",
                desc: "High grade anti-friction road tyres with monster wheels, to handle 15 degrees angles, bumpy and rocky surfaces."
              },
              {
                icon: icon1, // Battery/Plug
                title: "100% Electric",
                desc: "100% electric scooter reaching speeds up to 14.9 mph."
              },
              {
                icon: icon5, // S-shape Portability
                title: "Lightweight and portable",
                desc: "Foldable and lightweight frame allowing easy transport."
              },
              {
                icon: icon7, // Brake disc
                title: "Smart disk brakes",
                desc: "Front and back brakes for smarter control."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="flex gap-4"
              >
                <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                  <img src={feature.icon} alt={feature.title} className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-base mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-custom">
        <div className="h-1 bg-primary w-full" />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-padding bg-secondary/30">
          <div className="container-custom">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProductCard product={relatedProduct} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetail;
