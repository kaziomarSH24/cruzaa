import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Shield, Lock, Eye, EyeOff, Check,
    AlertTriangle, Smartphone, LogOut, ChevronRight
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUserAuth } from "@/contexts/UserAuthContext";
import customerAuthService from "@/services/customerAuthService";
import { toast } from "sonner";

const AccountSecurity = () => {
    const { isLoggedIn, user, logout } = useUserAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState<"password" | "sessions">("password");
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);

    if (!isLoggedIn || !user) {
        navigate("/login", { state: { from: "/account/security" } });
        return null;
    }

    // Password strength
    const strength = (() => {
        if (!newPw) return 0;
        let score = 0;
        if (newPw.length >= 8) score++;
        if (/[A-Z]/.test(newPw)) score++;
        if (/[0-9]/.test(newPw)) score++;
        if (/[^A-Za-z0-9]/.test(newPw)) score++;
        return score;
    })();
    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
    const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"][strength];

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
        if (newPw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
        setSaving(true);
        try {
            await customerAuthService.updateProfile({ password: newPw, current_password: currentPw });
            toast.success("Password updated successfully!");
            setCurrentPw(""); setNewPw(""); setConfirmPw("");
        } catch (err: any) {
            toast.error(err?.message || "Failed to update password");
        } finally {
            setSaving(false);
        }
    };

    // Fake sessions for demo
    const sessions = [
        { id: 1, device: "Chrome on Windows", location: "London, UK", lastActive: "Just now", current: true },
        { id: 2, device: "Safari on iPhone", location: "Manchester, UK", lastActive: "2 hours ago", current: false },
    ];

    const handleLogoutAll = async () => {
        await logout();
        toast.success("Signed out of all devices");
        navigate("/login");
    };

    return (
        <Layout>
            <section className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <div className="container-custom max-w-2xl mx-auto">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
                        <Link to="/account" className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black">Security</h1>
                            <p className="text-muted-foreground text-sm">Manage your password and active sessions</p>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-1 bg-secondary/50 p-1 rounded-2xl mb-6">
                        {(["password", "sessions"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 capitalize ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {t === "password" ? "🔑 Password" : "📱 Active Sessions"}
                            </button>
                        ))}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {tab === "password" && (
                            <motion.div key="password" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                <div className="bg-card rounded-2xl border border-border p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <Lock className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Change Password</p>
                                            <p className="text-xs text-muted-foreground">Use a strong, unique password</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        {/* Current password */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrent ? "text" : "password"} required
                                                    value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                                                    className="w-full px-4 py-3 pr-11 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                    placeholder="Enter current password"
                                                />
                                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New password */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showNew ? "text" : "password"} required
                                                    value={newPw} onChange={e => setNewPw(e.target.value)}
                                                    className="w-full px-4 py-3 pr-11 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                    placeholder="At least 8 characters"
                                                />
                                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {/* Strength bar */}
                                            {newPw && (
                                                <div className="mt-2">
                                                    <div className="flex gap-1 mb-1">
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-border"}`} />
                                                        ))}
                                                    </div>
                                                    <p className={`text-xs font-medium ${["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-500"][strength]}`}>
                                                        {strengthLabel}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm password */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirm ? "text" : "password"} required
                                                    value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                                                    className={`w-full px-4 py-3 pr-11 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${confirmPw && confirmPw !== newPw ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`}
                                                    placeholder="Repeat new password"
                                                />
                                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {confirmPw && confirmPw !== newPw && (
                                                <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Passwords do not match</p>
                                            )}
                                            {confirmPw && confirmPw === newPw && (
                                                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
                                            )}
                                        </div>

                                        <button
                                            type="submit" disabled={saving || !currentPw || !newPw || newPw !== confirmPw}
                                            className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                                        >
                                            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</> : <><Shield className="w-4 h-4" /> Update Password</>}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {tab === "sessions" && (
                            <motion.div key="sessions" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                {sessions.map((session, i) => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        className={`bg-card rounded-2xl border p-5 ${session.current ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border"}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${session.current ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-sm">{session.device}</p>
                                                    {session.current && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Current</span>}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{session.location} · {session.lastActive}</p>
                                            </div>
                                            {!session.current && (
                                                <button className="text-xs text-destructive font-medium hover:underline">
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Logout all */}
                                <button
                                    onClick={handleLogoutAll}
                                    className="w-full flex items-center justify-between p-5 bg-card rounded-2xl border border-destructive/20 hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center">
                                            <LogOut className="w-5 h-5 text-destructive" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-sm text-destructive">Sign Out All Devices</p>
                                            <p className="text-xs text-muted-foreground">You'll need to log in again</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-destructive group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </section>
        </Layout>
    );
};

export default AccountSecurity;
