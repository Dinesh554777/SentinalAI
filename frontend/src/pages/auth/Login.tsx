import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/services/api";
import { motion } from "framer-motion";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            Email Address
          </Label>
          <div className="relative group">
            <Input
              id="email"
              type="email"
              placeholder="admin@bank.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className={`h-11 bg-background/50 border-muted-foreground/20 transition-all duration-300 ${
                focusedField === "email"
                  ? "border-primary/50 input-glow"
                  : "hover:border-muted-foreground/40"
              }`}
            />
            {focusedField === "email" && (
              <motion.div
                layoutId="focus-indicator-email"
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              Password
            </Label>
            <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="relative group">
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className={`h-11 bg-background/50 border-muted-foreground/20 transition-all duration-300 ${
                focusedField === "password"
                  ? "border-primary/50 input-glow"
                  : "hover:border-muted-foreground/40"
              }`}
            />
            {focusedField === "password" && (
              <motion.div
                layoutId="focus-indicator-password"
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center space-x-2"
      >
        <Checkbox id="remember" className="border-muted-foreground/30" />
        <Label htmlFor="remember" className="text-sm text-muted-foreground leading-none cursor-pointer select-none">
          Remember me for 30 days
        </Label>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          type="submit"
          className="w-full h-11 font-semibold text-base relative overflow-hidden group bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Authenticating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login to Sentinel
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center space-y-3"
      >
        <p className="text-xs text-muted-foreground">
          Default credentials:{" "}
          <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-primary">admin@bank.com</code>
          {" / "}
          <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-primary">admin123</code>
        </p>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </form>
  );
}
