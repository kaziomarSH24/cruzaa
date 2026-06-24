import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import logo from "@/assets/cruzaa-logo.png";
import customerAuthService from "@/services/customerAuthService";
import { toast } from "sonner";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await customerAuthService.forgotPassword(email);
            setSubmitted(true);
            toast.success("Reset link sent to your email!");
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <section className="pt-32 pb-16 min-h-screen flex items-center bg-gradient-to-br from-background via-secondary/20 to-background">
                <div className="container-custom">
                    <div className="max-w-md mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-center mb-8">
                                <Link to="/" className="inline-block mb-5">
                                    <img src={logo} alt="Cruzaa" className="h-10 w-auto mx-auto" />
                                </Link>
                                <h1 className="text-3xl font-black tracking-tight">Forgot Password?</h1>
                                <p className="text-muted-foreground mt-2 px-6">
                                    Enter your email and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <div className="bg-card rounded-3xl border border-border shadow-xl p-8">
                                <AnimatePresence mode="wait">
                                    {!submitted ? (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-6"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        className="w-full pl-12 pr-4 py-3.5 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                                        placeholder="you@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        Send Reset Link <ArrowRight className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>

                                            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                                                <ArrowLeft className="w-4 h-4" /> Back to Login
                                            </Link>
                                        </motion.form>
                                    ) : (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="text-center space-y-6 py-4"
                                        >
                                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                                <CheckCircle className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold mb-2">Check your email</h2>
                                                <p className="text-sm text-muted-foreground">
                                                    We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>
                                                </p>
                                            </div>
                                            <Link
                                                to="/login"
                                                className="block w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                Back to Login
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                Didn't receive the email? Check your spam folder or{" "}
                                                <button onClick={() => setSubmitted(false)} className="text-primary hover:underline font-semibold">
                                                    try again
                                                </button>
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ForgotPassword;
