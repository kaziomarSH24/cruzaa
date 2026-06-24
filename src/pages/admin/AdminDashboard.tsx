/**
 * Admin Dashboard - Real-time Data
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Users, ShoppingBag, MessageSquare, CircleDollarSign,
    TrendingUp, Clock, Settings, Globe, Package,
    RefreshCw, FileText, ArrowUpRight, ShoppingCart,
    AlertTriangle, X, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import pagesService from '@/services/pagesService';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface DashStats {
    products: number;
    orders: number;
    revenue: number;
    new_contacts: number;
    recent_orders: any[];
    recent_contacts: any[];
}

const ORDER_STATUS_STYLE: Record<string, string> = {
    pending:    'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped:    'bg-purple-100 text-purple-700',
    delivered:  'bg-emerald-100 text-emerald-700',
    cancelled:  'bg-red-100 text-red-700',
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [stripeMode, setStripeMode] = useState<'test' | 'live' | null>(null);
    const [stripeDismissed, setStripeDismissed] = useState(false);

    const fetchStats = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const data = await pagesService.getDashboardStats();
            setStats(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
            if (!silent) toast.error('Could not load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load + auto-refresh every 60s
    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(true), 60000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    // Detect Stripe sandbox mode
    useEffect(() => {
        api.get('/settings/public')
            .then(res => {
                const key = res.data?.data?.stripe_publishable_key || '';
                if (key.startsWith('pk_test_')) setStripeMode('test');
                else if (key.startsWith('pk_live_')) setStripeMode('live');
            })
            .catch(() => {}); // silent fail
    }, []);

    const statCards = stats ? [
        {
            label: 'Total Products',
            value: stats.products,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            href: '/admin/products',
            sub: 'Active listings'
        },
        {
            label: 'Total Orders',
            value: stats.orders,
            icon: ShoppingCart,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            href: '/admin/orders',
            sub: 'All time'
        },
        {
            label: 'Revenue (Paid)',
            value: `£${Number(stats.revenue).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: CircleDollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            href: '/admin/orders',
            sub: 'Confirmed payments'
        },
        {
            label: 'New Enquiries',
            value: stats.new_contacts,
            icon: MessageSquare,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
            href: '/admin/contacts',
            sub: 'Awaiting response'
        },
    ] : [];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-slate-500 text-sm">Loading live dashboard data…</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Live data from your store
                        {lastUpdated && (
                            <span className="ml-2 text-slate-400">
                                · Updated {timeAgo(lastUpdated.toISOString())}
                            </span>
                        )}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchStats(true)}
                    disabled={refreshing}
                    className="gap-2 text-slate-600"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stripe Sandbox Alert */}
            {stripeMode === 'test' && !stripeDismissed && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-amber-900">Stripe Test Mode Active</h3>
                        <p className="text-sm text-amber-700 mt-0.5">
                            Your store is currently using Stripe sandbox keys (<span className="font-mono text-xs">pk_test_...</span>).
                            Payments will be simulated and no real money will be processed. Switch to live keys in settings when ready for production.
                        </p>
                        <div className="flex gap-3 mt-3">
                            <Button size="sm" variant="outline" className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800 h-8" asChild>
                                <Link to="/admin/settings">Update Settings</Link>
                            </Button>
                        </div>
                    </div>
                    <button 
                        onClick={() => setStripeDismissed(true)}
                        className="p-1 rounded-lg hover:bg-amber-100 text-amber-400 hover:text-amber-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, i) => (
                    <Link to={stat.href} key={i}>
                        <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-400">
                                            <TrendingUp className="w-3 h-3" />
                                            <span>{stat.sub}</span>
                                        </div>
                                    </div>
                                    <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 space-y-0 py-4">
                        <div>
                            <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
                            <CardDescription className="text-xs">Latest customer orders</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 text-xs hover:bg-blue-50" asChild>
                            <Link to="/admin/orders" className="flex items-center gap-1">
                                View All <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {stats?.recent_orders?.length ? (
                            <div className="divide-y divide-slate-100">
                                {stats.recent_orders.map((order: any) => (
                                    <Link
                                        to={`/admin/orders`}
                                        key={order.id}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <Package className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                #{order.order_number || order.id} — {order.customer_name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {order.item_count || '—'} item{order.item_count !== 1 ? 's' : ''} · £{Number(order.total_amount || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 space-y-1">
                                            <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                                                <Clock className="w-3 h-3" />
                                                {timeAgo(order.created_at)}
                                            </p>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${ORDER_STATUS_STYLE[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {order.status || 'pending'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
                                <p className="text-sm">No orders yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar: Recent Contacts + Quick Actions */}
                <div className="space-y-4">
                    {/* Recent Contacts */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 space-y-0 py-4">
                            <CardTitle className="text-base font-bold">New Enquiries</CardTitle>
                            <Button variant="ghost" size="sm" className="text-blue-600 text-xs hover:bg-blue-50" asChild>
                                <Link to="/admin/contacts" className="flex items-center gap-1">
                                    View All <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {stats?.recent_contacts?.length ? (
                                <div className="divide-y divide-slate-100">
                                    {stats.recent_contacts.map((c: any) => (
                                        <div key={c.id} className="p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                                                <Users className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{c.subject || c.message?.substring(0, 40)}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {timeAgo(c.created_at)}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${c.is_read ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-orange-600'}`}>
                                                {c.is_read ? 'read' : 'new'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                    <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                                    <p className="text-xs">No enquiries yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="border-b bg-slate-50/50 py-4">
                            <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            {[
                                { to: '/admin/products/create', icon: ShoppingBag, color: 'text-blue-500 bg-blue-50', label: 'Add New Product', sub: 'List a new item' },
                                { to: '/admin/pages', icon: FileText, color: 'text-purple-500 bg-purple-50', label: 'Create Page', sub: 'Dynamic content page' },
                                { to: '/admin/settings', icon: Settings, color: 'text-slate-500 bg-slate-100', label: 'Settings', sub: 'Stripe, SMTP, etc.' },
                                { to: '/admin/content', icon: Globe, color: 'text-emerald-500 bg-emerald-50', label: 'Edit Content', sub: 'Homepage & global text' },
                            ].map(action => (
                                <Button key={action.to} variant="outline" className="w-full justify-start h-auto py-2.5 px-3 text-left hover:bg-slate-50" asChild>
                                    <Link to={action.to} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${action.color}`}>
                                            <action.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-xs text-slate-800">{action.label}</p>
                                            <p className="text-[10px] text-slate-400">{action.sub}</p>
                                        </div>
                                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                                    </Link>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
