import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  ShieldAlert,
  LogOut,
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
import { useEffect, useState } from "react";
import { authApi } from "@/services/api";
import { toast } from "sonner";

export function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("sentinel_user_name") || "User";
  const userRole = localStorage.getItem("sentinel_role") || "Standard";

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
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64">
          <div className="flex h-14 items-center border-b px-4">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-6 w-6 text-primary" />
              <span className="text-lg">SentinelAI</span>
            </Link>
          </div>
          <div className="p-4 flex-1">
             <div className="text-sm font-medium mb-2 text-muted-foreground">Navigation</div>
               <div className="grid gap-2">
                 <Link to="/dashboard" className="flex items-center gap-2 py-2"><span className="w-full">Dashboard</span></Link>
                 <Link to="/live-monitoring" className="flex items-center gap-2 py-2"><span className="w-full">Live Monitoring</span></Link>
                 <Link to="/risk-analysis" className="flex items-center gap-2 py-2"><span className="w-full">Risk Analysis</span></Link>
                 <Link to="/alerts" className="flex items-center gap-2 py-2"><span className="w-full">Alerts</span></Link>
                 <Link to="/users" className="flex items-center gap-2 py-2"><span className="w-full">Users</span></Link>
                 <Link to="/reports" className="flex items-center gap-2 py-2"><span className="w-full">Reports</span></Link>
               </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex items-center">
        <h1 className="text-lg font-semibold md:hidden lg:block hidden mr-6">
          {getPageTitle()}
        </h1>
        <form className="ml-auto md:ml-0 md:w-1/3 lg:w-1/3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assets, users, IP addresses..."
              className="w-full appearance-none bg-background pl-8 shadow-none rounded-full"
            />
          </div>
        </form>
      </div>

      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
        </span>
        <span className="sr-only">Toggle notifications</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
