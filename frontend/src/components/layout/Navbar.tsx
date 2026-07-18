import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  ShieldAlert,
  LogOut,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { authApi } from "@/services/api";
import { toast } from "sonner";
import { useRecentAlerts } from "@/hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("sentinel_user_name") || "User";
  const userRole = localStorage.getItem("sentinel_role") || "Standard";
  const { data: alerts } = useRecentAlerts();

  const activeAlerts = alerts?.filter(a => a.status === 'Open') || [];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    const title = path.split('/')[0].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return title;
  };

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

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card/50 backdrop-blur-xl px-4 lg:px-6 sticky top-0 z-10">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64 glass-strong">
          <div className="flex h-14 items-center border-b px-4">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-6 w-6 text-primary" />
              <span className="text-lg">SentinelAI</span>
            </Link>
          </div>
          <div className="p-4 flex-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
              Navigation
            </div>
            <div className="grid gap-1">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/live-monitoring', label: 'Live Monitoring' },
                { href: '/risk-analysis', label: 'Risk Analysis' },
                { href: '/alerts', label: 'Alerts' },
                { href: '/users', label: 'Users' },
                { href: '/reports', label: 'Reports' },
              ].map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    location.pathname.startsWith(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Page title */}
      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-lg font-semibold hidden md:block">{getPageTitle()}</h1>

        {/* Search bar */}
        <div className="ml-auto md:ml-0 md:w-1/3 lg:w-1/3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search assets, users, IP addresses..."
              className="w-full h-9 bg-muted/30 border-muted-foreground/10 pl-9 pr-4 rounded-full text-sm focus:bg-background focus:border-primary/30 focus:ring-0 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-full hover:bg-muted/50 transition-all duration-200"
        >
          <motion.div
            key={theme}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.div>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full hover:bg-muted/50 transition-all duration-200"
            >
              <Bell className="h-4 w-4" />
              {activeAlerts.length > 0 && (
                <span className="notification-dot" />
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 glass-strong">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="text-xs">{activeAlerts.length} active</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <AnimatePresence>
                {activeAlerts.length > 0 ? (
                  activeAlerts.slice(0, 5).map((alert) => (
                    <DropdownMenuItem key={alert.id} className="flex items-start gap-3 p-3 cursor-pointer">
                      <div className={`p-1.5 rounded-lg ${alert.severity === 'High' ? 'bg-destructive/10' : 'bg-yellow-500/10'}`}>
                        {alert.severity === 'High' ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{alert.ruleTriggered}</p>
                        <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">All clear!</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
            {activeAlerts.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-center justify-center cursor-pointer">
                  <Link to="/alerts">View all alerts</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-muted/50 transition-all duration-200 p-0">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-strong">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
