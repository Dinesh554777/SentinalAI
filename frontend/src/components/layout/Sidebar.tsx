import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  BellRing,
  Users,
  UserCircle,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/services/api";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Activity, label: "Live Monitoring", href: "/live-monitoring" },
  { icon: ShieldAlert, label: "Risk Analysis", href: "/risk-analysis" },
  { icon: BellRing, label: "Alerts", href: "/alerts" },
  { icon: Users, label: "Users", href: "/users" },
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

  const renderLink = (item: any) => {
    const isActive = location.pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex h-screen sticky top-0">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <span className="text-lg text-foreground">SentinelAI</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          {navItems.map(renderLink)}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <nav className="grid items-start gap-1 text-sm font-medium">
          {bottomItems.map(renderLink)}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 cursor-pointer w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}
