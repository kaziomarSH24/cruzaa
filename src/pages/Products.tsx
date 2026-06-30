import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Filter, Grid, List, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/layout/SEO";
import ProductCard from "@/components/products/ProductCard";
import productService, { Product } from "@/services/productService";
import categoryService, { Category } from "@/services/categoryService";

const Products = ({
  defaultCategory,
  categoryOverride,
}: {
  defaultCategory?: string;
  categoryOverride?: string;
}) => {
  const { category: categoryParam } = useParams();
  const activeCategory = categoryOverride || categoryParam || defaultCategory;
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const isNumeric = activeCategory && !isNaN(Number(activeCategory));
        const filterParams = {
          category_id: isNumeric ? Number(activeCategory) : undefined,
          category_slug: !isNumeric ? activeCategory : undefined,
          limit: 100,
        };

        const [prodRes, catRes] = await Promise.all([
          productService.getProducts(filterParams),
          categoryService.getCategories(),
        ]);
        setProducts(prodRes.products);
        setCategories(catRes);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeCategory]);

  const currentCategory = categories.find((c) =>
    activeCategory && !isNaN(Number(activeCategory))
      ? c.id === Number(activeCategory)
      : c.slug === activeCategory,
  );

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={currentCategory ? currentCategory.name : "Products"}
        description={
          currentCategory
            ? `Browse our collection of ${currentCategory.name}`
            : "Discover Cruzaa's innovative electric scooters and bikes."
        }
      />
      {/* Hero */}
      <section className="pt-40 pb-20 bg-[#1A1A1A] text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-tight whitespace-nowrap">
              {currentCategory ? currentCategory.name : "All Products"}
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {currentCategory
                ? currentCategory.description
                : "Explore our complete range of electric scooters and bikes designed for the modern urban commuter."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="flex flex-col gap-8">
            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-end mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">
                    Sort By:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs font-bold uppercase tracking-wider h-10 min-w-[200px] appearance-none cursor-pointer hover:border-primary transition-colors"
                  >
                    <option value="featured">Default sorting</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>

              {/* Products */}
              {sortedProducts.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                      : "space-y-6"
                  }
                >
                  {sortedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">
                    No products found in this category.
                  </p>
                  <Link
                    to="/products"
                    className="text-primary font-semibold hover:underline"
                  >
                    View all products
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
