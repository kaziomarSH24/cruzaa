import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Plus, Edit2, Trash2, Check, Home, Building2, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUserAuth } from "@/contexts/UserAuthContext";
import customerAuthService from "@/services/customerAuthService";
import { toast } from "sonner";

interface Address {
    id: number;
    label: string;
    type: "home" | "work" | "other";
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
    isDefault: boolean;
}

const DEMO_ADDRESSES: Address[] = [
    {
        id: 1,
        label: "Home",
        type: "home",
        line1: "42 Baker Street",
        city: "London",
        postcode: "W1U 6TY",
        country: "United Kingdom",
        isDefault: true,
    },
];

const typeIcons = {
    home: Home,
    work: Building2,
    other: MapPin,
};

const AccountAddresses = () => {
    const { isLoggedIn, user } = useUserAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        label: "", type: "home" as "home" | "work" | "other",
        line1: "", line2: "", city: "", postcode: "", country: "United Kingdom",
        is_default: false
    });

    useEffect(() => {
        if (!isLoggedIn || !user) {
            navigate("/login", { state: { from: "/account/addresses" } });
            return;
        }
        fetchAddresses();
    }, [isLoggedIn, user]);

    const fetchAddresses = async () => {
        try {
            const data = await customerAuthService.getAddresses();
            setAddresses(data.map((a: any) => ({
                ...a,
                isDefault: !!a.is_default
            })));
        } catch (err) {
            toast.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ label: "", type: "home", line1: "", line2: "", city: "", postcode: "", country: "United Kingdom", is_default: false });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (addr: Address) => {
        setForm({
            label: addr.label,
            type: addr.type,
            line1: addr.line1,
            line2: addr.line2 || "",
            city: addr.city,
            postcode: addr.postcode,
            country: addr.country,
            is_default: addr.isDefault
        });
        setEditingId(addr.id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await customerAuthService.deleteAddress(id);
            setAddresses(prev => prev.filter(a => a.id !== id));
            toast.success("Address removed");
        } catch (err) {
            toast.error("Failed to delete address");
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            const addr = addresses.find(a => a.id === id);
            if (!addr) return;
            await customerAuthService.updateAddress(id, { ...addr, is_default: true });
            setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
            toast.success("Default address updated");
        } catch (err) {
            toast.error("Failed to update default address");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.line1 || !form.city || !form.postcode) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                await customerAuthService.updateAddress(editingId, form);
                toast.success("Address updated");
            } else {
                await customerAuthService.addAddress(form);
                toast.success("Address added");
            }
            fetchAddresses();
            resetForm();
        } catch (err) {
            toast.error("Failed to save address");
        } finally {
            setLoading(false);
        }
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
                            <h1 className="text-2xl font-black">Delivery Addresses</h1>
                            <p className="text-muted-foreground text-sm">Manage your saved addresses</p>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Address
                            </button>
                        )}
                    </motion.div>

                    {/* Add / Edit Form */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden mb-6"
                            >
                                <div className="bg-card rounded-2xl border border-primary/30 p-6 shadow-lg shadow-primary/5">
                                    <h2 className="font-bold text-lg mb-5">{editingId ? "Edit Address" : "New Address"}</h2>
                                    <form onSubmit={handleSave} className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5">Label (e.g. Home)</label>
                                                <input
                                                    value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                                                    placeholder="Home, Office..."
                                                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5">Type</label>
                                                <select
                                                    value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))}
                                                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                >
                                                    <option value="home">🏠 Home</option>
                                                    <option value="work">🏢 Work</option>
                                                    <option value="other">📍 Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Address Line 1 *</label>
                                            <input
                                                required value={form.line1} onChange={e => setForm(p => ({ ...p, line1: e.target.value }))}
                                                placeholder="Street address, flat number..."
                                                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Address Line 2</label>
                                            <input
                                                value={form.line2} onChange={e => setForm(p => ({ ...p, line2: e.target.value }))}
                                                placeholder="Apartment, unit, building (optional)"
                                                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="grid sm:grid-cols-3 gap-4">
                                            <div className="sm:col-span-1">
                                                <label className="block text-sm font-medium mb-1.5">Postcode *</label>
                                                <input
                                                    required value={form.postcode} onChange={e => setForm(p => ({ ...p, postcode: e.target.value }))}
                                                    placeholder="SW1A 1AA"
                                                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium mb-1.5">City *</label>
                                                <input
                                                    required value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                                    placeholder="London"
                                                    className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5">Country</label>
                                            <input
                                                value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                                                className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                                                {editingId ? "Save Changes" : "Add Address"}
                                            </button>
                                            <button type="button" onClick={resetForm} className="px-6 py-3 border border-border rounded-xl font-semibold hover:bg-secondary transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Address Cards */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-32 bg-card rounded-2xl border border-border animate-pulse flex items-center px-6 gap-4">
                                        <div className="w-12 h-12 bg-secondary rounded-xl" />
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-secondary rounded w-1/4" />
                                            <div className="h-3 bg-secondary rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : addresses.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No addresses saved</h3>
                                <p className="text-muted-foreground mb-6">Add your first delivery address to speed up checkout.</p>
                                <button onClick={() => setShowForm(true)} className="btn-hero-primary inline-flex">
                                    <Plus className="w-5 h-5" /> Add Address
                                </button>
                            </motion.div>
                        ) : (
                            addresses.map((addr, i) => {
                                const Icon = typeIcons[addr.type];
                                return (
                                    <motion.div
                                        key={addr.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`bg-card rounded-2xl border p-5 transition-all duration-300 ${addr.isDefault ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border"}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${addr.isDefault ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold">{addr.label || addr.type}</p>
                                                    {addr.isDefault && (
                                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.postcode}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{addr.country}</p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!addr.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(addr.id)}
                                                        title="Set as default"
                                                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors text-xs font-medium px-3"
                                                    >
                                                        Set default
                                                    </button>
                                                )}
                                                <button onClick={() => handleEdit(addr)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(addr.id)} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

                </div>
            </section>
        </Layout>
    );
};

export default AccountAddresses;
