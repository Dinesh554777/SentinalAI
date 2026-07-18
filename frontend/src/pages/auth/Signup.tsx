import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, User, Briefcase, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/services/api";
import { motion } from "framer-motion";

const ROLES = [
  { value: "Standard", label: "Standard User", desc: "Basic access to system resources" },
  { value: "DBA", label: "DBA", desc: "Database administrator access" },
  { value: "Admin", label: "Admin", desc: "Full administrative access" },
] as const;

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Standard");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.signup(name, email, password, role);
      toast.success(data.message);
      navigate("/otp", {
        state: {
          email: data.email,
          purpose: "signup",
          name,
          password,
          role,
          expires_in: data.expires_in,
          otp_dev_hint: data.otp_dev_hint,
        },
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error?.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-2"
      >
        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          Full Name
        </Label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            className={`h-11 bg-background/50 border-muted-foreground/20 transition-all duration-300 ${
              focusedField === "name"
                ? "border-primary/50 input-glow"
                : "hover:border-muted-foreground/40"
            }`}
          />
          {focusedField === "name" && (
            <motion.div
              layoutId="focus-indicator-name"
              className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
          Email Address
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="john@bank.com"
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            placeholder="Min. 6 characters"
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocusedField("confirm")}
            onBlur={() => setFocusedField(null)}
            className={`h-11 bg-background/50 border-muted-foreground/20 transition-all duration-300 ${
              focusedField === "confirm"
                ? "border-primary/50 input-glow"
                : "hover:border-muted-foreground/40"
            } ${confirmPassword && password !== confirmPassword ? "border-destructive/50" : ""} ${
              confirmPassword && password === confirmPassword ? "border-green-500/50" : ""
            }`}
          />
          {focusedField === "confirm" && (
            <motion.div
              layoutId="focus-indicator-confirm"
              className="absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blue-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
        {confirmPassword && password === confirmPassword && (
          <p className="text-xs text-green-500">Passwords match</p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-2"
      >
        <Label className="text-sm font-medium flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
          Role
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`relative p-2.5 rounded-xl border-2 text-center transition-all duration-200 ${
                role === r.value
                  ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                  : "border-muted-foreground/15 hover:border-muted-foreground/30 bg-background/50"
              }`}
            >
              {role === r.value && (
                <motion.div
                  layoutId="role-indicator"
                  className="absolute inset-0 rounded-xl border-2 border-primary bg-primary/5"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className={`relative text-xs font-semibold block ${role === r.value ? "text-primary" : "text-foreground"}`}>
                {r.label}
              </span>
              <span className="relative text-[10px] text-muted-foreground mt-0.5 block leading-tight">
                {r.desc}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          type="submit"
          className="w-full h-11 font-semibold text-base relative overflow-hidden group bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Creating account...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Create Account
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="text-center pt-1"
      >
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </form>
  );
}
