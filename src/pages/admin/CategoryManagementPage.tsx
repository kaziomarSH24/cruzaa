/**
 * Category Management Page
 * Handles hierarchical category management
 */

import React, { useState, useEffect } from 'react';
import {
    Plus,
    FolderPlus,
    Trash2,
    Edit2,
    ChevronRight,
    ChevronDown,
    Layers,
    Image as ImageIcon,
    Save,
    X,
    Upload,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import categoryService, { Category } from '@/services/categoryService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [parentId, setParentId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState<any>({
        name: '',
        slug: '',
        description: '',
        is_active: true,
        show_on_home: false,
        sort_order: '0'
    });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await categoryService.getCategories(true);
            setCategories(res);
        } catch (e) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', slug: '', description: '', is_active: true, show_on_home: false, sort_order: '0' });
        setEditingId(null);
        setParentId(null);
        setFile(null);
        setPreview('');
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat.id);
        setParentId(cat.parent_id || null);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            is_active: Boolean(Number(cat.is_active)),
            show_on_home: Boolean(Number(cat.show_on_home)),
            sort_order: cat.sort_order.toString()
        });
        setPreview(cat.image_url || '');
    };

    const startAddSub = (parentIdx: number) => {
        resetForm();
        setParentId(parentIdx);
        // Focus form
        document.getElementById('cat-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(k => {
                let val = formData[k];
                if (typeof val === 'boolean') val = val ? '1' : '0';
                data.append(k, val);
            });
            if (parentId) data.append('parent_id', parentId.toString());
            if (file) data.append('image', file);

            if (editingId) {
                await categoryService.updateCategory(editingId, data);
                toast.success('Category updated');
            } else {
                await categoryService.createCategory(data);
                toast.success('Category created');
            }
            resetForm();
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category? This will fail if it has subcategories or products.')) return;
        try {
            await categoryService.deleteCategory(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to delete category');
        }
    };

    const CategoryItem = ({ cat, level = 0 }: { cat: Category; level?: number }) => {
        const [isOpen, setIsOpen] = useState(true);
        const hasChildren = cat.children && cat.children.length > 0;

        return (
            <div className="space-y-2">
                <div className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border group transition-all duration-200",
                    editingId === cat.id ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50",
                    !cat.is_active && "opacity-60 grayscale-[0.5]"
                )}>
                    {hasChildren ? (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    ) : <div className="w-6" />}

                    <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center overflow-hidden shrink-0">
                        {cat.image_url ? <img src={cat.image_url} className="w-full h-full object-cover" /> : <Layers className="w-5 h-5 text-slate-300" />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                            {cat.name}
                            {!cat.is_active && <Badge variant="outline" className="text-[9px] py-0 h-4">Inactive</Badge>}
                            {cat.show_on_home && <Badge variant="secondary" className="text-[9px] py-0 h-4 bg-orange-50 text-orange-600 border-orange-100 italic">Home Page</Badge>}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter">/{cat.slug}</p>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-100" onClick={() => startAddSub(cat.id)}>
                            <FolderPlus className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-600 hover:bg-slate-100" onClick={() => startEdit(cat)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-100" onClick={() => handleDelete(cat.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {hasChildren && isOpen && (
                    <div className="ml-8 border-l-2 border-slate-100 pl-4 space-y-2">
                        {cat.children?.map(child => <CategoryItem key={child.id} cat={child} level={level + 1} />)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-500">
            {/* Category List */}
            <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
                        <p className="text-slate-500 text-sm">Organize your store hierarchy</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetForm} className="gap-2">
                        <Plus className="h-4 w-4" /> New Top Category
                    </Button>
                </div>

                <div className="space-y-3">
                    {loading && categories.length === 0 ? (
                        <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-slate-200" /></div>
                    ) : categories.length === 0 ? (
                        <Card className="border-dashed py-12 text-center text-slate-400">
                            <CardContent>No categories created yet.</CardContent>
                        </Card>
                    ) : (
                        categories.map(cat => <CategoryItem key={cat.id} cat={cat} />)
                    )}
                </div>
            </div>

            {/* Category Form */}
            <div className="lg:col-span-2" id="cat-form">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Category' : parentId ? 'Add Subcategory' : 'Create Category'}</CardTitle>
                        <CardDescription>
                            {parentId ? `Adding to: ${categories.find(c => c.id === parentId)?.name || 'Parent'}` : 'Top-level department listing'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="grid gap-2">
                                <Label>Category Image</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0">
                                        {preview ? <img src={preview} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-slate-200" />}
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-200">
                                            <Upload className="w-3.5 h-3.5" /> Upload Photo
                                            <Input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    setFile(e.target.files[0]);
                                                    setPreview(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }} />
                                        </label>
                                        <p className="text-[10px] text-slate-400">Recommended 500x500px JPG/PNG</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cat-name">Name</Label>
                                <Input
                                    id="cat-name"
                                    placeholder="e.g. Electric Scooters"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => {
                                        const next = { ...p, name: e.target.value };
                                        if (!editingId) next.slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                        return next;
                                    })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cat-slug">Slug</Label>
                                <Input
                                    id="cat-slug"
                                    placeholder="electric-scooters"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Parent Category</Label>
                                <Select
                                    value={parentId?.toString() || "none"}
                                    onValueChange={(val) => setParentId(val === "none" ? null : parseInt(val))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Top Level)</SelectItem>
                                        {categoryService.flattenCategories(categories)
                                            .filter(c => c.id !== editingId)
                                            .map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.label}
                                                </SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cat-desc">Description (Optional)</Label>
                                <Input id="cat-desc" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the category" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 border rounded-xl h-[40px] mt-auto">
                                    <Label className="text-xs">Active Status</Label>
                                    <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData(p => ({ ...p, is_active: val }))} />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-xl h-[40px] mt-auto">
                                    <Label className="text-xs">Show on Home</Label>
                                    <Switch checked={formData.show_on_home} onCheckedChange={(val) => setFormData(p => ({ ...p, show_on_home: val }))} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Sort Order</Label>
                                <Input type="number" value={formData.sort_order} onChange={(e) => setFormData(p => ({ ...p, sort_order: e.target.value }))} />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button variant="ghost" type="button" className="flex-1" onClick={resetForm}><X className="mr-2 h-4 w-4" /> Clear</Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                    {editingId ? 'Update Category' : 'Save Category'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
