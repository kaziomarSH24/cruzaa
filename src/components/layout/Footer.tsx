import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import navigationService from "@/services/navigationService";
import newsletterService from "@/services/newsletterService";

/* ─────────────────────────────────────────────
   reCAPTCHA Setup
───────────────────────────────────────────── */
declare global {
  interface Window {
    grecaptcha: any;
  }
}

/* ─────────────────────────────────────────────
   Reference-exact fallback columns
   These are shown until / unless the admin
   configures a "footer" nav menu in the CMS.
───────────────────────────────────────────── */
const DEFAULT_COL1 = [
  { name: "Home", href: "/" },
  {
    name: "Limited Edition E Scooters",
    href: "/products/limited-edition-e-scooters",
  },
  { name: "E Scooters", href: "/products/electric-scooters" },
  { name: "E-Bikes", href: "/products/electric-bikes" },
  { name: "Cruzaa Family", href: "/cruzaa-family" },
  { name: "Our Story", href: "/our-story" },
];

const DEFAULT_COL2 = [
  { name: "Cycle to Work Scheme", href: "/cycle-to-work-scheme" },
  { name: "Wholesale", href: "/joinus" },
  { name: "Contact Us", href: "/contact" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
];

const SOCIAL_LINKS = [
  {
    icon: Facebook,
    href: "https://facebook.com/cruzaa.lyf",
    label: "Facebook",
  },
  // { icon: Twitter,   href: "https://twitter.com/cruzaa",   label: "Twitter" },
  {
    icon: Instagram,
    href: "https://instagram.com/cruzaa_life",
    label: "Instagram",
  },
  { icon: Youtube, href: "https://youtube.com/@cruzaa_life", label: "Youtube" },
];

type NavLink = { name: string; href: string };

/* Map a nav item to a simple link object */
const toLink = (item: any): NavLink => ({
  name: item.name || item.title || "",
  href: item.href || item.url || "#",
});

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [col1, setCol1] = useState<NavLink[]>(DEFAULT_COL1);
  const [col2, setCol2] = useState<NavLink[]>(DEFAULT_COL2);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const [siteKey, setSiteKey] = useState<string>("");
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");

  /* ── Load reCAPTCHA script and site key ── */
  useEffect(() => {
    // Load site key from public settings endpoint
    const loadSiteKey = async () => {
      try {
        const response = await fetch("/api/settings/public");
        const data = await response.json();
        const key = data?.data?.recaptcha_site_key;
        if (key) {
          setSiteKey(key);
          // Load reCAPTCHA script AFTER we have the site key
          loadRecaptchaScript(key);
        }
      } catch (error) {
        console.error("Failed to load reCAPTCHA site key:", error);
      }
    };

    const loadRecaptchaScript = (key: string) => {
      // Check if script already exists
      if (window.grecaptcha) {
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error("Failed to load reCAPTCHA script");
      };
      document.head.appendChild(script);
    };

    loadSiteKey();
  }, []);

  /* ── Load footer nav from CMS ── */
  useEffect(() => {
    const load = async () => {
      try {
        const items = await navigationService.getNavigation("footer");
        if (!items || items.length === 0) return; // keep defaults

        // Case A: Admin has set up two parent groups → use group[0] for col1, group[1] for col2
        const groups = items.filter(
          (i: any) => i.children && i.children.length > 0,
        );
        if (groups.length >= 2) {
          setCol1(groups[0].children.map(toLink));
          setCol2(groups[1].children.map(toLink));
          return;
        }

        // Case B: flat list of links → split into two halves
        const flat = items.flatMap((i: any) =>
          i.children?.length ? i.children.map(toLink) : [toLink(i)],
        );
        if (flat.length > 0) {
          const mid = Math.ceil(flat.length / 2);
          setCol1(flat.slice(0, mid));
          setCol2(flat.slice(mid));
        }
      } catch {
        // silently use defaults
      }
    };
    load();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      // Get reCAPTCHA token if available (reCAPTCHA v3 is invisible)
      let token = "";
      if (window.grecaptcha && siteKey) {
        try {
          token = await window.grecaptcha.execute(siteKey, {
            action: "subscribe",
          });
          setRecaptchaToken(token);
        } catch (err) {
          console.error("reCAPTCHA execution failed:", err);
          // Continue without token if reCAPTCHA fails
        }
      }
      // Submit newsletter with or without token
      await submitNewsletter(email.trim(), token);
    } catch (error: any) {
      const errorMessage =
        error.message || "An error occurred. Please try again later.";
      alert(errorMessage);
      console.error("Newsletter subscription error:", error);
      setIsLoading(false);
    }
  };

  const submitNewsletter = async (email: string, token: string) => {
    try {
      await newsletterService.subscribe(email, token);
      setSubmitted(true);
      setEmail("");
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error: any) {
      const errorMessage =
        error.message || "An error occurred. Please try again later.";
      alert(errorMessage);
      console.error("Newsletter subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer>
      {/* ── Newsletter ── Black */}
      <div className="bg-black text-white py-14 sm:py-20">
        <div className="container-custom text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
            Be in the know
          </h3>
          <p className="text-white/55 text-sm sm:text-base mb-10">
            Latest news, offers and events
          </p>

          {submitted ? (
            <p className="text-primary font-semibold text-lg">
              Thanks for signing up! 🎉
            </p>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <form
                onSubmit={handleSignup}
                className="flex flex-col sm:flex-row items-center justify-center max-w-lg mx-auto px-4 w-full"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="
                    flex-1 w-full sm:w-auto bg-transparent
                    border-0 border-b border-white/40 text-white
                    placeholder:text-white/40 text-sm px-2 py-3
                    focus:outline-none focus:border-white/80 transition-colors
                  "
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    mt-5 sm:mt-0 sm:ml-8 px-8 py-2.5
                    bg-primary text-white text-xs font-black tracking-[0.18em] uppercase
                    rounded-full hover:bg-primary/90 active:scale-95 transition-all
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-primary
                  "
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block animate-spin">⏳</span>
                      Subscribing...
                    </span>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>
              <p className="text-white/40 text-xs mt-2">
                Protected by reCAPTCHA
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Footer ── Primary Red */}
      {/* ── Main Footer ── Primary Red */}
      <div className="bg-primary text-white">
        <div className="container-custom py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Column 1 */}
            <ul className="space-y-2.5">
              {col1.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] text-white/85 hover:text-white transition-colors block"
                  >
                    {/* Removed <br /> to allow natural flow on desktop */}
                    {link.name.toLowerCase().includes("limited edition") ? (
                      <>
                        LIMITED EDITION{" "}
                        <span className="whitespace-nowrap">E SCOOTERS</span>
                      </>
                    ) : (
                      link.name
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Column 2 */}
            <ul className="space-y-2.5">
              {col2.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] text-white/85 hover:text-white transition-colors block"
                  >
                    {/* Removed <br /> to allow natural flow on desktop */}
                    {link.name.toLowerCase().includes("limited edition") ? (
                      <>
                        LIMITED EDITION{" "}
                        <span className="whitespace-nowrap">E SCOOTERS</span>
                      </>
                    ) : (
                      link.name
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Column 3 — Social + Contact (always static) */}
            <div className="col-span-2 lg:col-span-1 flex flex-col gap-5">
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-8 h-8 rounded border border-white/35 flex items-center justify-center hover:bg-white/20 hover:border-white/60 transition-all"
                  >
                    <s.icon className="w-3.5 h-3.5 text-white" />
                  </a>
                ))}
              </div>

              <div>
                <p className="text-sm sm:text-base font-bold leading-snug">
                  Have any questions? Get in touch.
                </p>
                <p className="text-sm sm:text-base font-bold">
                  <a
                    href="tel:02033268888"
                    className="hover:underline underline-offset-2"
                  >
                    0203 326 8888
                  </a>{" "}
                  or{" "}
                  <a
                    href="mailto:hi@cruzaa.com"
                    className="hover:underline underline-offset-2"
                  >
                    hi@cruzaa.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/20 mt-10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-white/65 font-medium uppercase tracking-wide">
            <span>Copyright ©{currentYear} Cruzaa Ltd™</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
