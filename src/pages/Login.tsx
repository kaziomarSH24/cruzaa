import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Phone, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import logo from "@/assets/cruzaa-logo.png";
import { useUserAuth } from "@/contexts/UserAuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading } = useUserAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const redirectTo = (location.state as any)?.from || "/account";

  const handleChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
      } else {
        await register({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        });
        toast.success("Account created! Welcome to Cruzaa 🎉");
      }
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || (isLogin ? "Login failed" : "Registration failed");
      toast.error(msg);
    }
  };

  const inputClass =
    "w-full pl-12 pr-4 py-3.5 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

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
              {/* Logo */}
              <div className="text-center mb-8">
                <Link to="/" className="inline-block mb-5">
                  <img src={logo} alt="Cruzaa" className="h-10 w-auto mx-auto" />
                </Link>
                <h1 className="text-3xl font-black tracking-tight">
                  {isLogin ? "Welcome back" : "Join Cruzaa"}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {isLogin
                    ? "Sign in to manage your orders & account"
                    : "Create your account and start riding"}
                </p>
              </div>

              {/* Tab Toggle */}
              <div className="flex rounded-2xl bg-secondary p-1 mb-6 gap-1">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${isLogin
                    ? "bg-background shadow-md text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${!isLogin
                    ? "bg-background shadow-md text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form Card */}
              <div className="bg-card rounded-3xl border border-border shadow-xl p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1.5">First Name</label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => handleChange("first_name", e.target.value)}
                                required={!isLogin}
                                className={inputClass}
                                placeholder="John"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5">Last Name</label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => handleChange("last_name", e.target.value)}
                                required={!isLogin}
                                className={inputClass}
                                placeholder="Doe"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleChange("phone", e.target.value)}
                              className={inputClass}
                              placeholder="+44 7700 000000"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className={inputClass}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        required
                        className={`${inputClass} pr-12`}
                        placeholder="••••••••"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type={showConfirm ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            required={!isLogin}
                            className={`${inputClass} pr-12`}
                            placeholder="••••••••"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3" /> Passwords match
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isLogin && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-border accent-primary" />
                        <span className="text-muted-foreground">Remember me</span>
                      </label>
                      <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        {isLogin ? "Signing in..." : "Creating account..."}
                      </span>
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {!isLogin && (
                  <p className="text-xs text-center text-muted-foreground mt-5">
                    By creating an account, you agree to our{" "}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
