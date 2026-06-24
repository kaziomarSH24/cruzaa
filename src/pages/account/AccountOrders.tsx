import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, ChevronRight, Search, Filter } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUserAuth } from "@/contexts/UserAuthContext";
import customerAuthService from "@/services/customerAuthService";

const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
};

const AccountOrders = () => {
    const { isLoggedIn } = useUserAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: "/account/orders" } });
            return;
        }
        customerAuthService.getOrders()
            .then(data => setOrders(data || []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [isLoggedIn]);

    const filtered = orders.filter(o => {
        const matchSearch = search === "" || String(o.id).includes(search) || (o.order_number || "").includes(search);
        const matchFilter = filter === "all" || o.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <Layout>
            <section className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <div className="container-custom max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
                        <Link to="/account" className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black">My Orders</h1>
                            <p className="text-muted-foreground text-sm">Track and manage your purchases</p>
                        </div>
                    </motion.div>

                    {/* Search + filters */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by order number..."
                                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </motion.div>

                    {/* Orders list */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-card rounded-2xl border border-border animate-pulse" />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    {orders.length === 0 ? "No orders yet" : "No matching orders"}
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    {orders.length === 0 ? "Start shopping to see your orders here." : "Try a different search or filter."}
                                </p>
                                {orders.length === 0 && (
                                    <Link to="/products" className="btn-hero-primary inline-flex">
                                        Browse Products
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filtered.map((order: any, i: number) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                    >
                                        <Link
                                            to={`/account/orders/${order.id}`}
                                            className="group flex items-center gap-4 p-5 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                                        >
                                            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Package className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold">Order #{order.order_number || order.id}</p>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-secondary text-muted-foreground"}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                    <span>{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                                                    {order.items_count && <span>{order.items_count} item{order.items_count !== 1 ? "s" : ""}</span>}
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0 flex items-center gap-3">
                                                <div>
                                                    <p className="font-black text-primary">£{Number(order.total || 0).toFixed(2)}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default AccountOrders;
