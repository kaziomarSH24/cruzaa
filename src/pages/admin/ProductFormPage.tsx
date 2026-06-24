/**
 * Product Form Page
 * Handles both Create and Update operations for products
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Upload,
    X,
    Image as ImageIcon,
    ChevronRight,
    Loader2,
    Trash2,
    Plus,
    Palette,
    Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';
import api from '@/services/api';
import { toast } from 'sonner';

// Preset color options with hex values
const PRESET_COLORS = [
    { name: 'Carbon Black', hex: '#1a1a1a' },
    { name: 'Pearl White', hex: '#f5f5f0' },
    { name: 'Steel Grey', hex: '#6b7280' },
    { name: 'Metallic Silver', hex: '#c0c0c0' },
    { name: 'Racing Red', hex: '#dc2626' },
    { name: 'Ocean Blue', hex: '#2563eb' },
    { name: 'Forest Green', hex: '#16a34a' },
    { name: 'Midnight Navy', hex: '#1e3a5f' },
    { name: 'Burnt Orange', hex: '#ea580c' },
    { name: 'Sand Gold', hex: '#ca8a04' },
];

interface ColorVariant {
    name: string;
    hex: string;
    image?: string; // URL to the specific image for this color
}

export default function ProductFormPage() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        name: '',
        slug: '',
        sku: '',
        price: '',
        sale_price: '',
        description: '',
        short_description: '',
        category_id: '',
        stock_quantity: '0',
        low_stock_threshold: '5',
        manage_stock: true,
        is_active: true,
        is_featured: false,
        seo_title: '',
        seo_description: '',
    });
    const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);
    const [colors, setColors] = useState<ColorVariant[]>([]);
    const [customColorName, setCustomColorName] = useState('');
    const [customColorHex, setCustomColorHex] = useState('#000000');
    const [customColorImage, setCustomColorImage] = useState('');

    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [previewFeatured, setPreviewFeatured] = useState<string>('');
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [previewGallery, setPreviewGallery] = useState<{ url: string, isUploading: boolean, uploadedUrl?: string }[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await categoryService.getCategories();
                setCategories(categoryService.flattenCategories(res));
            } catch (e) {
                toast.error('Failed to load categories');
            }
        };

        const loadProduct = async () => {
            if (!isEdit) return;
            try {
                const product = await productService.getProduct(Number(id));
                setFormData({
                    name: product.name || '',
                    slug: product.slug || '',
                    sku: product.sku || '',
                    price: (product as any).rawPrice?.toString() || '',
                    sale_price: (product as any).rawSalePrice?.toString() || '',
                    description: product.description || '',
                    short_description: (product as any).short_description || (product as any).shortDescription || '',
                    category_id: product.category_id?.toString() || '',
                    stock_quantity: (product as any).stock_quantity?.toString() || '0',
                    low_stock_threshold: (product as any).low_stock_threshold?.toString() || '5',
                    manage_stock: Boolean((product as any).manage_stock ?? true),
                    is_active: Boolean(Number((product as any).is_active ?? 1)),
                    is_featured: Boolean(Number((product as any).is_featured ?? 0)),
                    seo_title: (product as any).seo_title || '',
                    seo_description: (product as any).seo_description || '',
                    stock_status: (product as any).stock_status || 'in_stock',
                    weight: (product as any).weight || '',
                    dimensions: (product as any).dimensions || '',
                });

                // Map specs
                const rawSpecs = (product as any).specs;
                if (rawSpecs && typeof rawSpecs === 'object' && !Array.isArray(rawSpecs)) {
                    const specsArray = Object.entries(rawSpecs).map(([key, value]) => ({ key, value: value as string }));
                    setSpecs(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);
                } else {
                    setSpecs([{ key: '', value: '' }]);
                }

                // Map colors
                const rawColors = (product as any).colors;
                if (Array.isArray(rawColors)) {
                    setColors(rawColors);
                } else {
                    setColors([]);
                }

                setPreviewFeatured((product as any).featured_image_url || '');
                setExistingImages((product as any).rawImages || []);

                // Fetch fresh images from product
                try {
                    const fresh = await productService.getProduct(Number(id));
                    const imgs = (fresh as any).rawImages || [];
                    setExistingImages(imgs);
                } catch {
                    // Handle image fetch error silently
                }
            } catch (e) {
                toast.error('Failed to load product details');
                navigate('/admin/products');
            } finally {
                setFetching(false);
            }
        };

        loadCategories();
        loadProduct();
    }, [id, isEdit, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => {
            const newData = { ...prev, [name]: value };
            if (name === 'name' && !isEdit) {
                newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
            return newData;
        });
    };

    const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFeaturedImage(file);
            setPreviewFeatured(URL.createObjectURL(file));
        }
    };

    const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            
            // Add to previews immediately with loading state
            const newPreviews = newFiles.map(file => ({
                url: URL.createObjectURL(file),
                isUploading: true
            }));
            setPreviewGallery(prev => [...prev, ...newPreviews]);

            // Upload each file in parallel
            newFiles.forEach(async (file, index) => {
                const uploadFormData = new FormData();
                uploadFormData.append('image', file);
                try {
                    const res = await api.post('/upload', uploadFormData);
                    const uploadedUrl = res.data.data.url;
                    
                    setPreviewGallery(prev => {
                        const updated = [...prev];
                        // Find the corresponding preview item. 
                        // Note: this index logic is a bit tricky with async updates, 
                        // but since we append, we can try to match by temporary URL or just track the global index.
                        // Better: track by object reference if possible, but state is immutable.
                        // Let's find the first one that is uploading and matches.
                        const itemIndex = updated.findIndex(item => item.isUploading && !item.uploadedUrl);
                        if (itemIndex !== -1) {
                            updated[itemIndex] = { ...updated[itemIndex], isUploading: false, uploadedUrl };
                        }
                        return updated;
                    });
                } catch (err) {
                    toast.error(`Failed to upload ${file.name}`);
                    // Remove from previews if failed
                    setPreviewGallery(prev => prev.filter(item => item.url !== URL.createObjectURL(file)));
                }
            });
        }
    };

    const removeGalleryImage = (index: number) => {
        setPreviewGallery(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = async (imgId: number) => {
        try {
            await productService.deleteProductImage(Number(id), imgId);
            setExistingImages(prev => prev.filter((img: any) => img.id !== imgId));
            toast.success('Gallery image removed');
        } catch (e) {
            toast.error('Failed to remove image');
        }
    };

    // Specs helpers
    const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
    const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
    const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    // Color helpers
    const addPresetColor = (preset: any) => {
        if (!colors.find(c => c.hex === preset.hex)) {
            setColors(prev => [...prev, { ...preset, image: '' }]);
        }
    };
    const addCustomColor = () => {
        if (!customColorName.trim()) {
            toast.error('Please enter a color name');
            return;
        }
        setColors(prev => [...prev, { name: customColorName.trim(), hex: customColorHex, image: customColorImage }]);
        setCustomColorName('');
        setCustomColorHex('#000000');
        setCustomColorImage('');
    };
    const removeColor = (index: number) => setColors(prev => prev.filter((_, i) => i !== index));

    const handleColorImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        try {
            toast.loading('Uploading color image...', { id: 'clr' });
            const res = await api.post('/upload', uploadFormData);
            const newColors = [...colors];
            newColors[index].image = res.data.data.url;
            setColors(newColors);
            toast.success('Uploaded', { id: 'clr' });
        } catch {
            toast.error('Upload failed', { id: 'clr' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();

            // Append only primitive/scalar fields — NOT the mapped images array
            const skipKeys = ['specs', 'colors', 'images', 'rawImages', 'featured_image_url',
                'category_name', 'categoryName', 'shortDescription', 'inStock',
                'originalPrice', 'features'];

            Object.keys(formData).forEach(key => {
                if (skipKeys.includes(key)) return;
                let val = formData[key];
                // CRITICAL: booleans must be '1'/'0', NOT 'true'/'false'
                if (typeof val === 'boolean') val = val ? '1' : '0';
                if (val !== null && val !== undefined && val !== '') {
                    submitData.append(key, String(val));
                }
            });

            // Specs
            const specsObj = specs
                .filter(s => s.key.trim() && s.value.trim())
                .reduce((acc, s) => ({ ...acc, [s.key.trim()]: s.value.trim() }), {});
            submitData.append('specs', JSON.stringify(specsObj));

            // Colors
            submitData.append('colors', JSON.stringify(colors));

            // Featured image
            if (featuredImage) {
                submitData.append('featured_image', featuredImage);
            }

            // Gallery — send pre-uploaded URLs for better performance
            const uploadedGalleryUrls = previewGallery
                .filter(item => item.uploadedUrl && !item.isUploading)
                .map(item => item.uploadedUrl);
            
            if (uploadedGalleryUrls.length > 0) {
                submitData.append('gallery_urls', JSON.stringify(uploadedGalleryUrls));
            }

            // Fallback: still send files if any haven't finished uploading (though usually we should wait)
            // But with the new system, galleryImages state is actually not used anymore for final submit
            // because we use previewGallery.uploadedUrl.
            // Let's remove the direct images[] append if we have gallery_urls.

            if (isEdit) {
                await productService.updateProduct(Number(id), submitData);
                toast.success('Product updated successfully');
            } else {
                await productService.createProduct(submitData);
                toast.success('Product created successfully');
            }
            navigate('/admin/products');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20 max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Top Bar */}
            <div className="flex items-center justify-between sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md py-4 border-b -mx-4 px-4 lg:-mx-8 lg:px-8">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/admin/products"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
                        <p className="text-xs text-slate-500">Save your changes to publish the product</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" type="button" onClick={() => navigate('/admin/products')}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[120px]" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEdit ? 'Update' : 'Publish'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Cruzaa Graphite E-Bike" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug (URL)</Label>
                                    <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="cruzaa-graphite-e-bike" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="CRZ-GP-001" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="short_description">Short Description</Label>
                                <Input id="short_description" name="short_description" value={formData.short_description} onChange={handleInputChange} placeholder="Catchy one-liner for search results" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Full Description</Label>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b">
                                        <button type="button" onClick={() => { document.execCommand('bold'); document.getElementById('description')?.focus(); }} className="px-2 py-1 hover:bg-slate-200 rounded text-xs font-bold" title="Bold (Ctrl+B)">B</button>
                                        <button type="button" onClick={() => { document.execCommand('italic'); document.getElementById('description')?.focus(); }} className="px-2 py-1 hover:bg-slate-200 rounded text-xs italic" title="Italic (Ctrl+I)">I</button>
                                        <button type="button" onClick={() => { document.execCommand('underline'); document.getElementById('description')?.focus(); }} className="px-2 py-1 hover:bg-slate-200 rounded text-xs underline" title="Underline (Ctrl+U)">U</button>
                                        <div className="w-px bg-slate-300" />
                                        <button type="button" onClick={() => { document.execCommand('insertUnorderedList'); document.getElementById('description')?.focus(); }} className="px-2 py-1 hover:bg-slate-200 rounded text-xs" title="Bullet List">• List</button>
                                        <button type="button" onClick={() => { document.execCommand('createLink', false, prompt('Enter URL:') || ''); document.getElementById('description')?.focus(); }} className="px-2 py-1 hover:bg-slate-200 rounded text-xs" title="Add Link">Link</button>
                                        <div className="w-px bg-slate-300" />
                                        <button type="button" onClick={() => { document.execCommand('formatBlock', false, 'h2'); document.getElementById('description')?.focus(); }} className="px-2 py-1 hover:bg-slate-200 rounded text-xs font-bold">H2</button>
                                        <button type="button" onClick={() => { document.execCommand('formatBlock', false, 'h3'); document.getElementById('description')?.focus(); }} className="px-2 py-1 hover:bg-slate-200 rounded text-xs">H3</button>
                                    </div>
                                    <div
                                        id="description"
                                        contentEditable
                                        onInput={(e) => {
                                            const html = e.currentTarget.innerHTML;
                                            setFormData((prev: any) => ({ ...prev, description: html }));
                                        }}
                                        onClick={() => (e.currentTarget as HTMLElement).focus()}
                                        className="min-h-[200px] p-3 outline-none text-sm"
                                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                                        dangerouslySetInnerHTML={{ __html: formData.description }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Use the toolbar above to format your description</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Specifications */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Product Specifications</CardTitle>
                                <CardDescription>Add technical details like Speed, Range, Power, etc.</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addSpec}>
                                <Plus className="w-4 h-4 mr-1" /> Add Spec
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {specs.map((spec, index) => (
                                <div key={index} className="flex gap-4 items-start animate-in slide-in-from-left-2 duration-300">
                                    <div className="flex-1">
                                        <Input value={spec.key} onChange={(e) => updateSpec(index, 'key', e.target.value)} placeholder="Attribute (e.g. Max Speed)" className="bg-slate-50" />
                                    </div>
                                    <div className="flex-[2]">
                                        <Input value={spec.value} onChange={(e) => updateSpec(index, 'value', e.target.value)} placeholder="Value (e.g. 25 mph)" />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" onClick={() => removeSpec(index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {specs.length === 0 && (
                                <div className="text-center py-6 border-2 border-dashed rounded-lg bg-slate-50/50">
                                    <p className="text-sm text-slate-500">No specifications added yet.</p>
                                    <Button type="button" variant="link" size="sm" onClick={addSpec}>Click here to add the first one</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Color Variations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-blue-500" /> Color Variations</CardTitle>
                            <CardDescription>Define available color options and link specific images</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Selected colors with Image Assign */}
                            {colors.length > 0 && (
                                <div className="space-y-3">
                                    {colors.map((color, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border rounded-xl group animate-in slide-in-from-top-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full border shadow-inner flex-shrink-0" style={{ backgroundColor: color.hex }} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{color.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono uppercase">{color.hex}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    {color.image ? (
                                                        <div className="relative w-12 h-12 rounded border bg-white overflow-hidden group/img">
                                                            <img src={color.image} className="w-full h-full object-contain" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const nc = [...colors];
                                                                    nc[i].image = '';
                                                                    setColors(nc);
                                                                }}
                                                                className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="w-12 h-12 rounded border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                                            <Upload className="w-4 h-4 text-slate-400" />
                                                            <span className="text-[8px] font-bold text-slate-500 uppercase">Img</span>
                                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleColorImageUpload(i, e)} />
                                                        </label>
                                                    )}
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeColor(i)} className="text-slate-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Preset swatches */}
                            <div className="pt-2">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Quick Add Presets</p>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map((preset) => {
                                        const isAdded = colors.some(c => c.hex === preset.hex);
                                        return (
                                            <button
                                                key={preset.hex}
                                                type="button"
                                                onClick={() => addPresetColor(preset)}
                                                disabled={isAdded}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isAdded
                                                    ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                                                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700'
                                                    }`}
                                            >
                                                <span className="w-3 h-3 rounded-full border border-slate-400/20" style={{ backgroundColor: preset.hex }} />
                                                {preset.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom color manual */}
                            <div className="border-t pt-4">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Add Custom Color</p>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                                    <div className="grid gap-1.5 sm:col-span-2">
                                        <Label className="text-xs">Label Name</Label>
                                        <Input
                                            value={customColorName}
                                            onChange={e => setCustomColorName(e.target.value)}
                                            placeholder="e.g. Matte Titanium"
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label className="text-xs">Hex/Pick</Label>
                                        <div className="flex items-center gap-2 h-9 px-3 border rounded-md">
                                            <input
                                                type="color"
                                                value={customColorHex}
                                                onChange={e => setCustomColorHex(e.target.value)}
                                                className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                                            />
                                            <span className="text-[10px] font-mono">{customColorHex}</span>
                                        </div>
                                    </div>
                                    <Button type="button" variant="outline" onClick={addCustomColor} className="h-9 w-full">
                                        <Plus className="w-4 h-4 mr-1" /> Add
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Media</CardTitle>
                            <CardDescription>Upload featured image and gallery</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Featured Image */}
                            <div>
                                <Label className="mb-2 block">Featured Image</Label>
                                <div className="relative group border-2 border-dashed border-slate-200 rounded-xl p-4 transition-colors hover:border-blue-400">
                                    {previewFeatured ? (
                                        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                                            <img src={previewFeatured} alt="Featured" className="w-full h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => { setPreviewFeatured(''); setFeaturedImage(null); }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center aspect-video cursor-pointer">
                                            <Upload className="w-10 h-10 text-slate-300 mb-2" />
                                            <span className="text-sm font-medium text-slate-500">Click to upload principal product image</span>
                                            <Input type="file" className="hidden" accept="image/*" onChange={handleFeaturedImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Gallery */}
                            <div>
                                <Label className="mb-2 block">Product Gallery <span className="text-xs text-slate-400 font-normal ml-1">({existingImages.length + galleryImages.length} images)</span></Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {/* Existing saved images */}
                                    {existingImages.map((img: any) => (
                                        <div key={img.id} className="relative aspect-square rounded-lg border overflow-hidden group">
                                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(img.id)}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-6 h-6 text-white" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* New gallery previews (uploaded or uploading) */}
                                    {previewGallery.map((item, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg border-2 border-blue-200 overflow-hidden group">
                                            <img src={item.url} className="w-full h-full object-cover opacity-60" alt="" />
                                            {item.isUploading ? (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">UPLOADED</div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(i)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add button */}
                                    <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 bg-slate-50 transition-colors">
                                        <Plus className="w-6 h-6 text-slate-400" />
                                        <span className="text-[10px] mt-1 font-medium text-slate-500 uppercase">Add Media</span>
                                        <Input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryChange} />
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select value={formData.category_id} onValueChange={(val) => setFormData((p: any) => ({ ...p, category_id: val }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="grid gap-0.5">
                                    <Label className="text-sm">Status</Label>
                                    <p className="text-[10px] text-slate-500">Visible to customers</p>
                                </div>
                                <Switch
                                    checked={!!formData.is_active}
                                    onCheckedChange={(val) => setFormData((p: any) => ({ ...p, is_active: val }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="grid gap-0.5">
                                    <Label className="text-sm">Featured</Label>
                                    <p className="text-[10px] text-slate-500">Show in featured collections</p>
                                </div>
                                <Switch
                                    checked={!!formData.is_featured}
                                    onCheckedChange={(val) => setFormData((p: any) => ({ ...p, is_featured: val }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Regular Price ($)</Label>
                                <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sale_price">Sale Price ($)</Label>
                                <Input id="sale_price" name="sale_price" type="number" step="0.01" value={formData.sale_price} onChange={handleInputChange} />
                            </div>
                            <div className="h-px bg-slate-100 my-2" />
                            <div className="grid gap-2">
                                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                                <Input id="stock_quantity" name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleInputChange} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="low_stock_threshold">Low Stock Warning</Label>
                                <Input id="low_stock_threshold" name="low_stock_threshold" type="number" value={formData.low_stock_threshold} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Optimization</CardTitle>
                            <CardDescription>Customize search engine presence</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="seo_title">Meta Title</Label>
                                <Input id="seo_title" name="seo_title" value={formData.seo_title} onChange={handleInputChange} placeholder="Max 60 chars" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="seo_description">Meta Description</Label>
                                <Textarea id="seo_description" name="seo_description" value={formData.seo_description} onChange={handleInputChange} className="h-24" placeholder="Brief summary for search engines..." />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
