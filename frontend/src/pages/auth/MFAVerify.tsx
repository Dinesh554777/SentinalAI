import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { mfaApi } from "@/services/api";
import { motion } from "framer-motion";

export function MFAVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tempToken = (location.state as { tempToken?: string })?.tempToken;

  if (!tempToken) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">No verification session found.</p>
        <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
          Back to Login
        </Button>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter a valid 6-digit code");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await mfaApi.verifyLogin(code, tempToken);
      localStorage.setItem("sentinel_token", data.access_token);
      localStorage.setItem("sentinel_role", data.role);
      localStorage.setItem("sentinel_user_id", String(data.user_id));
      localStorage.setItem("sentinel_user_name", data.name);
      toast.success(`Welcome back, ${data.name}!`);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error?.response?.data?.detail || "Invalid code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">Two-Factor Verification</h3>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="mfa-code" className="text-sm font-medium">
          Verification Code
        </Label>
        <Input
          id="mfa-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          autoFocus
          className="h-11 text-center text-xl tracking-[0.4em] font-mono bg-background/50 border-muted-foreground/20"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          type="submit"
          className="w-full h-11 font-semibold text-base bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25"
          disabled={isSubmitting || code.length !== 6}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Verify & Continue
            </div>
          )}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to login
        </button>
      </motion.div>
    </form>
  );
}
