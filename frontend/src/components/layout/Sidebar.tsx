import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  BellRing,
  Users,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/services/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Activity, label: "Live Monitoring", href: "/live-monitoring" },
  { icon: ShieldAlert, label: "Risk Analysis", href: "/risk-analysis" },
  { icon: BellRing, label: "Alerts", href: "/alerts", badge: true },
  { icon: Users, label: "Users", href: "/users" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
];

const bottomItems = [
  { icon: UserCircle, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout even if API call fails
    }
    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_role");
    localStorage.removeItem("sentinel_user_id");
    localStorage.removeItem("sentinel_user_name");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex w-[260px] flex-col border-r bg-card/50 backdrop-blur-xl h-screen sticky top-0">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-5">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md group-hover:bg-primary/30 transition-colors" />
            <div className="relative p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl ring-1 ring-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-gradient">SentinelAI</span>
            <span className="text-[10px] text-muted-foreground -mt-1 font-medium tracking-wider uppercase">Security Platform</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
            Operations
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "sidebar-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "active bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-colors", isActive && "text-primary")} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="notification-dot" />
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-3 border-t">
        <nav className="space-y-1">
          {bottomItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "sidebar-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "active bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="sidebar-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive/80 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive cursor-pointer w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}
