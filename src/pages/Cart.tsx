import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen">
          <div className="container-custom">
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added any products yet. Start exploring our collection!
              </p>
              <Link to="/products" className="btn-hero-primary">
                Continue Shopping
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const subtotal = getTotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-secondary/50 text-sm font-medium text-muted-foreground">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border">
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center"
                      >
                        {/* Product */}
                        <div className="md:col-span-6 flex gap-4">
                          <Link
                            to={`/product/${item.product.slug}`}
                            className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0"
                          >
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          <div>
                            <Link
                              to={`/product/${item.product.slug}`}
                              className="font-semibold hover:text-primary transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {item.product.categoryName}
                            </p>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="md:hidden mt-2 text-sm text-destructive flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="md:col-span-2 text-center">
                          <span className="md:hidden text-sm text-muted-foreground mr-2">Price:</span>
                          <span className="font-medium">£{item.product.price}</span>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2 flex items-center justify-center">
                          <div className="flex items-center border border-border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-2 hover:bg-secondary transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-2 hover:bg-secondary transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Total & Remove */}
                        <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                          <span className="font-bold text-primary">
                            £{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="hidden md:flex p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <Link
                    to="/products"
                    className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={clearCart}
                    className="px-6 py-3 text-destructive border border-destructive/20 rounded-lg font-medium hover:bg-destructive/10 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium text-primary">Free</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-lg font-bold text-primary">£{total.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Including VAT</p>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="btn-hero-primary w-full justify-center mb-4"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      🔒 Secure checkout with SSL encryption
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
