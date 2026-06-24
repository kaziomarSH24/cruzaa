/**
 * Payment Methods Management Page
 * Enable/Disable and Configure payment gateways
 */

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Trash2,
    Edit,
    Plus,
    Settings2,
    Lock,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Copy,
    Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import paymentMethodService, { PaymentMethod } from '@/services/paymentMethodService';
import { toast } from 'sonner';

export default function PaymentMethodsPage() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethod> | null>(null);

    const fetchMethods = async () => {
        setLoading(true);
        try {
            const res = await paymentMethodService.getPaymentMethods(true);
            setMethods(res);
        } catch (e) {
            toast.error('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const toggleStatus = async (method: PaymentMethod) => {
        try {
            await paymentMethodService.updatePaymentMethod(method.id, {
                ...method,
                is_active: !Number(method.is_active)
            });
            toast.success(`${method.name} ${!Number(method.is_active) ? 'enabled' : 'disabled'}`);
            fetchMethods();
        } catch (e) {
            toast.error('Operation failed');
        }
    };

    const handleSave = async () => {
        if (!editingMethod?.name || !editingMethod?.code) {
            toast.error('Name and Code are required');
            return;
        }

        setSaving(true);
        try {
            if (editingMethod.id) {
                await paymentMethodService.updatePaymentMethod(editingMethod.id, editingMethod as any);
                toast.success('Payment method updated');
            } else {
                await paymentMethodService.createPaymentMethod(editingMethod as any);
                toast.success('Payment method created');
            }
            setIsDialogOpen(false);
            fetchMethods();
        } catch (e) {
            toast.error('Failed to save payment method');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this payment method?')) return;

        try {
            await paymentMethodService.deletePaymentMethod(id);
            toast.success('Payment method deleted');
            fetchMethods();
        } catch (e) {
            toast.error('Failed to delete payment method');
        }
    };

    const openCreateDialog = () => {
        setEditingMethod({
            name: '',
            code: '',
            description: '',
            is_active: true,
            sort_order: 0
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (method: PaymentMethod) => {
        setEditingMethod({ ...method });
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Methods</h1>
                    <p className="text-slate-500 text-sm">Configure how your customers pay for their e-bikes</p>
                </div>
                <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Method
                </Button>
            </div>

            <div className="grid gap-6">
                {loading ? (
                    [1, 2].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />)
                ) : methods.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <CreditCard className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400">No payment methods configured.</p>
                        <Button variant="outline" className="mt-4" onClick={openCreateDialog}>Add your first method</Button>
                    </div>
                ) : (
                    methods.map((method) => (
                        <Card key={method.id} className={!Number(method.is_active) ? "opacity-75 grayscale-[0.2]" : "border-l-4 border-l-blue-600 shadow-sm"}>
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-50 border flex items-center justify-center shrink-0">
                                            {method.code === 'stripe' ? (
                                                <CreditCard className="w-6 h-6 text-blue-600" />
                                            ) : method.code === 'cod' ? (
                                                <Copy className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <CreditCard className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-lg text-slate-900">{method.name}</h3>
                                                <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">{method.code}</Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5">{method.description || 'Global payment gateway integration'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 border-t border-slate-100 sm:pt-0 sm:border-0">
                                        <div className="flex flex-col items-start sm:items-end gap-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Availability</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-slate-600">{Number(method.is_active) ? 'Enabled' : 'Disabled'}</span>
                                                <Switch checked={Boolean(Number(method.is_active))} onCheckedChange={() => toggleStatus(method)} />
                                            </div>
                                        </div>
                                        <div className="h-10 w-[1px] bg-slate-200 hidden sm:block" />
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(method)}>
                                                <Edit className="h-4 w-4 text-slate-600" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="hover:bg-red-50 hover:border-red-200" onClick={() => handleDelete(method.id)}>
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingMethod?.id ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
                        <DialogDescription>
                            Configure the details for this payment option.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Method Name</Label>
                            <Input
                                id="name"
                                value={editingMethod?.name || ''}
                                onChange={(e) => setEditingMethod(prev => ({ ...prev!, name: e.target.value }))}
                                placeholder="e.g. Stripe, PayPal"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code">Method Code (Unique)</Label>
                            <Input
                                id="code"
                                value={editingMethod?.code || ''}
                                onChange={(e) => setEditingMethod(prev => ({ ...prev!, code: e.target.value }))}
                                placeholder="e.g. stripe, paypal"
                                disabled={!!editingMethod?.id}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editingMethod?.description || ''}
                                onChange={(e) => setEditingMethod(prev => ({ ...prev!, description: e.target.value }))}
                                placeholder="Instructions for the user at checkout..."
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="active">Active</Label>
                            <Switch
                                id="active"
                                checked={!!editingMethod?.is_active}
                                onCheckedChange={(val) => setEditingMethod(prev => ({ ...prev!, is_active: val }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Method
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="p-6 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Security Compliance</p>
                        <p className="text-xs text-slate-400">All payment integrations are secured with high-grade encryption and PCI-DSS best practices.</p>
                    </div>
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-100 hover:bg-slate-800">
                    Review SSL Status
                </Button>
            </div>
        </div>
    );
}
