import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function OTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length < 6) {
      toast.error("Please enter full 6-digit OTP");
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("sentinel_token", "mock_jwt_token_" + Date.now());
      toast.success("Identity verified.");
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to your registered device.
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {otp.map((data, index) => (
          <Input
            className="w-12 h-14 text-center text-lg font-bold bg-background/50"
            type="text"
            name="otp"
            maxLength={1}
            key={index}
            value={data}
            onChange={e => handleChange(e.target, index)}
            onFocus={e => e.target.select()}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Code expires in: <strong className="text-foreground">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong>
        </span>
        <button 
          type="button" 
          disabled={timeLeft > 0} 
          onClick={() => setTimeLeft(60)}
          className="text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
        >
          Resend Code
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Verifying...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Verify Identity
          </div>
        )}
      </Button>
    </form>
  );
}
