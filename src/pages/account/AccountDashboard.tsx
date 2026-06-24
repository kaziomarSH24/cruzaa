import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User, Package, Edit3, LogOut, ShoppingBag, ChevronRight,
    MapPin, CreditCard, Bell, Shield, Mail, Phone, Clock
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";
import customerAuthService from "@/services/customerAuthService";

const AccountDashboard = () => {
    const { user, logout, isLoggedIn } = useUserAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: "/account" } });
            return;
        }
        fetchOrders();
    }, [isLoggedIn]);

    const fetchOrders = async () => {
        try {
            const data = await customerAuthService.getOrders();
            setOrders(data || []);
        } catch {
            // API might not exist yet — silently fail
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/");
    };

    if (!user) return null;

    const stats = [
        { label: "Total Orders", value: orders.length || "—", icon: ShoppingBag, color: "text-blue-500 bg-blue-50" },
        { label: "Pending", value: orders.filter(o => o.status === "pending").length || "—", icon: Clock, color: "text-amber-500 bg-amber-50" },
        { label: "Delivered", value: orders.filter(o => o.status === "delivered").length || "—", icon: Package, color: "text-emerald-500 bg-emerald-50" },
    ];

    const menuItems = [
        { icon: Package, label: "My Orders", desc: "View and track your orders", to: "/account/orders", badge: orders.length > 0 ? `${orders.length}` : null },
        { icon: Edit3, label: "Edit Profile", desc: "Update your personal info", to: "/account/profile", badge: null },
        { icon: MapPin, label: "Addresses", desc: "Manage delivery addresses", to: "/account/addresses", badge: null },
        { icon: CreditCard, label: "Payment Methods", desc: "Saved cards and billing", to: "/account/payment", badge: null },
        { icon: Bell, label: "Notifications", desc: "Email & SMS preferences", to: "/account/notifications", badge: null },
        { icon: Shield, label: "Security", desc: "Password and 2FA settings", to: "/account/security", badge: null },
    ];

    return (
        <Layout>
            <section className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">

                        {/* Profile Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-3xl border border-border p-8 mb-6 relative overflow-hidden"
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/3 rounded-full translate-y-24 -translate-x-24" />

                            <div className="relative flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/30 flex-shrink-0">
                                    {user.first_name[0]}{user.last_name[0]}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-black">
                                        {user.first_name} {user.last_name}
                                    </h1>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5" /> {user.email}
                                        </span>
                                        {user.phone && (
                                            <span className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5" /> {user.phone}
                                            </span>
                                        )}
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                        <Shield className="w-3 h-3" /> Verified Customer
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="hidden md:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="relative grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
                                {stats.map((s) => (
                                    <div key={s.label} className="text-center">
                                        <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                                            <s.icon className="w-5 h-5" />
                                        </div>
                                        <p className="text-2xl font-black">{loadingOrders ? "—" : s.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Recent Orders Quick View */}
                        {orders.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-card rounded-3xl border border-border p-6 mb-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-lg">Recent Orders</h2>
                                    <Link to="/account/orders" className="text-sm text-primary font-medium hover:underline">
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {orders.slice(0, 3).map((order: any) => (
                                        <Link
                                            key={order.id}
                                            to={`/account/orders/${order.id}`}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/60 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">Order #{order.order_number || order.id}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-secondary text-muted-foreground'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Menu Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="grid sm:grid-cols-2 gap-4"
                        >
                            {menuItems.map((item, i) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="group flex items-center gap-4 p-5 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <item.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{item.label}</p>
                                            {item.badge && (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
                                </Link>
                            ))}

                            {/* Sign Out Button */}
                            <button
                                onClick={handleLogout}
                                className="md:hidden group flex items-center gap-4 p-5 bg-card rounded-2xl border border-border hover:border-destructive/30 hover:bg-destructive/5 transition-all duration-300 sm:col-span-2"
                            >
                                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                                    <LogOut className="w-5 h-5 text-destructive" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-destructive">Sign Out</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Log out of your account</p>
                                </div>
                            </button>
                        </motion.div>

                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default AccountDashboard;
