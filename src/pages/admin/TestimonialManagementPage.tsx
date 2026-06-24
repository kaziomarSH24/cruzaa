import React, { useState, useEffect } from 'react';
import { Plus, Search, MessageSquare, Save, Trash2, Star, Upload, Loader2, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import testimonialService, { Testimonial } from '@/services/testimonialService';
import { toast } from 'sonner';

export default function TestimonialManagementPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const data = await testimonialService.getTestimonials();
            setTestimonials(data);
        } catch (e) {
            toast.error('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(editing).forEach(([k, v]) => {
                if (v !== null && v !== undefined) formData.append(k, String(v));
            });
            if (file) formData.append('avatar', file);

            await testimonialService.saveTestimonial(formData);
            toast.success('Testimonial saved successfully');
            setEditing(null);
            setFile(null);
            fetchTestimonials();
        } catch (e) {
            toast.error('Failed to save testimonial');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await testimonialService.deleteTestimonial(id);
            toast.success('Testimonial deleted successfully');
            fetchTestimonials();
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    const filtered = testimonials.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-3 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Testimonials</h1>
                        <p className="text-sm text-slate-500">Manage customer feedback showing on the site</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setEditing({ name: '', role: '', content: '', rating: 5, sort_order: 0, is_active: 1 })}>
                        <Plus className="h-4 w-4 mr-2" /> New Testimonial
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search testimonials..."
                        className="pl-10 bg-white"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />)
                    ) : filtered.length === 0 ? (
                        <Card className="border-dashed py-20 text-center bg-slate-50/50">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                            <h3 className="text-slate-900 font-bold">No testimonials yet</h3>
                        </Card>
                    ) : (
                        filtered.map(t => (
                            <div
                                key={t.id}
                                className={`flex items-start gap-4 p-5 border rounded-2xl bg-white transition-all hover:shadow-lg cursor-pointer ${editing?.id === t.id ? 'border-blue-600 ring-1 ring-blue-600' : ''}`}
                                onClick={() => setEditing(t)}
                            >
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 border shrink-0">
                                    {t.avatar ? <img src={t.avatar} className="w-full h-full object-cover" /> : <MessageSquare className="w-full h-full p-3 text-slate-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-slate-900">{t.name}</h4>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{t.role}</p>
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">"{t.content}"</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-300 hover:text-red-500"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id!); }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="lg:col-span-2">
                <Card className="sticky top-24 border-none shadow-2xl">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-lg">{editing?.id ? 'Edit Testimonial' : 'Add Testimonial'}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {editing ? (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="flex justify-center mb-6">
                                    <div className="relative group overflow-hidden w-24 h-24 rounded-full border-4 border-slate-50 bg-slate-100 flex items-center justify-center">
                                        {(file || editing.avatar) ? (
                                            <img src={file ? URL.createObjectURL(file) : editing.avatar} className="w-full h-full object-cover" />
                                        ) : <Upload className="w-6 h-6 text-slate-330" />}
                                        <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-[10px] font-bold">
                                            <Upload className="w-4 h-4 mb-1" /> Change
                                            <input type="file" className="hidden" onChange={e => e.target.files && setFile(e.target.files[0])} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Name</Label>
                                        <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Role/City</Label>
                                        <Input value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Review Content</Label>
                                    <Textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} required className="min-h-[100px]" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Rating (1-5)</Label>
                                        <Input type="number" min="1" max="5" value={editing.rating} onChange={e => setEditing({ ...editing, rating: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Sort Order</Label>
                                        <Input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) })} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <Label>Active Status</Label>
                                    <Switch checked={Boolean(Number(editing.is_active))} onCheckedChange={v => setEditing({ ...editing, is_active: v ? 1 : 0 })} />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button variant="outline" className="flex-1" type="button" onClick={() => { setEditing(null); setFile(null); }}>Discard</Button>
                                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" type="submit" disabled={saving}>
                                        {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Post Feedback
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-20 text-slate-300">
                                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm italic">Customer feedback will appear here</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
