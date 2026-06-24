import React, { useState, useEffect } from 'react';
import { Plus, Search, HelpCircle, Save, Trash2, Edit, Check, ChevronRight, Loader2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import faqService, { FAQ } from '@/services/faqService';
import { toast } from 'sonner';

export default function FAQManagementPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<FAQ | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const data = await faqService.getFAQs();
            setFaqs(data);
        } catch (e) {
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            await faqService.saveFAQ(editing);
            toast.success('FAQ saved successfully');
            setEditing(null);
            fetchFaqs();
        } catch (e) {
            toast.error('Failed to save FAQ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;
        try {
            await faqService.deleteFAQ(id);
            toast.success('FAQ deleted successfully');
            fetchFaqs();
        } catch (e) {
            toast.error('Failed to delete FAQ');
        }
    };

    const filtered = faqs.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-3 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">FAQ Management</h1>
                        <p className="text-sm text-slate-500">Organize and display help topics for your customers</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setEditing({ question: '', answer: '', category: 'general', sort_order: 0, is_active: 1 })}>
                        <Plus className="h-4 w-4 mr-2" /> New FAQ
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search FAQs by question or answer..."
                        className="pl-10 bg-white"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid gap-3">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />)
                    ) : filtered.length === 0 ? (
                        <Card className="border-dashed py-20 text-center bg-slate-50/50">
                            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                            <h3 className="text-slate-900 font-bold">No FAQs found</h3>
                            <p className="text-sm text-slate-400">Add a new FAQ or adjust your search.</p>
                        </Card>
                    ) : (
                        filtered.map(f => (
                            <div
                                key={f.id}
                                className={`flex items-start gap-4 p-4 border rounded-xl bg-white transition-all hover:shadow-md cursor-pointer ${editing?.id === f.id ? 'border-blue-600 ring-1 ring-blue-600' : ''}`}
                                onClick={() => setEditing(f)}
                            >
                                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-slate-900 truncate">{f.question}</h4>
                                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">{f.answer}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded capitalize">{f.category}</span>
                                        {!Number(f.is_active) && <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded uppercase">Hidden</span>}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-red-500"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(f.id!); }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="lg:col-span-2">
                <Card className="sticky top-24 border-none shadow-xl">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg">{editing?.id ? 'Edit FAQ' : 'New FAQ'}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {editing ? (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Question</Label>
                                    <Input value={editing.question} onChange={e => setEditing({ ...editing, question: e.target.value })} required placeholder="e.g. How long is the warranty?" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Answer</Label>
                                    <Textarea value={editing.answer} onChange={e => setEditing({ ...editing, answer: e.target.value })} required className="min-h-[120px]" placeholder="Explain the answer in detail..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="general" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Sort Order</Label>
                                        <Input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <Label>Display publicly</Label>
                                    <Switch checked={Boolean(Number(editing.is_active))} onCheckedChange={v => setEditing({ ...editing, is_active: v ? 1 : 0 })} />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="outline" className="flex-1" type="button" onClick={() => setEditing(null)}>Cancel</Button>
                                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" type="submit" disabled={saving}>
                                        {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save FAQ
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-20 text-slate-300">
                                <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm italic">Select an FAQ to edit or create a new one</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
