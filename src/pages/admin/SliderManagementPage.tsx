import React, { useState, useEffect } from 'react';
import {
    Plus,
    Save,
    Trash2,
    Image as ImageIcon,
    GripVertical,
    Eye,
    EyeOff,
    Upload,
    ChevronUp,
    ChevronDown,
    Loader2,
    Youtube,
    ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import heroSliderService, { HeroSlide } from '@/services/heroSliderService';
import api from '@/services/api';
import { toast } from 'sonner';

/**
 * Slide Management Page
 * Handles fetching, sorting, and updating website hero slides
 */
export default function SliderManagementPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSlides();
    }, []);

    const loadSlides = async () => {
        try {
            setLoading(true);
            const data = await heroSliderService.getSlides(true);
            setSlides(data);
        } catch (e) {
            toast.error('Failed to load slides');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlide = () => {
        const newSlide: HeroSlide = {
            title: 'New Slide Title',
            subtitle: 'New Subtitle',
            description: 'Slide description goes here...',
            image: '',
            video_url: '',
            cta_text: 'Shop Now',
            cta_link: '/products',
            badge: 'New',
            is_active: true
        };
        setSlides([...slides, newSlide]);
    };

    const handleRemoveSlide = (index: number) => {
        setSlides(slides.filter((_, i) => i !== index));
    };

    const handleUpdateSlide = (index: number, field: keyof HeroSlide, value: any) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSlides(newSlides);
    };

    const moveSlide = (index: number, direction: 'up' | 'down') => {
        const newSlides = [...slides];
        if (direction === 'up' && index > 0) {
            [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
        } else if (direction === 'down' && index < slides.length - 1) {
            [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
        }
        setSlides(newSlides);
    };

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Uploading image...', { id: 'upload' });
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            handleUpdateSlide(index, 'image', response.data.url);
            toast.success('Image uploaded', { id: 'upload' });
        } catch (e) {
            toast.error('Upload failed', { id: 'upload' });
        }
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            await heroSliderService.updateSlides(slides);
            toast.success('Slider changes saved successfully');
            loadSlides(); // Reload to get IDs for new slides
        } catch (e) {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Extract YouTube ID for preview
    const getYTId = (url: string) => {
        const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        return match?.[1] || null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hero Slider</h1>
                    <p className="text-sm text-slate-500">Manage the home page slideshow gallery</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleAddSlide} className="border-dashed">
                        <Plus className="h-4 w-4 mr-2" /> Add Slide
                    </Button>
                    <Button onClick={handleSaveAll} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {slides.map((slide, index) => (
                    <Card key={slide.id || `new-${index}`} className="relative border-slate-200 overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${slide.is_active ? 'bg-blue-500' : 'bg-slate-300'}`} />
                        <CardContent className="p-0">
                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

                                {/* Image Preview & Sort */}
                                <div className="w-full lg:w-48 bg-slate-50 flex flex-col p-4 items-center justify-center gap-4">
                                    <div className="relative w-full aspect-video rounded-lg border bg-white overflow-hidden shadow-sm">
                                        {slide.video_url && getYTId(slide.video_url) ? (
                                            <div className="w-full h-full relative group">
                                                <img
                                                    src={`https://img.youtube.com/vi/${getYTId(slide.video_url)}/mqdefault.jpg`}
                                                    className="w-full h-full object-cover"
                                                    alt="Video"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Youtube className="h-8 w-8 text-white" />
                                                </div>
                                            </div>
                                        ) : slide.image ? (
                                            <img src={slide.image} className="w-full h-full object-cover" alt="Slide" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                                                <ImageIcon className="h-10 w-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => moveSlide(index, 'up')} disabled={index === 0}>
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <div className="text-xs font-bold text-slate-400 w-6 text-center">{index + 1}</div>
                                        <Button variant="ghost" size="icon" onClick={() => moveSlide(index, 'down')} disabled={index === slides.length - 1}>
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs uppercase text-slate-500 tracking-wider">Slide Badge</Label>
                                            <Input
                                                placeholder="e.g. New Arrival"
                                                value={slide.badge}
                                                onChange={(e) => handleUpdateSlide(index, 'badge', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs uppercase text-slate-500 tracking-wider">Title</Label>
                                            <Input
                                                placeholder="Slide Headline"
                                                value={slide.title}
                                                onChange={(e) => handleUpdateSlide(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs uppercase text-slate-500 tracking-wider">Subtitle</Label>
                                            <Input
                                                placeholder="Sub-headline"
                                                value={slide.subtitle}
                                                onChange={(e) => handleUpdateSlide(index, 'subtitle', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs uppercase text-slate-500 tracking-wider">Image / Background</Label>
                                                <label className="text-[10px] text-blue-600 hover:underline cursor-pointer flex items-center gap-1 font-medium">
                                                    <Upload className="h-3 w-3" /> Upload New
                                                    <Input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(index, e)} />
                                                </label>
                                            </div>
                                            <Input
                                                placeholder="Background Image URL"
                                                value={slide.image}
                                                onChange={(e) => handleUpdateSlide(index, 'image', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1">
                                                    <Youtube className="h-2.5 w-2.5 text-red-500" /> YouTube URL
                                                </Label>
                                                {slide.video_url && getYTId(slide.video_url) && (
                                                    <a href={slide.video_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 flex items-center gap-1">
                                                        <ExternalLink className="h-2 w-2" /> Preview
                                                    </a>
                                                )}
                                            </div>
                                            <Input
                                                placeholder="YouTube URL (e.g. https://youtube.com/watch?v=...)"
                                                value={slide.video_url}
                                                onChange={(e) => handleUpdateSlide(index, 'video_url', e.target.value)}
                                            />
                                            <p className="text-[9px] text-slate-400 italic">If set, this video will play in the background automatically (looped & muted).</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <Label className="text-xs uppercase text-slate-500 tracking-wider">Button Text</Label>
                                                <Input
                                                    placeholder="Shop Now"
                                                    value={slide.cta_text}
                                                    onChange={(e) => handleUpdateSlide(index, 'cta_text', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label className="text-xs uppercase text-slate-500 tracking-wider">Button Link</Label>
                                                <Input
                                                    placeholder="/products"
                                                    value={slide.cta_link}
                                                    onChange={(e) => handleUpdateSlide(index, 'cta_link', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Logic */}
                                <div className="w-full lg:w-48 p-4 flex flex-row lg:flex-col justify-between items-center gap-4 bg-slate-50/50">
                                    <div className="flex lg:flex-col items-center gap-3">
                                        <div className="text-center">
                                            <Switch
                                                checked={slide.is_active}
                                                onCheckedChange={(val) => handleUpdateSlide(index, 'is_active', val)}
                                            />
                                            <div className="text-[10px] mt-1 font-bold text-slate-400 uppercase tracking-tighter">
                                                {slide.is_active ? 'Live' : 'Hidden'}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveSlide(index)}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="hidden lg:block">
                                        <GripVertical className="h-5 w-5 text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t border-slate-100">
                                <Label className="text-xs uppercase text-slate-400 tracking-widest mb-2 block">Caption Content</Label>
                                <Textarea
                                    className="text-sm min-h-[60px]"
                                    placeholder="Brief description of the slide..."
                                    value={slide.description}
                                    onChange={(e) => handleUpdateSlide(index, 'description', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {slides.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50">
                        <ImageIcon className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-slate-900">No slides found</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Add your first slide to get started</p>
                        <Button variant="outline" size="sm" onClick={handleAddSlide}>
                            <Plus className="h-4 w-4 mr-2" /> Create Slide
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
