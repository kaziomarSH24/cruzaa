import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Pencil, Trash2, Eye, EyeOff, Image, X, Upload,
    Loader2, Globe, FileText, Save, ExternalLink, GripVertical,
    CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import pagesService, { Page, PageImage } from '@/services/pagesService';

// ── Rich Text helpers ──────────────────────────────────────
const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── Page Form Modal ───────────────────────────────────────
interface PageFormProps {
    page?: Page | null;
    onClose: () => void;
    onSaved: () => void;
}

function PageForm({ page, onClose, onSaved }: PageFormProps) {
    const [form, setForm] = useState({
        title: page?.title || '',
        slug: page?.slug || '',
        content: page?.content || '',
        meta_title: page?.meta_title || '',
        meta_description: page?.meta_description || '',
        status: (page?.status || 'draft') as 'published' | 'draft',
        sort_order: page?.sort_order || 0,
    });
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState<PageImage[]>(
        Array.isArray(page?.images) && page.images.length > 0 && typeof page.images[0] === 'object'
            ? (page.images as PageImage[])
            : []
    );
    const [uploadingImg, setUploadingImg] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const isEdit = !!page;

    const handleTitleChange = (title: string) => {
        setForm(f => ({ ...f, title, ...(!isEdit ? { slug: slugify(title) } : {}) }));
    };

    const handleSave = async () => {
        if (!form.title || !form.slug) { toast.error('Title and slug are required'); return; }
        setSaving(true);
        try {
            const payload = { ...form, images: images.map(img => ({ url: img.image_url, caption: img.caption, sort_order: img.sort_order })) };
            if (isEdit && page) {
                await pagesService.updatePage(page.id, payload);
                toast.success('Page updated!');
            } else {
                await pagesService.createPage(payload);
                toast.success('Page created!');
            }
            onSaved();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save page');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!page?.id) { toast.error('Save the page first, then add images'); return; }
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImg(true);
        try {
            const result = await pagesService.uploadImage(page.id, file, '', images.length);
            setImages(prev => [...prev, { id: result.id, page_id: page.id, image_url: result.url, caption: '', sort_order: images.length }]);
            toast.success('Image uploaded');
        } catch {
            toast.error('Image upload failed');
        } finally {
            setUploadingImg(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleDeleteImage = async (img: PageImage) => {
        if (!page?.id) return;
        try {
            await pagesService.deleteImage(page.id, img.id);
            setImages(prev => prev.filter(i => i.id !== img.id));
        } catch { toast.error('Failed to delete image'); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4 pt-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Page' : 'Create New Page'}</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Manage page content, images and SEO</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Title + Slug */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Page Title *</label>
                            <input
                                value={form.title}
                                onChange={e => handleTitleChange(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                placeholder="e.g. About Cruzaa"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                                URL Slug *
                                <span className="ml-1 font-normal text-slate-400 text-xs">/{form.slug}</span>
                            </label>
                            <input
                                value={form.slug}
                                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                placeholder="page-url-slug"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Content (HTML supported)</label>
                        <textarea
                            value={form.content}
                            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                            rows={10}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-y"
                            placeholder="<h2>Welcome</h2><p>Your page content here...</p>"
                        />
                        <p className="text-xs text-slate-400 mt-1">You can use HTML tags for formatting.</p>
                    </div>

                    {/* Images */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-slate-700">Images</label>
                            <div className="flex items-center gap-2">
                                {uploadingImg && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    disabled={!isEdit || uploadingImg}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-40 transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    Upload Image
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                        </div>
                        {!isEdit && (
                            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                                💡 Save the page first, then you can upload images.
                            </p>
                        )}
                        {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-3">
                                {images.map((img, i) => (
                                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                                        <img src={img.image_url} alt={img.caption || `Image ${i + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => handleDeleteImage(img)}
                                                className="p-1.5 bg-red-500 rounded-full text-white"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                                            {i + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {images.length === 0 && isEdit && (
                            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 mt-2">
                                <Image className="w-8 h-8 mb-2 opacity-40" />
                                <p className="text-sm">No images yet. Click "Upload Image" to add.</p>
                            </div>
                        )}
                    </div>

                    {/* SEO + Status */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">SEO Meta Title</label>
                            <input
                                value={form.meta_title}
                                onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                placeholder="SEO title (optional)"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">SEO Meta Description</label>
                            <textarea
                                value={form.meta_description}
                                onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                                rows={2}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
                                placeholder="Brief description for search engines..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t bg-slate-50 rounded-b-2xl">
                    {isEdit && (
                        <a href={`/pages/${page?.slug}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                            <ExternalLink className="w-4 h-4" /> Preview Page
                        </a>
                    )}
                    {!isEdit && <span />}
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : (isEdit ? 'Update Page' : 'Create Page')}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────
export default function PagesManagementPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editPage, setEditPage] = useState<Page | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await pagesService.getPages();
            setPages(data);
        } catch {
            toast.error('Failed to load pages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (page: Page) => {
        if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
        setDeletingId(page.id);
        try {
            await pagesService.deletePage(page.id);
            toast.success('Page deleted');
            load();
        } catch { toast.error('Failed to delete'); }
        finally { setDeletingId(null); }
    };

    const handleEdit = (page: Page) => { setEditPage(page); setShowForm(true); };
    const handleNew = () => { setEditPage(null); setShowForm(true); };
    const handleSaved = () => { setShowForm(false); setEditPage(null); load(); };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pages</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Create and manage custom dynamic pages with content and images</p>
                </div>
                <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> New Page
                </Button>
            </div>

            {/* Pages List */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
            ) : pages.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">No pages yet</h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-xs">Create your first custom page with rich content, images, and a unique URL slug.</p>
                        <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" /> Create First Page
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pages.map(page => {
                        const imgCount = Array.isArray(page.images) ? page.images.length : 0;
                        return (
                            <motion.div
                                key={page.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-5 flex items-center gap-4">
                                        {/* Icon */}
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <Globe className="w-6 h-6 text-blue-500" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-slate-900 truncate">{page.title}</h3>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                    page.status === 'published'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {page.status === 'published'
                                                        ? <CheckCircle className="w-3 h-3" />
                                                        : <AlertCircle className="w-3 h-3" />}
                                                    {page.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">/{page.slug}</span>
                                                {imgCount > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Image className="w-3 h-3" /> {imgCount} image{imgCount !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                <span>{new Date(page.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <a
                                                href={`/${page.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="View page"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => handleEdit(page)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Edit page"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(page)}
                                                disabled={deletingId === page.id}
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                                                title="Delete page"
                                            >
                                                {deletingId === page.id
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <PageForm
                        page={editPage}
                        onClose={() => { setShowForm(false); setEditPage(null); }}
                        onSaved={handleSaved}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
