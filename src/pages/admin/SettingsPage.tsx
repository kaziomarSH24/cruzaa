/**
 * System Settings Page
 * Manage SMTP, SEO, Branding, Stripe, and General configuration
 */

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Mail,
    Search,
    Palette,
    ShieldCheck,
    ShoppingBag,
    Save,
    Loader2,
    Upload,
    Globe,
    Bell,
    Code
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import settingsService, { Settings as SettingsData } from '@/services/settingsService';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({});
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [files, setFiles] = useState<Record<string, File>>({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                const flattened: any = {};
                Object.values(data).forEach(group => {
                    Object.entries(group as any).forEach(([key, meta]: [string, any]) => {
                        flattened[key] = meta.value;
                        if (meta.url) flattened[`${key}_url`] = meta.url;
                    });
                });
                setSettings(flattened);
                setPreviews({
                    site_logo: flattened.site_logo_url || '',
                    site_dark_logo: flattened.site_dark_logo_url || '',
                    site_favicon: flattened.site_favicon_url || '',
                    seo_og_image: flattened.seo_og_image_url || ''
                });
            } catch (e) {
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setFiles(prev => ({ ...prev, [key]: file }));
            setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(settings).forEach(([k, v]) => {
                if (k.endsWith('_url')) return;
                formData.append(k, String(v));
            });
            Object.entries(files).forEach(([k, v]) => formData.append(k, v));

            await settingsService.updateSettings(formData);
            toast.success('Settings updated successfully');
        } catch (e) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
                    <p className="text-slate-500 text-sm">Configure site variables, integrations and branding</p>
                </div>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 min-w-[140px]" disabled={saving}>
                    {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                    Push Updates
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="bg-slate-100 p-1 rounded-xl h-auto inline-flex min-w-full">
                        <TabsTrigger value="general" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:shadow-sm whitespace-nowrap">
                            <Settings className="w-4 h-4" /> General
                        </TabsTrigger>
                        <TabsTrigger value="branding" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:shadow-sm whitespace-nowrap">
                            <Palette className="w-4 h-4" /> Identity
                        </TabsTrigger>
                        <TabsTrigger value="smtp" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:shadow-sm whitespace-nowrap">
                            <Mail className="w-4 h-4" /> SMTP Email
                        </TabsTrigger>
                        <TabsTrigger value="seo" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:shadow-sm whitespace-nowrap">
                            <Search className="w-4 h-4" /> SEO & Meta
                        </TabsTrigger>
                        <TabsTrigger value="payment" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:shadow-sm whitespace-nowrap">
                            <ShieldCheck className="w-4 h-4" /> Stripe Config
                        </TabsTrigger>
                        <TabsTrigger value="cart" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:shadow-sm whitespace-nowrap">
                            <ShoppingBag className="w-4 h-4" /> Shopping
                        </TabsTrigger>
                        <TabsTrigger value="custom" className="gap-2 px-4 py-2.5 rounded-lg data-[state=active]:shadow-sm whitespace-nowrap">
                            <Code className="w-4 h-4" /> Custom Code
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="mt-6">
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>App Information</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>App Title</Label>
                                    <Input value={settings.site_name} onChange={e => handleChange('site_name', e.target.value)} placeholder="e.g. Cruzaa Admin" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Site Tagline</Label>
                                    <Input value={settings.site_tagline} onChange={e => handleChange('site_tagline', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Support Email</Label>
                                        <Input value={settings.contact_email} onChange={e => handleChange('contact_email', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Contact Phone</Label>
                                        <Input value={settings.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="branding" className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Visual Assets</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Main Logo (white/light – for transparent header) */}
                                <div className="space-y-3">
                                    <Label>Main Logo <span className="text-[10px] text-slate-400 font-normal ml-1">(white/light – transparent header)</span></Label>
                                    <div className="aspect-video border-2 border-dashed rounded-xl bg-slate-800 flex items-center justify-center relative overflow-hidden group">
                                        {previews.site_logo ? (
                                            <img src={previews.site_logo} className="h-20 object-contain" />
                                        ) : (
                                            <Globe className="w-10 h-10 text-slate-600" />
                                        )}
                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <Upload className="w-6 h-6 text-white" />
                                            <Input type="file" className="hidden" onChange={e => handleFileChange('site_logo', e)} />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-400">Transparent PNG/SVG with white/light content</p>
                                </div>

                                {/* Dark Logo (for scrolled / non-home header) */}
                                <div className="space-y-3">
                                    <Label>Dark Logo <span className="text-[10px] text-slate-400 font-normal ml-1">(dark – scrolled header)</span></Label>
                                    <div className="aspect-video border-2 border-dashed rounded-xl bg-slate-50 flex items-center justify-center relative overflow-hidden group">
                                        {previews.site_dark_logo ? (
                                            <img src={previews.site_dark_logo} className="h-20 object-contain" />
                                        ) : (
                                            <Globe className="w-10 h-10 text-slate-200" />
                                        )}
                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <Upload className="w-6 h-6 text-white" />
                                            <Input type="file" className="hidden" onChange={e => handleFileChange('site_dark_logo', e)} />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-400">Transparent PNG/SVG with dark/black content</p>
                                </div>

                                {/* Favicon */}
                                <div className="space-y-3">
                                    <Label>Favicon</Label>
                                    <div className="w-20 h-20 border-2 border-dashed rounded-xl bg-slate-50 flex items-center justify-center relative overflow-hidden group">
                                        {previews.site_favicon ? (
                                            <img src={previews.site_favicon} className="w-10 h-10 object-contain" />
                                        ) : (
                                            <Globe className="w-10 h-10 text-slate-200" />
                                        )}
                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <Upload className="w-4 h-4 text-white" />
                                            <Input type="file" className="hidden" onChange={e => handleFileChange('site_favicon', e)} />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-400">Standard 32x32px .ico or .png</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="smtp" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Server Settings</CardTitle>
                                <CardDescription>Required for system notifications and user emails</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 grid gap-2">
                                        <Label>SMTP Host</Label>
                                        <Input value={settings.smtp_host} onChange={e => handleChange('smtp_host', e.target.value)} placeholder="smtp.gmail.com" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Port</Label>
                                        <Input value={settings.smtp_port} onChange={e => handleChange('smtp_port', e.target.value)} placeholder="587" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>User Email</Label>
                                        <Input value={settings.smtp_username} onChange={e => handleChange('smtp_username', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Password/App Key</Label>
                                        <Input type="password" value={settings.smtp_password} onChange={e => handleChange('smtp_password', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <Button variant="outline" type="button" onClick={async () => {
                                        toast.promise(settingsService.testSMTP(settings), {
                                            loading: 'Sending test email...',
                                            success: 'Test email sent successfully!',
                                            error: 'Failed to send test email'
                                        });
                                    }}>Send Test Email</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="seo" className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>SEO Configuration</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Site Default Title</Label>
                                    <Input value={settings.seo_meta_title} onChange={e => handleChange('seo_meta_title', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Meta Description</Label>
                                    <Textarea value={settings.seo_meta_description} onChange={e => handleChange('seo_meta_description', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Google Analytics ID (G-XXXX)</Label>
                                        <Input value={settings.google_analytics_id} onChange={e => handleChange('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXXXX" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Facebook Pixel ID</Label>
                                        <Input value={settings.facebook_pixel_id} onChange={e => handleChange('facebook_pixel_id', e.target.value)} placeholder="e.g. 1234567890" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payment" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Stripe Integration</CardTitle>
                                    <Switch checked={settings.stripe_enabled === '1'} onCheckedChange={val => handleChange('stripe_enabled', val ? '1' : '0')} />
                                </div>
                                <CardDescription>Secure payment processing settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Stripe Mode</Label>
                                    <Select value={settings.stripe_mode} onValueChange={val => handleChange('stripe_mode', val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="test">Test Mode (Sandbox)</SelectItem>
                                            <SelectItem value="live">Live Mode (Production)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Publishable Key</Label>
                                    <Input value={settings.stripe_publishable_key} onChange={e => handleChange('stripe_publishable_key', e.target.value)} placeholder="pk_test_..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Secret Key</Label>
                                    <Input type="password" value={settings.stripe_secret_key} onChange={e => handleChange('stripe_secret_key', e.target.value)} placeholder="sk_test_..." />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="cart" className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Checkout & Cart Behavior</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50">
                                    <div>
                                        <p className="font-semibold text-sm">Cart Functionality</p>
                                        <p className="text-xs text-slate-500">Enable site-wide shopping cart</p>
                                    </div>
                                    <Switch checked={settings.cart_enabled === '1'} onCheckedChange={val => handleChange('cart_enabled', val ? '1' : '0')} />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50">
                                    <div>
                                        <p className="font-semibold text-sm">Guest Checkout</p>
                                        <p className="text-xs text-slate-500">Allow users to checkout without accounts</p>
                                    </div>
                                    <Switch checked={settings.guest_checkout_enabled === '1'} onCheckedChange={val => handleChange('guest_checkout_enabled', val ? '1' : '0')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Default Currency Symbol</Label>
                                        <Input value={settings.currency_symbol} onChange={e => handleChange('currency_symbol', e.target.value)} placeholder="$" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Currency Code</Label>
                                        <Input value={settings.currency} onChange={e => handleChange('currency', e.target.value)} placeholder="USD" />
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-sm mb-4">Shipping Configuration</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Standard Shipping Fee (£)</Label>
                                            <Input type="number" step="0.01" value={settings.shipping_fee} onChange={e => handleChange('shipping_fee', e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Free Shipping Threshold (£)</Label>
                                            <Input type="number" step="0.01" value={settings.shipping_free_threshold} onChange={e => handleChange('shipping_free_threshold', e.target.value)} />
                                            <p className="text-[10px] text-slate-400">Set to 0 to always charge, or high value to disable free shipping</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Global Code Injection</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Header HTML/Scripts</Label>
                                    <Textarea value={settings.header_code} onChange={e => handleChange('header_code', e.target.value)} className="font-mono text-xs h-32" placeholder="<!-- Meta pixels, external libs -->" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Footer HTML/Scripts</Label>
                                    <Textarea value={settings.footer_code} onChange={e => handleChange('footer_code', e.target.value)} className="font-mono text-xs h-32" placeholder="<!-- Chat widgets, analytics -->" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </form>
    );
}
