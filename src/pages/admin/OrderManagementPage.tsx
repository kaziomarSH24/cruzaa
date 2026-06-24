import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Search,
    Eye,
    Trash2,
    Calendar,
    CreditCard,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Loader2,
    XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import orderService, { Order } from '@/services/orderService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function OrderManagementPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderService.getOrders();
            setOrders(res);
        } catch (e) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleViewOrder = async (id: number) => {
        try {
            const res = await orderService.getOrder(id);
            setSelectedOrder(res);
            setViewDialogOpen(true);
        } catch (e) {
            toast.error('Failed to load order details');
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await orderService.updateOrderStatus(id, status);
            toast.success('Order status updated');
            fetchOrders();
            if (selectedOrder?.id === id) {
                setSelectedOrder({ ...selectedOrder, order_status: status as any });
            }
        } catch (e) {
            toast.error('Status update failed');
        }
    };

    const handlePaymentStatusUpdate = async (id: number, status: string) => {
        try {
            await orderService.updatePaymentStatus(id, status);
            toast.success('Payment status updated');
            fetchOrders();
            if (selectedOrder?.id === id) {
                setSelectedOrder({ ...selectedOrder, payment_status: status as any });
            }
        } catch (e) {
            toast.error('Payment update failed');
        }
    };

    const handleDeleteOrder = async (id: number) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            await orderService.deleteOrder(id);
            toast.success('Order deleted');
            fetchOrders();
        } catch (e) {
            toast.error('Failed to delete order');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 uppercase text-[10px]">Pending</Badge>;
            case 'processing': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 uppercase text-[10px]">Processing</Badge>;
            case 'shipped': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 uppercase text-[10px]">Shipped</Badge>;
            case 'delivered': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 uppercase text-[10px]">Delivered</Badge>;
            case 'cancelled': return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 uppercase text-[10px]">Cancelled</Badge>;
            default: return <Badge variant="secondary" className="uppercase text-[10px]">{status}</Badge>;
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'paid': return <Badge className="bg-emerald-500 text-white uppercase text-[10px]">Paid</Badge>;
            case 'pending': return <Badge className="bg-slate-400 text-white uppercase text-[10px]">Pending</Badge>;
            case 'failed': return <Badge className="bg-red-500 text-white uppercase text-[10px]">Failed</Badge>;
            case 'refunded': return <Badge className="bg-blue-500 text-white uppercase text-[10px]">Refunded</Badge>;
            default: return <Badge className="uppercase text-[10px]">{status}</Badge>;
        }
    };

    const filteredOrders = orders.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user_email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
                    <p className="text-slate-500 text-sm">Review and fulfill customer orders</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by order #, name..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Order Detail</th>
                                    <th className="px-6 py-4 font-semibold">Customer</th>
                                    <th className="px-6 py-4 font-semibold">Total</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Payment</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                                        </tr>
                                    ))
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">{order.order_number}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">
                                                    {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {order.customer_name || (order.user_first_name ? `${order.user_first_name} ${order.user_last_name}` : 'Guest User')}
                                                </p>
                                                <p className="text-xs text-slate-400">{order.customer_email || order.user_email}</p>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                ${parseFloat(order.total_amount.toString()).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(order.order_status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getPaymentBadge(order.payment_status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 h-8 w-8"
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedOrder && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle>Order Details: {selectedOrder.order_number}</DialogTitle>
                                    <div className="flex gap-2 mr-6">
                                        {getStatusBadge(selectedOrder.order_status)}
                                        {getPaymentBadge(selectedOrder.payment_status)}
                                    </div>
                                </div>
                                <DialogDescription>
                                    Placed on {format(new Date(selectedOrder.created_at), 'PPPP p')}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-2 gap-8 py-4">
                                <section>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Customer Information</h4>
                                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm font-bold text-slate-900">{selectedOrder.customer_name || 'N/A'}</p>
                                        <p className="text-xs text-slate-500">{selectedOrder.customer_email || selectedOrder.user_email}</p>
                                        <p className="text-xs text-slate-500">{selectedOrder.customer_phone || 'No phone provided'}</p>
                                    </div>
                                </section>
                                <section>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Shipping Address</h4>
                                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 h-[calc(100%-2rem)]">
                                        <p className="text-xs text-slate-600 leading-relaxed italic">{selectedOrder.shipping_address || 'No address provided'}</p>
                                    </div>
                                </section>
                            </div>

                            <section className="py-2 border-t mt-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 pt-4">Order Items</h4>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <ShoppingBag className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                                                    <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ${parseFloat(item.unit_price.toString()).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">${parseFloat(item.total_price.toString()).toFixed(2)}</p>
                                        </div>
                                    ))}
                                    <div className="flex flex-col items-end gap-1 pt-4 border-t mt-4 pr-4">
                                        <div className="flex justify-between w-48 text-sm">
                                            <span className="text-slate-500">Subtotal:</span>
                                            <span className="font-bold">${parseFloat(selectedOrder.total_amount.toString()).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between w-48 text-lg pt-2 mt-2 border-t">
                                            <span className="font-bold text-slate-900">Total:</span>
                                            <span className="font-extrabold text-blue-600">${parseFloat(selectedOrder.total_amount.toString()).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-6">
                                <div className="space-y-2">
                                    <Label>Order Status</Label>
                                    <Select
                                        value={selectedOrder.order_status}
                                        onValueChange={(v) => handleStatusUpdate(selectedOrder.id, v)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Status</Label>
                                    <Select
                                        value={selectedOrder.payment_status}
                                        onValueChange={(v) => handlePaymentStatusUpdate(selectedOrder.id, v)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                            <SelectItem value="refunded">Refunded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
