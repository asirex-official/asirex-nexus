import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Smartphone, Key, Copy, Check, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TwoFactorSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TwoFactorSetup({ open, onOpenChange, onSuccess }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"intro" | "setup" | "verify">("intro");
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("setup-2fa", {
        body: { action: "generate" },
      });

      if (error) throw error;

      setSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setBackupCodes(data.backupCodes);
      setStep("setup");
    } catch (error) {
      console.error("2FA setup error:", error);
      toast.error("Failed to initialize 2FA setup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("setup-2fa", {
        body: { action: "verify", code: verificationCode, secret },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("2FA enabled successfully!", {
          description: "Your account is now protected with two-factor authentication",
        });
        onSuccess();
        onOpenChange(false);
        resetState();
      } else {
        toast.error("Invalid verification code", {
          description: "Please check the code and try again",
        });
      }
    } catch (error) {
      console.error("2FA verification error:", error);
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: "secret" | "backup") => {
    navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
    toast.success("Copied to clipboard");
  };

  const resetState = () => {
    setStep("intro");
    setSecret("");
    setQrCodeUrl("");
    setBackupCodes([]);
    setVerificationCode("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) resetState(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        {step === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Smartphone className="w-8 h-8 text-primary mt-1" />
                <div>
                  <h4 className="font-medium mb-1">How it works</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll use an authenticator app (like Google Authenticator, Authy, or 1Password) 
                    to generate a unique code every 30 seconds. This code will be required along with 
                    your password when logging in.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">You'll need:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  An authenticator app on your phone
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Access to scan a QR code
                </li>
              </ul>
            </div>

            <Button onClick={handleStartSetup} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Begin Setup
                </>
              )}
            </Button>
          </motion.div>
        )}

        {step === "setup" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Scan this QR code with your authenticator app
              </p>
              {qrCodeUrl ? (
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-lg inline-flex items-center justify-center w-48 h-48 mx-auto">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Or enter this secret manually:
              </Label>
              <div className="flex gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                  {secret}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(secret, "secret")}
                >
                  {copiedSecret ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Label className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                ⚠️ Save these backup codes:
              </Label>
              <div className="grid grid-cols-2 gap-1">
                {backupCodes.map((code, i) => (
                  <code key={i} className="text-xs font-mono bg-background p-1 rounded">
                    {code}
                  </code>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => copyToClipboard(backupCodes.join("\n"), "backup")}
              >
                {copiedBackup ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy Backup Codes
              </Button>
            </div>

            <Button onClick={() => setStep("verify")} className="w-full">
              I've saved my backup codes
            </Button>
          </motion.div>
        )}

        {step === "verify" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app to verify setup
            </p>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("setup")} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleVerify} 
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
