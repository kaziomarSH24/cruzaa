import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, Mail, MessageSquare, Package, Tag, ShoppingCart, Info, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { toast } from "sonner";

interface NotifPref {
    id: string;
    label: string;
    desc: string;
    icon: React.ElementType;
    email: boolean;
    sms: boolean;
}

const AccountNotifications = () => {
    const { isLoggedIn, user } = useUserAuth();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    const [prefs, setPrefs] = useState<NotifPref[]>([
        { id: "order_updates", label: "Order Updates", desc: "Status changes: confirmed, shipped, delivered", icon: Package, email: true, sms: false },
        { id: "promotions", label: "Promotions & Offers", desc: "Exclusive deals, sale alerts, discount codes", icon: Tag, email: true, sms: false },
        { id: "cart_reminders", label: "Cart Reminders", desc: "Reminders about items left in your cart", icon: ShoppingCart, email: false, sms: false },
        { id: "account_activity", label: "Account Activity", desc: "Login alerts, password changes, profile updates", icon: Info, email: true, sms: false },
        { id: "newsletter", label: "Newsletter", desc: "Product launches, features, and company news", icon: Mail, email: false, sms: false },
    ]);

    if (!isLoggedIn || !user) {
        navigate("/login", { state: { from: "/account/notifications" } });
        return null;
    }

    const toggle = (id: string) => {
        setPrefs(prev => prev.map(p => p.id === id ? { ...p, email: !p.email } : p));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API save
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        toast.success("Notification preferences saved!");
    };

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <button
            onClick={onChange}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${checked ? "bg-primary" : "bg-border"}`}
        >
            <motion.div
                animate={{ x: checked ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            />
        </button>
    );

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
                            <h1 className="text-2xl font-black">Email Notifications</h1>
                            <p className="text-muted-foreground text-sm">Choose which updates you want to receive</p>
                        </div>
                    </motion.div>

                    {/* Preferences List */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-card rounded-2xl border border-border overflow-hidden mb-4"
                    >
                        {prefs.map((pref, i) => (
                            <motion.div
                                key={pref.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 + i * 0.05 }}
                                className={`flex items-center gap-4 px-5 py-5 ${i < prefs.length - 1 ? "border-b border-border" : ""}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <pref.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{pref.label}</p>
                                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Email</span>
                                    <Toggle checked={pref.email} onChange={() => toggle(pref.id)} />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Info note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xs text-muted-foreground text-center mb-6"
                    >
                        You will always receive critical notifications about your orders even if all options are off.
                    </motion.p>

                    {/* Save Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                        ) : (
                            <><Check className="w-4 h-4" /> Save Preferences</>
                        )}
                    </motion.button>

                </div>
            </section>
        </Layout>
    );
};

export default AccountNotifications;
