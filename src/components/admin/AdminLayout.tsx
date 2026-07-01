/**
 * Admin Layout
 * Provides Sidebar and Header for all Admin pages
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Layers,
  Layout,
  FileText,
  Menu,
  Mail,
  Newspaper,
  CreditCard,
  Settings,
  X,
  LogOut,
  Globe,
  Link as LinkIcon,
  User,
  ChevronRight,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
  { icon: Users, label: "Customers", path: "/admin/users" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: Layers, label: "Categories", path: "/admin/categories" },
  { icon: Layout, label: "Hero Slider", path: "/admin/slider" },
  { icon: FileText, label: "Content", path: "/admin/content" },
  { icon: Menu, label: "Navigation", path: "/admin/navigation" },
  { icon: Mail, label: "Inquiries", path: "/admin/contacts" },
  { icon: Newspaper, label: "Newsletter", path: "/admin/newsletter" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: FileText, label: "Pages", path: "/admin/pages" },
  { icon: HelpCircle, label: "FAQs", path: "/admin/faqs" },
  { icon: MessageSquare, label: "Testimonials", path: "/admin/testimonials" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(
    window.innerWidth >= 1024,
  );
  const location = useLocation();
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  // Responsive Sidebar Handling
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Close sidebar on mobile when navigating
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-slate-800",
          !isSidebarOpen && "-translate-x-full",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Cruzaa Admin
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/admin" &&
                  location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white",
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Bottom */}
          <div className="p-4 border-t border-slate-800 mt-auto">
            <div className="flex items-center gap-3 px-2 py-3">
              <Avatar className="w-9 h-9 border-2 border-slate-700">
                <AvatarFallback className="bg-slate-800 text-slate-100 uppercase">
                  {user?.username?.substring(0, 2) || "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user?.full_name || "Admin User"}
                </p>
                <p className="text-xs text-slate-400 truncate opacity-70 capitalize">
                  {user?.role || "Administrator"}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
              {sidebarItems.find(
                (item) =>
                  location.pathname === item.path ||
                  (item.path !== "/admin" &&
                    location.pathname.startsWith(item.path)),
              )?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full select-none"
                >
                  <Avatar className="h-9 w-9 border border-slate-200 hover:border-blue-400 transition-colors">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold uppercase text-xs">
                      {user?.username?.substring(0, 2) || "AD"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 shadow-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-slate-900 leading-none">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-slate-500 leading-none">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/admin/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/admin/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
