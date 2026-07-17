import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/services/api";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem("sentinel_token", data.access_token);
      localStorage.setItem("sentinel_role", data.role);
      localStorage.setItem("sentinel_user_id", String(data.user_id));
      localStorage.setItem("sentinel_user_name", data.name);
      toast.success(`Welcome back, ${data.name}! Logged in as ${data.role}`);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string }; status?: number } };
      if (error?.response?.status === 423) {
        toast.error("Account is locked. Please try again later.");
      } else {
        toast.error(error?.response?.data?.detail || "Invalid username or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@bank.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background/50"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="remember" />
        <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Remember me for 30 days
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Authenticating...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Login to Sentinel
          </div>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Default: <span className="font-mono">admin@bank.com</span> / <span className="font-mono">admin123</span>
      </p>
    </form>
  );
}
