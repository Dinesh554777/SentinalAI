import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function OTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

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
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = pasted.split('').concat(Array(6 - pasted.length).fill(''));
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < 6) {
      toast.error("Please enter full 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("sentinel_token", "mock_jwt_token_" + Date.now());
      toast.success("Identity verified.");
      navigate("/dashboard");
    }, 1200);
  };

  const filledCount = otp.filter(Boolean).length;

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to your registered device.
        </p>
      </motion.div>

      {/* OTP Inputs */}
      <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
        {otp.map((data, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <input
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={data}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onFocus={e => e.target.select()}
              className={`w-12 h-14 text-center text-lg font-bold rounded-xl border-2 bg-background/50 transition-all duration-200 outline-none ${
                data
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-muted-foreground/20 hover:border-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
            />
          </motion.div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-1.5">
        {Array(6).fill(0).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i < filledCount ? 'bg-primary w-6' : 'bg-muted w-4'
            }`}
          />
        ))}
      </div>

      {/* Timer & Resend */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Expires in: <strong className="text-foreground font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong>
        </span>
        <button
          type="button"
          disabled={timeLeft > 0}
          onClick={() => setTimeLeft(60)}
          className="text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline flex items-center gap-1 text-xs font-medium"
        >
          <RefreshCw className="w-3 h-3" />
          Resend Code
        </button>
      </div>

      {/* Verify Button */}
      <Button
        type="submit"
        className="w-full h-11 font-semibold relative overflow-hidden group bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Verifying...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Verify Identity
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      </Button>
    </form>
  );
}
