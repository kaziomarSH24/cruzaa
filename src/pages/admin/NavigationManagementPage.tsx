/**
 * Navigation Menu Management
 * Manage dynamic header and footer menus
 */

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit,
    GripVertical,
    Link as LinkIcon,
    ChevronRight,
    Save,
    Loader2,
    X,
    Target,
    Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import navigationService, { NavigationItem } from '@/services/navigationService';
import { toast } from 'sonner';

export default function NavigationManagementPage() {
    const [items, setItems] = useState<NavigationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState('header');
    const [editing, setEditing] = useState<any>(null);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const res = await navigationService.getAdminNavigation(location);
            setItems(res || []);
        } catch (e) {
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, [location]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...editing,
                menu_location: location
            };

            if (editing.id) {
                await navigationService.updateNavigationItem(editing.id, payload);
                toast.success('Nav item updated');
            } else {
                await navigationService.createNavigationItem(payload);
                toast.success('Nav item created');
            }
            setEditing(null);
            fetchMenu();
        } catch (e) {
            toast.error('Failed to save nav item');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this menu item? All sub-items will also be deleted.')) return;
        try {
            await navigationService.deleteNavigationItem(id);
            toast.success('Item removed');
            fetchMenu();
        } catch (e) {
            toast.error('Failed to remove item');
        }
    };

    // Helper to flatten the tree for the parent selector
    const getFlattenedItems = (elements: NavigationItem[], level = 0): { id: number; title: string; level: number }[] => {
        let flat: any[] = [];
        elements.forEach(item => {
            flat.push({ id: item.id, title: item.title, level });
            if (item.children && item.children.length > 0) {
                flat = [...flat, ...getFlattenedItems(item.children, level + 1)];
            }
        });
        return flat;
    };

    const flattenedItems = getFlattenedItems(items);

    const NavItemRow = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => (
        <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 bg-white border rounded-xl hover:shadow-sm transition-all group">
                <GripVertical className="h-4 w-4 text-slate-300 cursor-move" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{item.url || '(No URL - Dropdown)'}</p>
                </div>
                <div className="flex items-center gap-2 pr-2">
                    {item.target === '_blank' && <Badge variant="outline" className="text-[9px] h-4">External</Badge>}
                    {!item.is_active && <Badge variant="outline" className="text-[9px] h-4 text-slate-400">Hidden</Badge>}
                    {item.children && item.children.length > 0 && <Badge variant="secondary" className="text-[9px] h-4">{item.children.length} sub-items</Badge>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => setEditing({ ...item })}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {item.children && item.children.length > 0 && (
                <div className="ml-8 border-l-2 border-slate-100 pl-4 space-y-1">
                    {item.children.map(child => <NavItemRow key={child.id} item={child} level={level + 1} />)}
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-500">
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Navigation Management</h1>
                                <p className="text-sm text-slate-500">Create and organize your site menus</p>
                            </div>
                            <Select value={location} onValueChange={setLocation}>
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="header">Header Menu</SelectItem>
                                    <SelectItem value="footer">Footer Links</SelectItem>
                                    <SelectItem value="sidebar">Sidebar Infolist</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="default" className="bg-primary hover:bg-primary/90" size="sm" onClick={() => setEditing({ title: '', url: '/', menu_location: location, is_active: 1, sort_order: 0, target: '_self' })}>
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {loading && items.length === 0 ? (
                            <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-slate-200" /></div>
                        ) : items.length === 0 ? (
                            <Card className="border-dashed py-12 text-center text-slate-400">
                                <CardContent>
                                    <Layers className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                                    <p>No items in this menu yet.</p>
                                    <Button variant="outline" className="mt-4" onClick={() => setEditing({ title: '', url: '/', menu_location: location, is_active: 1, sort_order: 0, target: '_self' })}>Create First Item</Button>
                                </CardContent>
                            </Card>
                        ) : (
                            items.map(item => <NavItemRow key={item.id} item={item} />)
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <Card className="sticky top-24 border-none shadow-xl bg-white/80 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle>{editing ? (editing.id ? 'Edit Menu Item' : 'New Menu Item') : 'Management'}</CardTitle>
                            <CardDescription>Configure link behavior and hierarchy</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {editing ? (
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Menu Text</Label>
                                        <Input
                                            value={editing.title}
                                            onChange={e => setEditing({ ...editing, title: e.target.value })}
                                            placeholder="e.g. Products, About Us"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Link URL (Leave empty for dropdown)</Label>
                                        <Input
                                            value={editing.url || ''}
                                            onChange={e => setEditing({ ...editing, url: e.target.value })}
                                            placeholder="/products or https://..."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Icon Name (Optional - Lucide name)</Label>
                                        <Input
                                            value={editing.icon || ''}
                                            onChange={e => setEditing({ ...editing, icon: e.target.value })}
                                            placeholder="Layout, Package, Info..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Open In</Label>
                                            <Select value={editing.target} onValueChange={v => setEditing({ ...editing, target: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="_self">Same Window</SelectItem>
                                                    <SelectItem value="_blank">New Tab</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Order</Label>
                                            <Input
                                                type="number"
                                                value={editing.sort_order}
                                                onChange={e => setEditing({ ...editing, sort_order: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Parent Item (Optional)</Label>
                                        <Select
                                            value={editing.parent_id?.toString() || 'none'}
                                            onValueChange={v => setEditing({ ...editing, parent_id: v === 'none' ? null : parseInt(v) })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="No Parent" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Root Level</SelectItem>
                                                {flattenedItems
                                                    .filter(i => i.id !== editing.id)
                                                    .map(i => (
                                                        <SelectItem key={i.id} value={i.id.toString()}>
                                                            {Array(i.level).fill('—').join(' ')} {i.title}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50">
                                        <div className="grid gap-0.5">
                                            <Label className="text-sm font-medium">Visible</Label>
                                            <p className="text-[10px] text-slate-400">Enable or disable this menu item</p>
                                        </div>
                                        <Switch
                                            checked={!!editing.is_active}
                                            onCheckedChange={v => setEditing({ ...editing, is_active: v ? 1 : 0 })}
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button variant="ghost" type="button" className="flex-1" onClick={() => setEditing(null)}>
                                            <X className="h-4 w-4 mr-2" /> Cancel
                                        </Button>
                                        <Button type="submit" className="flex-1 bg-primary">
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editing.id ? 'Update Item' : 'Create Item'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <LinkIcon className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <p className="text-sm text-slate-500 max-w-[200px] mx-auto">Select an item to edit or create a new one to build your menu structure.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
