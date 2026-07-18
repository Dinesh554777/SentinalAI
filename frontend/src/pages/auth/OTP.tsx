import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, RefreshCw, ArrowLeft, CheckCircle2, Mail, Copy, Check, Bell } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { authApi } from "@/services/api";

interface OTPState {
  email?: string;
  purpose?: "signup" | "login" | "reset";
  name?: string;
  password?: string;
  role?: string;
  expires_in?: number;
  otp_dev_hint?: string;
}

export function OTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as OTPState;

  const email = state.email || "";
  const purpose = state.purpose || "signup";
  const name = state.name || "";
  const password = state.password || "";
  const role = state.role || "Standard";
  const otpDevHint = state.otp_dev_hint || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(state.expires_in || 120);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split("").concat(Array(6 - pasted.length).fill(""));
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otpDevHint);
    setCopied(true);
    toast.success("OTP copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoFill = () => {
    const digits = otpDevHint.split("");
    setOtp([...digits, ...Array(6 - digits.length).fill("")]);
    inputRefs.current[Math.min(digits.length, 5)]?.focus();
    toast.success("OTP auto-filled");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const data = await authApi.verifyOtp(email, otpString, purpose);
      setVerified(true);

      if (purpose === "signup" && data.verified) {
        toast.success("OTP verified! Creating your account...");
        try {
          const signupData = await authApi.completeSignup(name, email, password, role);
          localStorage.setItem("sentinel_token", signupData.access_token);
          localStorage.setItem("sentinel_role", signupData.role);
          localStorage.setItem("sentinel_user_id", String(signupData.user_id));
          localStorage.setItem("sentinel_user_name", signupData.name);
          toast.success(`Welcome, ${signupData.name}! Account created successfully.`);
          navigate("/dashboard");
        } catch (err: unknown) {
          const error = err as { response?: { data?: { detail?: string } } };
          toast.error(error?.response?.data?.detail || "Failed to create account");
          navigate("/signup");
        }
      } else if (purpose === "login" && data.access_token) {
        localStorage.setItem("sentinel_token", data.access_token);
        localStorage.setItem("sentinel_role", data.role);
        localStorage.setItem("sentinel_user_id", String(data.user_id));
        localStorage.setItem("sentinel_user_name", data.name);
        toast.success(`Welcome back, ${data.name}!`);
        navigate("/dashboard");
      } else {
        toast.success("OTP verified successfully");
        navigate("/login");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error?.response?.data?.detail || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const data = await authApi.sendOtp(email, purpose);
      setTimeLeft(data.expires_in || 120);
      toast.success(`New OTP sent to ${email}`);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error?.response?.data?.detail || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const filledCount = otp.filter(Boolean).length;
  const isExpired = timeLeft <= 0;

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-glow-pulse" />
          <div className="relative p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl ring-1 ring-green-500/20">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-green-500">Verified!</h2>
          <p className="text-sm text-muted-foreground">Setting up your account...</p>
        </div>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <h2 className="text-xl font-semibold mb-1">Verify Your Email</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to
        </p>
        <p className="text-sm font-medium text-foreground mt-0.5">{email}</p>
      </motion.div>

      {otpDevHint && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-sm"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-blue-500/5 shadow-lg shadow-primary/5">
            {/* Top accent bar */}
            <div className="h-0.5 bg-gradient-to-r from-primary via-blue-500 to-primary" />

            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
                  <div className="relative p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl ring-1 ring-primary/15">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">OTP Sent Successfully</p>
                  <p className="text-[11px] text-muted-foreground truncate">{email}</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-green-600 dark:text-green-400">Delivered</span>
                </div>
              </div>

              {/* OTP Display */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {otpDevHint.split("").map((digit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05, type: "spring", stiffness: 300 }}
                      className="w-9 h-11 flex items-center justify-center rounded-lg bg-background/80 border border-muted-foreground/15 shadow-sm"
                    >
                      <span className="text-base font-bold font-mono text-primary tracking-wider">{digit}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/15 text-[10px] font-semibold text-primary transition-all duration-200 hover:shadow-sm hover:shadow-primary/10"
                  >
                    <Mail className="w-3 h-3" />
                    Auto-fill
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-muted border border-muted-foreground/10 text-[10px] font-medium text-muted-foreground transition-all duration-200"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-muted-foreground/5">
                <p className="text-[10px] text-muted-foreground">
                  Code expires in <span className="font-mono font-semibold text-foreground">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
                </p>
                <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                  Dev Mode
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
        {otp.map((data, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <input
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              disabled={isExpired}
              className={`w-12 h-14 text-center text-lg font-bold rounded-xl border-2 bg-background/50 transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                data
                  ? "border-primary/50 bg-primary/5"
                  : "border-muted-foreground/20 hover:border-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
              }`}
            />
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-1.5">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i < filledCount ? "bg-primary w-6" : "bg-muted w-4"
              }`}
            />
          ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {isExpired ? (
            <span className="text-destructive font-medium">Expired</span>
          ) : (
            <>
              Expires in:{" "}
              <strong className="text-foreground font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </strong>
            </>
          )}
        </span>
        <button
          type="button"
          disabled={!isExpired && timeLeft > 0}
          onClick={handleResend}
          className="text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline flex items-center gap-1 text-xs font-medium"
        >
          {isResending ? (
            <div className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Resend Code
        </button>
      </div>

      <Button
        type="submit"
        className="w-full h-11 font-semibold relative overflow-hidden group bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40"
        disabled={isLoading || isExpired}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Verifying...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            {purpose === "signup" ? "Verify & Create Account" : "Verify Identity"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate(purpose === "signup" ? "/signup" : "/login")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          {purpose === "signup" ? "Back to Sign Up" : "Back to Login"}
        </button>
      </div>
    </form>
  );
}
