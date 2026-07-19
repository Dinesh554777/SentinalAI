import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, Copy, Check, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { mfaApi } from "@/services/api";
import { motion } from "framer-motion";

export function MFASetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"loading" | "qr" | "verify" | "done">("loading");
  const [secret, setSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await mfaApi.getStatus();
        setMfaEnabled(status.mfa_enabled);
        if (status.mfa_enabled) {
          setStep("done");
        } else {
          const setup = await mfaApi.setup();
          setSecret(setup.secret);
          setOtpauthUrl(setup.otpauth_url);
          setStep("qr");
        }
      } catch {
        toast.error("Failed to load MFA status");
        navigate("/profile");
      }
    };
    loadStatus();
  }, [navigate]);

  const handleEnable = async () => {
    if (code.length !== 6) {
      toast.error("Enter a valid 6-digit code");
      return;
    }
    setIsSubmitting(true);
    try {
      await mfaApi.enable(code);
      setMfaEnabled(true);
      setStep("done");
      toast.success("MFA enabled successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error?.response?.data?.detail || "Invalid code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async () => {
    if (code.length !== 6) {
      toast.error("Enter your current 6-digit code to disable MFA");
      return;
    }
    setIsSubmitting(true);
    try {
      await mfaApi.disable(code);
      setMfaEnabled(false);
      setStep("qr");
      setCode("");
      toast.success("MFA disabled. You can set it up again.");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error?.response?.data?.detail || "Failed to disable MFA.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/profile")} className="shrink-0 h-9 w-9 border-muted-foreground/15">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gradient">Multi-Factor Authentication</h2>
          <p className="text-muted-foreground text-sm">Secure your account with an authenticator app</p>
        </div>
      </div>

      {step === "loading" && (
        <Card className="backdrop-blur-md bg-background/60">
          <CardContent className="p-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      )}

      {step === "qr" && (
        <>
          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Step 1: Scan QR Code
              </CardTitle>
              <CardDescription>
                Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`}
                    alt="MFA QR Code"
                    className="w-[200px] h-[200px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Can't scan? Enter this secret manually:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-muted/50 p-2 rounded-lg break-all">{secret}</code>
                  <Button variant="outline" size="icon" className="shrink-0 h-8 w-8" onClick={copySecret}>
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-background/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Step 2: Verify Code
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code from your authenticator app to confirm setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp-code">Verification Code</Label>
                <Input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="h-11 text-center text-lg tracking-[0.3em] font-mono"
                />
              </div>
              <Button
                onClick={handleEnable}
                disabled={isSubmitting || code.length !== 6}
                className="w-full h-11 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Enable MFA"
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {step === "done" && mfaEnabled && (
        <Card className="backdrop-blur-md bg-background/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              MFA is Enabled
            </CardTitle>
            <CardDescription>
              Your account is protected with multi-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
              <ShieldCheck className="w-4 h-4" />
              MFA is active on your account. You'll need your authenticator app to log in.
            </div>
            <div className="space-y-2">
              <Label htmlFor="disable-code">To disable, enter your current 6-digit code:</Label>
              <Input
                id="disable-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="h-11 text-center text-lg tracking-[0.3em] font-mono"
              />
            </div>
            <Button
              onClick={handleDisable}
              disabled={isSubmitting || code.length !== 6}
              variant="destructive"
              className="w-full h-11"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Disabling...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Disable MFA
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={() => navigate("/profile")} className="w-full border-muted-foreground/15">
        Back to Profile
      </Button>
    </motion.div>
  );
}
