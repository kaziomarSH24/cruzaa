import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, ChevronDown, ChevronRight, Package, LogOut, Settings } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import logo from "@/assets/cruzaa-logo.png";
import darkLogo from "@/assets/dark-logo.png";
import navigationService from "@/services/navigationService";
import settingsService from "@/services/settingsService";
import CartDrawer from "@/components/cart/CartDrawer";
import { toast } from "sonner";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [siteLogo, setSiteLogo] = useState<string>(logo);
  const [siteDarkLogo, setSiteDarkLogo] = useState<string>(darkLogo);
  const [siteName, setSiteName] = useState<string>("CRUZAA");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const { user, isLoggedIn, logout } = useUserAuth();
  const itemCount = getItemCount();

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const items = await navigationService.getNavigation('header');
        if (items && items.length > 0) {
          setNavItems(items);
        } else {
          setNavItems([
            { name: "Home", href: "/" },
            { name: "Products", href: "/products" },
            { name: "Our Story", href: "/our-story" },
            { name: "Contact", href: "/contact" },
          ]);
        }
      } catch (e) {
        setNavItems([
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          { name: "Our Story", href: "/our-story" },
          { name: "Contact", href: "/contact" },
        ]);
      }
    };
    fetchNav();

    const fetchSettings = async () => {
      try {
        const settings = await settingsService.getPublicSettings();
        if (settings.site_logo) setSiteLogo(settings.site_logo);
        if (settings.site_dark_logo) setSiteDarkLogo(settings.site_dark_logo);
        if (settings.site_name) setSiteName(settings.site_name);
      } catch (e) {
        console.error("Failed to load site settings");
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [location]);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isHomePage = location.pathname === "/";

  const linkClass = (scrolled: boolean, home: boolean) =>
    scrolled || !home
      ? "text-foreground hover:text-primary"
      : "text-white hover:text-white/80";

  // ── Recursive Desktop Nav Dropdown ──────────────────────────────────────
  const DesktopNavDropdown = ({ item, isScrolled, isHomePage, level = 0 }: { item: any; isScrolled: boolean; isHomePage: boolean; level?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {hasChildren ? (
          <div className="flex items-center">
            <button
              className={`flex items-center gap-1 px-0 py-2 transition-all duration-300 font-bold tracking-tight text-xs lg:text-sm ${linkClass(isScrolled, isHomePage)} ${level > 0 ? "w-full justify-between px-4 py-3 hover:bg-secondary/50 text-xs" : "link-underline mx-3 sm:mx-4"}`}
            >
              {item.name}
              {level === 0 ? (
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          </div>
        ) : (
          <Link
            to={item.href}
            className={`block px-0 py-2 transition-all duration-300 font-bold tracking-tight text-xs lg:text-sm ${location.pathname === item.href
              ? "text-primary active-link-underline"
              : linkClass(isScrolled, isHomePage)
              } ${level > 0 ? "w-full px-4 py-3 hover:bg-secondary/50 text-xs" : "link-underline mx-3 sm:mx-4"}`}
          >
            {item.name}
          </Link>
        )}

        {hasChildren && (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: level === 0 ? 10 : 0, x: level === 0 ? 0 : 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                exit={{ opacity: 0, y: level === 0 ? 10 : 0, x: level === 0 ? 0 : 5, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`absolute z-[100] bg-background border-t-2 border-primary shadow-2xl ${level === 0 ? "top-full left-0 w-64" : "left-full top-0 ml-0 w-64"}`}
                style={{ overflow: 'visible' }}
              >
                <div className="py-0">
                  {item.children.map((child: any) => (
                    <DesktopNavDropdown key={child.name} item={child} isScrolled={true} isHomePage={false} level={level + 1} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  // ── Mobile Nav Item ──────────────────────────────────────────────────────
  const MobileNavItem = ({ item, level = 0 }: { item: any; level?: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div className="w-full">
        {hasChildren ? (
          <>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full py-3 px-2 text-foreground font-medium rounded-lg hover:bg-secondary transition-colors"
              style={{ paddingLeft: `${(level * 1) + 0.5}rem` }}
            >
              <span className="flex items-center gap-2">{item.name}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-l border-border/20 ml-4">
                  {item.children.map((child: any) => (
                    <MobileNavItem key={child.name} item={child} level={level + 1} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <Link
            to={item.href}
            className={`block py-3 px-2 font-medium rounded-lg transition-colors ${location.pathname === item.href ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-secondary"}`}
            style={{ paddingLeft: `${(level * 1) + 0.5}rem` }}
          >
            {item.name}
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      <header
        className={`fixed top-0 sm:top-[36px] left-0 right-0 z-40 transition-all duration-500 ${isScrolled
          ? "bg-background/90 backdrop-blur-xl shadow-lg border-b border-border/30 py-3"
          : isHomePage
            ? "bg-charcoal/40 backdrop-blur-xl border-b border-white/10 py-4"
            : "bg-background/90 backdrop-blur-xl border-b border-border/30 py-4"
          }`}
        style={{
          boxShadow: isScrolled
            ? '0 4px 30px rgba(0, 0, 0, 0.08)'
            : isHomePage
              ? '0 4px 30px rgba(0, 0, 0, 0.15)'
              : '0 4px 30px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img
                src={isScrolled || !isHomePage ? siteDarkLogo : siteLogo}
                alt={siteName}
                className="h-8 sm:h-10 w-auto transition-all duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <DesktopNavDropdown key={item.name} item={item} isScrolled={isScrolled} isHomePage={isHomePage} />
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* Account Button – visible on sm+ */}
              <div ref={accountMenuRef} className="relative hidden sm:block">
                {isLoggedIn && user ? (
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${isScrolled || !isHomePage
                      ? "text-foreground/80 hover:text-primary hover:bg-secondary"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <span className="hidden md:inline font-medium text-sm">{user.first_name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 hidden md:block ${isAccountMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isScrolled || !isHomePage
                      ? "text-foreground/80 hover:text-primary hover:bg-secondary"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}

                {/* Account Dropdown */}
                <AnimatePresence>
                  {isAccountMenuOpen && isLoggedIn && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-60 bg-background/95 backdrop-blur-xl rounded-2xl border border-border/50 z-[100] overflow-hidden"
                      style={{ boxShadow: '0 20px 40px -8px rgba(0,0,0,0.2)' }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-4 border-b border-border/50 bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                            {user.first_name[0]}{user.last_name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        <Link
                          to="/account"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-secondary/60 transition-colors"
                        >
                          <User className="w-4 h-4 text-muted-foreground" />
                          My Account
                        </Link>
                        <Link
                          to="/account/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-secondary/60 transition-colors"
                        >
                          <Package className="w-4 h-4 text-muted-foreground" />
                          My Orders
                        </Link>
                        <Link
                          to="/account/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-secondary/60 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          Edit Profile
                        </Link>
                        <div className="border-t border-border/50 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-primary text-white transition-all duration-300 hover:shadow-primary/40 shadow-lg shadow-primary/20 group"
              >
                <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                {/* Hide 'CART' label on xs, show on sm+ */}
                <span className="hidden sm:inline text-[10px] font-black tracking-widest uppercase">Cart</span>
                <div className="flex items-center justify-center bg-black/15 min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 sm:px-2 rounded-full text-[10px] sm:text-xs font-bold tabular-nums">
                  {itemCount}
                </div>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-1.5 sm:p-2 rounded-full transition-all duration-300 ${isScrolled || !isHomePage
                  ? "text-foreground hover:bg-secondary"
                  : "text-white hover:bg-white/10"
                  }`}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden mt-4 overflow-hidden"
              >
                <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-4 border border-border/50 shadow-2xl">
                  {navItems.map((item) => (
                    <MobileNavItem key={item.name} item={item} />
                  ))}

                 
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
