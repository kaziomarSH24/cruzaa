/**
 * Dynamic Content Management
 * WordPress-like CMS for frontend blocks
 */

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Plus,
    Edit,
    Trash2,
    Image as ImageIcon,
    Check,
    Save,
    Loader2,
    Layers,
    Globe,
    Layout,
    Type,
    ChevronRight,
    Settings2,
    Upload,
    MousePointerClick
} from 'lucide-react';
import HotspotEditor from '@/components/admin/HotspotEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import contentService, { DynamicContent } from '@/services/contentService';
import { toast } from 'sonner';

export default function ContentManagementPage() {
    const [content, setContent] = useState<DynamicContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);
    const [group, setGroup] = useState('all');
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewHtml, setPreviewHtml] = useState(false);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const res = await contentService.getContent(group === 'all' ? undefined : group);
            setContent(res);
        } catch (e) {
            toast.error('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [group]);

    const filteredContent = content.filter(item =>
        item.content_key.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
    );

    const getGroupIcon = (g: string) => {
        switch (g.toLowerCase()) {
            case 'homepage': return <Layout className="w-4 h-4" />;
            case 'footer': return <Settings2 className="w-4 h-4" />;
            case 'about': return <Type className="w-4 h-4" />;
            case 'contact': return <Globe className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    // ... rest of handleSave and handleDelete ...
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(editing).forEach(([k, v]) => {
                if (v !== null && v !== undefined) {
                    formData.append(k, String(v));
                }
            });
            if (file) {
                formData.append('file', file);
            }

            await contentService.upsertContent(formData);
            toast.success('Content block saved successfully');
            setEditing(null);
            setFile(null);
            fetchContent();
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.response?.data?.error || 'Failed to save content block';
            toast.error(errorMsg);
            if (e.response?.data?.errors) {
                // Log detailed validation errors to console
                console.error('Validation errors:', e.response.data.errors);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (key: string) => {
        if (!confirm(`Are you sure you want to delete the block "${key}"?`)) return;

        try {
            await contentService.deleteContent(key);
            toast.success('Block deleted successfully');
            if (editing?.content_key === key) setEditing(null);
            fetchContent();
        } catch (e) {
            toast.error('Failed to delete block');
        }
    };

    const groups = ['all', 'product_feature', 'homepage', 'footer', 'about', 'contact', 'general'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-3 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Management</h1>
                        <p className="text-sm text-slate-500">Dynamic blocks for your frontend</p>
                    </div>
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" size="sm" onClick={() => {
                        setEditing({ content_key: '', content_type: 'text', content_value: '', content_group: 'general', is_active: 1 });
                        setFile(null);
                    }}>
                        <Plus className="h-4 w-4 mr-2" /> New Block
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Find content by key or description..."
                            className="pl-10 bg-white border-slate-200"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Tabs value={group} onValueChange={setGroup} className="w-auto">
                        <TabsList className="bg-slate-100 p-1 rounded-lg">
                            {groups.map(g => <TabsTrigger key={g} value={g} className="capitalize text-xs px-4">{g}</TabsTrigger>)}
                        </TabsList>
                    </Tabs>
                </div>

                <div className="grid gap-3">
                    {loading && filteredContent.length === 0 ? (
                        <div className="grid gap-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />)}
                        </div>
                    ) : filteredContent.length === 0 ? (
                        <Card className="border-dashed py-20 text-center bg-slate-50/50">
                            <CardContent>
                                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                    <Layers className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-slate-900 font-bold">No results found</h3>
                                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredContent.map(block => (
                            <div
                                key={block.content_key}
                                className={`flex items-center gap-4 p-4 border rounded-xl transition-all group cursor-pointer ${editing?.content_key === block.content_key ? 'border-blue-600 bg-blue-50/30' : 'bg-white hover:shadow-md'}`}
                                onClick={() => {
                                    setEditing(block);
                                    setFile(null);
                                }}
                            >
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${editing?.content_key === block.content_key ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                    {block.content_type === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{block.content_key}</p>
                                        <Badge className={`border-none px-2 py-0 h-4 text-[9px] uppercase tracking-tighter ${block.content_type === 'image' ? 'bg-amber-100 text-amber-700' :
                                            block.content_type === 'json' ? 'bg-purple-100 text-purple-700' :
                                                block.content_type === 'html' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>
                                            {block.content_type}
                                        </Badge>
                                        {!Number(block.is_active) && <Badge variant="destructive" className="px-1 py-0 h-3 text-[8px] uppercase">Hidden</Badge>}
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate mt-1 leading-none">{block.description || block.content_value}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-300 hover:text-blue-600 hover:bg-blue-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(block.content_key);
                                            toast.success('Key copied to clipboard');
                                        }}
                                        title="Copy Key"
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(block.content_key);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <ChevronRight className={`h-4 w-4 transition-transform ${editing?.content_key === block.content_key ? 'translate-x-1 text-blue-600' : 'text-slate-300'}`} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="lg:col-span-2">
                <Card className="sticky top-24 border-none shadow-2xl bg-white overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
                    <CardHeader className="border-b bg-slate-50/50 rounded-t-xl py-4 shrink-0">
                        <div className="flex items-center gap-3 text-blue-600">
                            <Settings2 className="w-5 h-5" />
                            <CardTitle className="text-base">{editing?.id ? 'Block Editor' : 'Create New Block'}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 overflow-y-auto custom-scrollbar flex-1">
                        {editing ? (
                            <form id="content-form" onSubmit={handleSave} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Unique Block Identifier</Label>
                                    <Input
                                        disabled={!!editing.id}
                                        value={editing.content_key}
                                        onChange={e => {
                                            const newKey = e.target.value;
                                            const updates: any = { content_key: newKey };

                                            // Auto-detect type for common keys to help the user
                                            if (!editing.id) {
                                                if (newKey.includes('image') || newKey.includes('logo') || newKey.includes('banner')) {
                                                    updates.content_type = 'image';
                                                } else if (newKey.includes('hotspots') || newKey.includes('gallery') || newKey.includes('settings')) {
                                                    updates.content_type = 'json';
                                                } else if (newKey.includes('code') || newKey.includes('description')) {
                                                    updates.content_type = 'html';
                                                }
                                            }

                                            setEditing({ ...editing, ...updates });
                                        }}
                                        className="bg-slate-50 focus:bg-white"
                                        placeholder="e.g. homepage_hero_title"
                                    />
                                    <p className="text-[10px] text-slate-400 italic">This key is used in code to fetch this content.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase">Content Type</Label>
                                        <Select value={editing.content_type} onValueChange={v => setEditing({ ...editing, content_type: v })}>
                                            <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Plain Text</SelectItem>
                                                <SelectItem value="html">HTML Code</SelectItem>
                                                <SelectItem value="image">Image URL / File</SelectItem>
                                                <SelectItem value="json">JSON Metadata</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold text-slate-500 uppercase">Group Classification</Label>
                                        <Input
                                            value={editing.content_group}
                                            onChange={e => setEditing({ ...editing, content_group: e.target.value })}
                                            placeholder="general"
                                            className="bg-slate-50"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Internal Description</Label>
                                    <Input
                                        value={editing.description || ''}
                                        onChange={e => setEditing({ ...editing, description: e.target.value })}
                                        className="bg-slate-50"
                                        placeholder="What is this block for?"
                                    />
                                </div>

                                <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                                    <Label className="text-xs font-bold text-slate-500 uppercase cursor-pointer" htmlFor="block-active">Visibility Status</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400">{Number(editing.is_active) ? 'Visible' : 'Hidden'}</span>
                                        <Switch
                                            id="block-active"
                                            checked={Boolean(Number(editing.is_active))}
                                            onCheckedChange={val => setEditing({ ...editing, is_active: val ? 1 : 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2 pt-2 border-t mt-4">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Content Payload</Label>

                                    {editing.content_group === 'product_feature' && editing.content_key === 'hotspots' ? (
                                        <div className="space-y-4">
                                            <div className="bg-slate-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                                                    <MousePointerClick className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">Visual Interactive Editor</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <p className="text-[10px] text-slate-400">Editing pin points for the feature image.</p>
                                                        <Button
                                                            variant="link"
                                                            type="button"
                                                            className="h-auto p-0 text-[10px] text-blue-600 font-bold"
                                                            onClick={() => {
                                                                const imgBlock = content.find(b => b.content_group === 'product_feature' && b.content_key === 'images');
                                                                if (imgBlock) {
                                                                    setEditing(imgBlock);
                                                                    setFile(null);
                                                                } else {
                                                                    toast.error('The "images" block for this group was not found.');
                                                                }
                                                            }}
                                                        >
                                                            Change Image?
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <HotspotEditor
                                                imageUrl={(() => {
                                                    const imgBlock = content.find(b => b.content_group === 'product_feature' && b.content_key === 'images');
                                                    return imgBlock?.content_value || "/hero-scooter.jpg";
                                                })()}
                                                initialHotspots={(() => {
                                                    try { return JSON.parse(editing.content_value || '[]'); } catch { return []; }
                                                })()}
                                                onSave={(newHotspots) => {
                                                    // This is the key: we MUST update the parent 'editing' state 
                                                    // so that when 'Apply Changes' is clicked, the new JSON is sent to backend.
                                                    setEditing(prev => {
                                                        if (!prev) return prev;
                                                        return { ...prev, content_value: JSON.stringify(newHotspots) };
                                                    });
                                                }}
                                            />
                                        </div>
                                    ) : editing.content_type === 'image' ? (
                                        <div className="space-y-3">
                                            <div className="aspect-video bg-white rounded-xl overflow-hidden relative border border-slate-200 group/img shadow-inner flex items-center justify-center">
                                                {editing.content_value && !file && (
                                                    <img src={editing.content_value.startsWith('http') ? editing.content_value : `/uploads/${editing.content_value}`} className="max-w-full max-h-full object-contain p-2" />
                                                )}
                                                {file && (
                                                    <img src={URL.createObjectURL(file)} className="max-w-full max-h-full object-contain p-2" />
                                                )}
                                                {!editing.content_value && !file && <div className="text-slate-300 text-xs">No image chosen</div>}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Label htmlFor="content-file" className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xl">
                                                        <Upload className="w-3 h-3" /> Change Image
                                                    </Label>
                                                </div>
                                                <input id="content-file" type="file" className="hidden" onChange={e => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setFile(e.target.files[0]);
                                                    }
                                                }} />
                                            </div>
                                            <Input
                                                value={editing.content_value}
                                                onChange={e => setEditing({ ...editing, content_value: e.target.value })}
                                                placeholder="Or enter image URL manualy..."
                                                className="bg-slate-50 text-[10px] h-8"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {editing.content_type === 'html' && (
                                                <div className="flex gap-2 mb-2">
                                                    <Button
                                                        type="button"
                                                        variant={!previewHtml ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setPreviewHtml(false)}
                                                        className="h-7 text-[10px]"
                                                    >Edit Code</Button>
                                                    <Button
                                                        type="button"
                                                        variant={previewHtml ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setPreviewHtml(true)}
                                                        className="h-7 text-[10px]"
                                                    >Live Preview</Button>
                                                </div>
                                            )}

                                            {previewHtml ? (
                                                <div className="min-h-[160px] p-4 bg-white border rounded-lg overflow-auto prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: editing.content_value }} />
                                            ) : (
                                                <Textarea
                                                    value={editing.content_value}
                                                    onChange={e => setEditing({ ...editing, content_value: e.target.value })}
                                                    className={`min-h-[160px] font-mono text-[11px] bg-slate-50 focus:bg-white resize-none border-slate-200`}
                                                    placeholder="Enter block content here..."
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-20 px-6">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                    <FileText className="h-8 w-8 text-slate-200" />
                                </div>
                                <h3 className="text-slate-900 font-bold text-sm">No selection</h3>
                                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed mb-6 italic">Select an existing block from the list or create a new one to customize your site's content.</p>

                                <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-3 tracking-[0.2em]">Common Keys</p>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-blue-600 uppercase border-b border-blue-100 pb-1">Group: product_feature</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['title', 'badge', 'sub_title', 'description', 'images', 'hotspots', 'link', 'button_text'].map(k => (
                                                    <code key={k} className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold cursor-copy" onClick={() => { navigator.clipboard.writeText(k); toast.success('Key copied'); }}>{k}</code>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase border-b border-emerald-100 pb-1">Group: about (Our Story)</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['about_story_badge', 'about_story_title', 'about_story_highlight', 'about_story_description_html', 'about_story_squad_title', 'about_story_squad_quote', 'about_story_image'].map(k => (
                                                    <code key={k} className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold cursor-copy" onClick={() => { navigator.clipboard.writeText(k); toast.success('Key copied'); }}>{k}</code>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-blue-600 uppercase border-b border-blue-100 pb-1">Group: contact</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['contact_hero_badge', 'contact_hero_title', 'contact_hero_subtitle', 'contact_form_title', 'contact_faq_title', 'contact_cta_title', 'contact_cta_subtitle', 'contact_cta_phone', 'contact_cta_btn_text', 'contact_info_json', 'contact_faq_json'].map(k => (
                                                    <code key={k} className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold cursor-copy" onClick={() => { navigator.clipboard.writeText(k); toast.success('Key copied'); }}>{k}</code>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 pb-1">General</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['footer_about', 'footer_copyright', 'cta_title'].map(k => (
                                                    <code key={k} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold cursor-copy" onClick={() => { navigator.clipboard.writeText(k); toast.success('Key copied'); }}>{k}</code>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    {editing && (
                        <div className="p-4 border-t bg-slate-50/80 backdrop-blur-sm shrink-0">
                            <div className="flex gap-3">
                                <Button variant="outline" type="button" className="flex-1 shadow-sm h-10 text-xs font-bold" onClick={() => setEditing(null)}>
                                    Discard
                                </Button>
                                <Button
                                    onClick={(e) => {
                                        // Since we moved buttons out of the form, we need a way to submit
                                        // Or we wrap the whole card content in the form
                                        const form = document.getElementById('content-form') as HTMLFormElement;
                                        if (form) form.requestSubmit();
                                    }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 h-10 text-xs font-bold"
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Apply Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
