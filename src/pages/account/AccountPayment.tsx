import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Plus, Trash2, Check, Shield, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUserAuth } from "@/contexts/UserAuthContext";
import customerAuthService from "@/services/customerAuthService";
import { toast } from "sonner";

interface PaymentMethod {
    id: string;
    type: "visa" | "mastercard" | "amex";
    last4: string;
    expiry: string;
    holder: string;
    isDefault: boolean;
}

const AccountPayment = () => {
    const { isLoggedIn, user } = useUserAuth();
    const navigate = useNavigate();
    const [cards, setCards] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn || !user) {
            navigate("/login", { state: { from: "/account/payment" } });
            return;
        }
        fetchCards();
    }, [isLoggedIn, user]);

    const fetchCards = async () => {
        try {
            const data = await customerAuthService.getPaymentMethods();
            setCards(data.map((c: any) => ({
                id: c.id.toString(),
                type: c.card_type as any,
                last4: c.last4,
                expiry: `${c.expiry_month}/${c.expiry_year.toString().slice(-2)}`,
                holder: c.card_holder,
                isDefault: !!c.is_default
            })));
        } catch (err) {
            toast.error("Failed to load payment methods");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await customerAuthService.deletePaymentMethod(Number(id));
            setCards(prev => prev.filter(c => c.id !== id));
            toast.success("Payment method removed");
        } catch (err) {
            toast.error("Failed to remove card");
        }
    };

    const handleSetDefault = (id: string) => {
        // Mocking for now since backend doesn't have a specific set-default for PMs yet
        setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
        toast.success("Default payment method updated");
    };

    return (
        <Layout>
            <section className="pt-32 pb-16 min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
                <div className="container-custom max-w-3xl mx-auto">

                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
                        <Link to="/account" className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-black">Payment Methods</h1>
                            <p className="text-muted-foreground text-sm">Manage your saved cards and billing options</p>
                        </div>
                        <button
                            onClick={() => toast.info("Stripe integration would open here")}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Card
                        </button>
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {loading ? (
                            <>
                                {[1, 2].map(i => (
                                    <div key={i} className="h-48 bg-card rounded-2xl border border-border animate-pulse" />
                                ))}
                            </>
                        ) : cards.length === 0 ? (
                            <div className="sm:col-span-2 text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No saved cards</h3>
                                <p className="text-muted-foreground mb-6">Save a card for faster checkout next time.</p>
                                <button onClick={() => toast.info("Add card clicked")} className="btn-hero-primary inline-flex">
                                    <Plus className="w-5 h-5" /> Add New Card
                                </button>
                            </div>
                        ) : (
                            cards.map((card, i) => (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative p-6 rounded-2xl border transition-all duration-300 ${card.isDefault
                                        ? "bg-card border-primary/40 shadow-lg shadow-primary/5"
                                        : "bg-card border-border hover:border-primary/20"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-8 bg-secondary/50 rounded flex items-center justify-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{card.type}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDelete(card.id)}
                                                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-1.5 font-mono text-lg">
                                            <span>••••</span> <span>••••</span> <span>••••</span> <span>{card.last4}</span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Card Holder</p>
                                                <p className="text-sm font-semibold">{card.holder}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Expires</p>
                                                <p className="text-sm font-semibold">{card.expiry}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {card.isDefault ? (
                                        <div className="absolute top-4 right-4 text-primary bg-primary/10 p-1 rounded-lg">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleSetDefault(card.id)}
                                            className="mt-4 w-full py-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors border border-dashed border-border rounded-xl"
                                        >
                                            Set as default
                                        </button>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Secure Note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 p-6 rounded-2xl bg-secondary/30 border border-border flex items-start gap-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Secure Payment Storage</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Cruzaa does not store your full card details. All payment information is stored securely by Stripe, our PCI-compliant payment processor.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </section>
        </Layout>
    );
};

export default AccountPayment;
