/**
 * Contact Submission Management
 * View and manage contact form inquiries
 */

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Search,
    Trash2,
    CheckCircle,
    Clock,
    ShieldAlert,
    MoreVertical,
    Mail,
    User,
    Calendar,
    AlertTriangle,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import contactService, { ContactSubmission } from '@/services/contactService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusMap = {
    new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700', icon: MessageSquare },
    resolved: { label: 'Resolved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    spam: { label: 'Spam', color: 'bg-red-100 text-red-700', icon: ShieldAlert },
};

export default function ContactManagementPage() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<ContactSubmission | null>(null);
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<any>('');

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await contactService.getSubmissions({ search });
            setSubmissions(res.submissions);
        } catch (e) {
            toast.error('Failed to load inquiries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [search]);

    const handleUpdate = async () => {
        if (!selected) return;
        try {
            await contactService.updateStatus(selected.id, {
                status,
                notes,
                is_replied: status === 'resolved' ? 1 : 0
            });
            toast.success('Inquiry updated');
            setSelected(null);
            fetchContacts();
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this submission?')) return;
        try {
            await contactService.deleteSubmission(id);
            toast.success('Deleted successfully');
            fetchContacts();
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inquiries</h1>
                    <p className="text-slate-500 text-sm">Manage customer contact form submissions</p>
                </div>
            </div>

            <Card>
                <CardHeader className="p-4 bg-slate-50/50 border-b">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email or message..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sender</TableHead>
                                <TableHead>Message Preview</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={5} className="h-16 animate-pulse bg-slate-50/50"></TableCell></TableRow>
                                ))
                            ) : submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                        No submissions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((item) => (
                                    <TableRow key={item.id} className={!item.is_read ? "bg-blue-50/30 hover:bg-blue-50/50" : ""}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                    {item.name}
                                                    {!item.is_read && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                                                </span>
                                                <span className="text-xs text-slate-500">{item.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px]">
                                            <p className="text-xs text-slate-600 truncate font-medium">{item.subject || 'No Subject'}</p>
                                            <p className="text-xs text-slate-400 truncate mt-0.5">{item.message}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusMap[item.status].color} hover:shadow-none border-none py-0.5 px-2 text-[10px] capitalize`}>
                                                {item.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                                            {format(new Date(item.created_at), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-blue-600"
                                                    onClick={async () => {
                                                        setSelected(item);
                                                        setNotes(item.notes || '');
                                                        setStatus(item.status);
                                                        // Mark as read in backend
                                                        await contactService.getSubmission(item.id);
                                                        fetchContacts();
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Details Modal */}
            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-w-2xl overflow-hidden p-0">
                    <DialogHeader className="p-6 bg-slate-900 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-500 text-[10px] uppercase tracking-widest">{selected?.status.replace('_', ' ')}</Badge>
                            <span className="text-xs text-slate-400">Submission #{selected?.id}</span>
                        </div>
                        <DialogTitle className="text-2xl font-bold">{selected?.subject || 'Contact Inquiry'}</DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50">
                                <User className="w-4 h-4 text-slate-400 mt-1" />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Name</p>
                                    <p className="text-sm font-semibold">{selected?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50">
                                <Mail className="w-4 h-4 text-slate-400 mt-1" />
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Email</p>
                                    <p className="text-sm font-semibold truncate">{selected?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Customer Message
                            </p>
                            <div className="p-4 rounded-xl border bg-white shadow-inner text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                {selected?.message}
                            </div>
                        </div>

                        <div className="pt-6 border-t flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label>Admin Notes</Label>
                                <Textarea
                                    placeholder="Internal notes about this inquiry..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="h-24 bg-slate-50"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <Label className="text-xs mb-1.5 block">Update Status</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(statusMap).map((s: any) => (
                                            <Button
                                                key={s}
                                                variant={status === s ? 'default' : 'outline'}
                                                className={cn("h-8 px-3 text-xs", status === s && "bg-slate-900")}
                                                onClick={() => setStatus(s)}
                                            >
                                                {statusMap[s].label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <Button className="mt-auto bg-blue-600 px-8" onClick={handleUpdate}>Update Inquiry</Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
