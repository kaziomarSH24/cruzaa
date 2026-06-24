import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Lock,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Loader2,
    Save,
    QrCode,
    RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import authService, { AdminUser } from '@/services/authService';
import { toast } from 'sonner';

export default function ProfilePage() {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // 2FA State
    const [show2FADialog, setShow2FADialog] = useState(false);
    const [twoFAData, setTwoFAData] = useState<{ secret: string; qr_code_url: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [is2FASubmitting, setIs2FASubmitting] = useState(false);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile();
            setUser(data);
            setFullName(data.full_name);
            setEmail(data.email);
        } catch (e) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await authService.updateProfile({ full_name: fullName, email });
            toast.success('Profile updated successfully');
            fetchProfile();
        } catch (e: any) {
            const message = e.response?.data?.message || 'Update failed';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (newPassword.length < 8) {
            return toast.error('New password must be at least 8 characters');
        }

        setSaving(true);
        try {
            await authService.updatePassword({ current_password: currentPassword, new_password: newPassword });
            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e: any) {
            const message = e.response?.data?.message || 'Password change failed';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const initiate2FASetup = async () => {
        try {
            const res = await authService.setup2FA();
            setTwoFAData(res.data);
            setShow2FADialog(true);
        } catch (e) {
            toast.error('Failed to start 2FA setup');
        }
    };

    const handleEnable2FA = async () => {
        if (verificationCode.length !== 6) return;
        setIs2FASubmitting(true);
        try {
            await authService.enable2FA(verificationCode);
            toast.success('2FA enabled successfully');
            setShow2FADialog(false);
            setVerificationCode('');
            fetchProfile();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Invalid code');
        } finally {
            setIs2FASubmitting(false);
        }
    };

    const handleDisable2FA = async () => {
        const code = prompt('Enter 2FA code to disable:');
        if (!code) return;
        try {
            await authService.disable2FA(code);
            toast.success('2FA disabled');
            fetchProfile();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to disable 2FA');
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Profile</h1>
                <p className="text-slate-500 text-sm">Manage your security settings and account information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                            <CardDescription>Update your name and email address</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="full_name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-9"
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={saving} className="bg-blue-600">
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Change Password</CardTitle>
                            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <Input
                                        id="current_password"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="new_password">New Password</Label>
                                        <Input
                                            id="new_password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                                        <Input
                                            id="confirm_password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" variant="outline" disabled={saving}>
                                    Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Security Sidebar */}
                <div className="space-y-6">
                    <Card className={user?.two_fa_enabled ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200"}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Two-Factor</CardTitle>
                                {user?.two_fa_enabled ? (
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                ) : (
                                    <ShieldAlert className="h-5 w-5 text-slate-400" />
                                )}
                            </div>
                            <CardDescription>Add an extra layer of security</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <Badge variant={user?.two_fa_enabled ? "success" : "secondary"}>
                                    {user?.two_fa_enabled ? 'Active' : 'Disabled'}
                                </Badge>
                            </div>

                            {user?.two_fa_enabled ? (
                                <Button
                                    variant="destructive"
                                    className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                    onClick={handleDisable2FA}
                                >
                                    Disable 2FA
                                </Button>
                            ) : (
                                <Button
                                    className="w-full bg-slate-900 text-white"
                                    onClick={initiate2FASetup}
                                >
                                    Setup Google Authenticator
                                </Button>
                            )}

                            <p className="text-[10px] text-slate-400 leading-relaxed text-center">
                                Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 2FA Setup Dialog */}
            <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Setup Authenticator</DialogTitle>
                        <DialogDescription>
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center space-y-6 py-4">
                        {twoFAData?.qr_code_url && (
                            <div className="p-4 bg-white rounded-xl shadow-inner border">
                                <img src={twoFAData.qr_code_url} alt="QR Code" className="w-48 h-48" />
                            </div>
                        )}
                        <div className="text-center space-y-2">
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Setup Key</p>
                            <code className="px-3 py-1 bg-slate-100 rounded text-lg font-mono tracking-tighter shadow-sm">{twoFAData?.secret}</code>
                        </div>
                        <div className="w-full space-y-2">
                            <Label htmlFor="verify_code" className="text-center block">Verification Code</Label>
                            <Input
                                id="verify_code"
                                placeholder="000 000"
                                className="text-center text-2xl tracking-[1em]"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShow2FADialog(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600"
                            disabled={verificationCode.length !== 6 || is2FASubmitting}
                            onClick={handleEnable2FA}
                        >
                            {is2FASubmitting ? 'Verifying...' : 'Enable 2FA'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Simple Badge component if not available or just use classes
const Badge = ({ children, variant = 'secondary' }: { children: React.ReactNode; variant?: 'success' | 'secondary' }) => {
    const variants: Record<string, string> = {
        success: 'bg-emerald-100 text-emerald-700',
        secondary: 'bg-slate-100 text-slate-600'
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${variants[variant]}`}>
            {children}
        </span>
    );
};
