import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { items, removeItem, updateQuantity, getTotal } = useCart();
    const subtotal = getTotal();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-background/95 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[101] flex flex-col border-l border-border/50 h-full"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-secondary/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Shopping Cart</h2>
                                    <p className="text-xs text-muted-foreground">
                                        {items.length} {items.length === 1 ? "item" : "items"} in your cart
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-secondary transition-colors"
                                aria-label="Close cart"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Cart Items (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                                        <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Start adding items to see them here!
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="btn-hero-primary px-6 py-2"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map((item) => (
                                        <div key={item.product.id} className="flex gap-4 group">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                                                <img
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-0.5">
                                                <div className="flex justify-between gap-2">
                                                    <div>
                                                        <h4 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">
                                                            <Link to={`/product/${item.product.slug}`} onClick={onClose}>
                                                                {item.product.name}
                                                            </Link>
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.product.categoryName}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.product.id)}
                                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            className="p-1 hover:bg-background rounded-md transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            className="p-1 hover:bg-background rounded-md transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <span className="font-bold text-primary text-sm">
                                                        £{(item.product.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-border bg-secondary/20">
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="font-medium text-emerald-600">Free</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold">Total</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-primary">£{subtotal.toFixed(2)}</span>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                                                Including VAT
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <Link
                                        to="/checkout"
                                        onClick={onClose}
                                        className="flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        to="/cart"
                                        onClick={onClose}
                                        className="flex items-center justify-center py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        View Shopping Cart
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
