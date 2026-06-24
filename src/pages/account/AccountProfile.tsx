import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Save, Loader2, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUserAuth } from "@/contexts/UserAuthContext";
import customerAuthService from "@/services/customerAuthService";
import { toast } from "sonner";

const AccountProfile = () => {
    const { user, refreshUser, isLoggedIn } = useUserAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [tab, setTab] = useState<"info" | "password">("info");

    const [info, setInfo] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    });
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: "/account/profile" } });
            return;
        }
        if (user) {
            setInfo({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user, isLoggedIn]);

    const handleInfoSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await customerAuthService.updateProfile(info);
            await refreshUser();
            toast.success("Profile updated successfully!");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("Passwords do not match");
            return;
        }
        if (passwords.new.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        setSaving(true);
        try {
            await customerAuthService.updateProfile({
                current_password: passwords.current,
                password: passwords.new,
                password_confirmation: passwords.confirm,
            });
            setPasswords({ current: "", new: "", confirm: "" });
            toast.success("Password changed successfully!");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to change password");
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full pl-12 pr-4 py-3.5 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

    if (!user) return null;

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
                            <h1 className="text-2xl font-black">Edit Profile</h1>
                            <p className="text-muted-foreground text-sm">Manage your personal information</p>
                        </div>
                    </motion.div>

                    {/* Avatar */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="flex items-center gap-5 p-6 bg-card rounded-2xl border border-border mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/30 flex-shrink-0">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                            <p className="font-bold text-lg">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex bg-secondary rounded-2xl p-1 mb-6 gap-1">
                        <button
                            onClick={() => setTab("info")}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "info" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
                        >
                            Personal Info
                        </button>
                        <button
                            onClick={() => setTab("password")}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === "password" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}
                        >
                            Change Password
                        </button>
                    </div>

                    {/* Personal Info Form */}
                    {tab === "info" && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            className="bg-card rounded-3xl border border-border p-8">
                            <form onSubmit={handleInfoSave} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">First Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input type="text" value={info.first_name} onChange={e => setInfo(p => ({ ...p, first_name: e.target.value }))} required className={inputClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Last Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input type="text" value={info.last_name} onChange={e => setInfo(p => ({ ...p, last_name: e.target.value }))} required className={inputClass} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input type="email" value={info.email} onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} required className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input type="tel" value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="+44 7700 000000" />
                                    </div>
                                </div>
                                <button type="submit" disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100">
                                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Password Form */}
                    {tab === "password" && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                            className="bg-card rounded-3xl border border-border p-8">
                            <form onSubmit={handlePasswordSave} className="space-y-5">
                                {[
                                    { label: "Current Password", key: "current", ac: "current-password" },
                                    { label: "New Password", key: "new", ac: "new-password" },
                                    { label: "Confirm New Password", key: "confirm", ac: "new-password" },
                                ].map(({ label, key, ac }) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-1.5">{label}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={(passwords as any)[key]}
                                                onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                                                required
                                                autoComplete={ac}
                                                className={`${inputClass} pr-12`}
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {passwords.new && passwords.confirm && passwords.new === passwords.confirm && (
                                    <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4" /> Passwords match
                                    </p>
                                )}

                                <button type="submit" disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100">
                                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                    {saving ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default AccountProfile;
