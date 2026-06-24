import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle2, Loader2, XCircle, Truck } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUserAuth } from "@/contexts/UserAuthContext";
import customerAuthService from "@/services/customerAuthService";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; step: number }> = {
    pending: { label: "Pending", color: "text-amber-600 bg-amber-100", icon: Clock, step: 0 },
    processing: { label: "Processing", color: "text-blue-600 bg-blue-100", icon: Loader2, step: 1 },
    shipped: { label: "Shipped", color: "text-purple-600 bg-purple-100", icon: Truck, step: 2 },
    delivered: { label: "Delivered", color: "text-emerald-600 bg-emerald-100", icon: CheckCircle2, step: 3 },
    cancelled: { label: "Cancelled", color: "text-red-600 bg-red-100", icon: XCircle, step: -1 },
};

const OrderDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { isLoggedIn } = useUserAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: `/account/orders/${id}` } });
            return;
        }
        customerAuthService.getOrder(Number(id))
            .then(data => { if (data) setOrder(data); else setNotFound(true); })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [isLoggedIn, id]);

    if (loading) return (
        <Layout>
            <section className="pt-32 pb-16 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p>Loading order details...</p>
                </div>
            </section>
        </Layout>
    );

    if (notFound || !order) return (
        <Layout>
            <section className="pt-32 pb-16 min-h-screen">
                <div className="container-custom max-w-2xl mx-auto text-center py-20">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Order not found</h2>
                    <p className="text-muted-foreground mb-6">This order doesn't exist or doesn't belong to your account.</p>
                    <Link to="/account/orders" className="btn-hero-primary inline-flex">View All Orders</Link>
                </div>
            </section>
        </Layout>
    );

    const status = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const progressSteps = ["Pending", "Processing", "Shipped", "Delivered"];

    return (
        <Layout>
            <section className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <div className="container-custom max-w-3xl mx-auto">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
                        <Link to="/account/orders" className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-black">Order #{order.order_number || order.id}</h1>
                            <p className="text-muted-foreground text-sm">{new Date(order.created_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${status.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                        </span>
                    </motion.div>

                    {/* Progress Tracker (not cancelled) */}
                    {order.status !== "cancelled" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-card rounded-2xl border border-border p-6 mb-5">
                            <h2 className="font-bold mb-5">Order Progress</h2>
                            <div className="flex items-center">
                                {progressSteps.map((step, i) => {
                                    const done = i <= status.step;
                                    const current = i === status.step;
                                    return (
                                        <div key={step} className="flex-1 flex items-center">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${done ? "bg-primary border-primary" : "bg-background border-border"}`}>
                                                    {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <div className={`w-2 h-2 rounded-full ${current ? "bg-primary" : "bg-border"}`} />}
                                                </div>
                                                <p className={`text-[10px] font-semibold mt-1.5 whitespace-nowrap ${done ? "text-primary" : "text-muted-foreground"}`}>{step}</p>
                                            </div>
                                            {i < progressSteps.length - 1 && (
                                                <div className={`flex-1 h-0.5 mx-1 transition-all duration-700 ${i < status.step ? "bg-primary" : "bg-border"}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Order Items */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-card rounded-2xl border border-border p-5 md:col-span-2">
                            <h2 className="font-bold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Items Ordered</h2>
                            <div className="space-y-3">
                                {(order.items || []).length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No item details available.</p>
                                ) : order.items.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30">
                                        {item.image ? (
                                            <img src={item.image} alt={item.product_name || item.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                                        ) : (
                                            <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Package className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{item.product_name || item.name || "Product"}</p>
                                            {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-primary flex-shrink-0">£{Number(item.price || 0).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-4 pt-4 border-t border-border space-y-2">
                                {order.shipping_cost > 0 && (
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Shipping</span><span>£{Number(order.shipping_cost).toFixed(2)}</span>
                                    </div>
                                )}
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Discount</span><span>-£{Number(order.discount_amount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-black text-base pt-1">
                                    <span>Total</span>
                                    <span className="text-primary">£{Number(order.total || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Shipping Address */}
                        {(order.shipping_address || order.customer_address) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="bg-card rounded-2xl border border-border p-5">
                                <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Shipping Address</h2>
                                <div className="text-sm text-muted-foreground leading-relaxed">
                                    {order.customer_name && <p className="font-semibold text-foreground">{order.customer_name}</p>}
                                    <p>{order.shipping_address || order.customer_address}</p>
                                    {order.shipping_city && <p>{order.shipping_city}{order.shipping_postcode ? `, ${order.shipping_postcode}` : ""}</p>}
                                    {order.shipping_country && <p>{order.shipping_country}</p>}
                                </div>
                            </motion.div>
                        )}

                        {/* Payment Info */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-5">
                            <h2 className="font-bold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Payment</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method</span>
                                    <span className="font-semibold capitalize">{order.payment_method || "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={`font-bold capitalize ${order.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                                        {order.payment_status || "pending"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </section>
        </Layout>
    );
};

export default OrderDetail;
