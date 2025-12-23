import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PinVerificationProps {
  userId: string;
  onVerified: () => void;
  onSetupComplete?: () => void;
}

export default function PinVerification({ userId, onVerified, onSetupComplete }: PinVerificationProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkPinExists();
  }, [userId]);

  const checkPinExists = async () => {
    try {
      const { data, error } = await supabase
        .from("ceo_security")
        .select("id, locked_until")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      
      // Check if locked
      if (data?.locked_until) {
        const lockedUntil = new Date(data.locked_until);
        if (lockedUntil > new Date()) {
          setIsLocked(true);
          setLockoutMinutes(Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60)));
        }
      }
      
      setIsSetupMode(!data);
    } catch (error) {
      console.error("Error checking PIN:", error);
      setIsSetupMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value.slice(-1);
    
    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }

    // Auto-focus next input
    if (value && index < 5) {
      const refs = isConfirm ? confirmInputRefs : inputRefs;
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    if (e.key === "Backspace" && index > 0) {
      const currentPin = isConfirm ? confirmPin : pin;
      if (!currentPin[index]) {
        const refs = isConfirm ? confirmInputRefs : inputRefs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handleSetupPin = async () => {
    const pinString = pin.join("");
    const confirmPinString = confirmPin.join("");

    if (pinString.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 6-digit PIN",
        variant: "destructive",
      });
      return;
    }

    if (pinString !== confirmPinString) {
      toast({
        title: "PINs don't match",
        description: "Please make sure both PINs are the same",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('ceo-pin', {
        body: { action: 'setup', pin: pinString }
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "PIN Created",
        description: "Your security PIN has been set up with bcrypt encryption",
      });
      
      onSetupComplete?.();
      onVerified();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set up PIN",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyPin = async () => {
    const pinString = pin.join("");

    if (pinString.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please enter your 6-digit PIN",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('ceo-pin', {
        body: { action: 'verify', pin: pinString }
      });

      // For non-2xx responses Supabase returns `error` and `data` is null.
      if (error) {
        const msg = (error as any)?.message as string | undefined;
        const match = msg?.match(/,\s*(\{[\s\S]*\})\s*$/);
        if (match) {
          try {
            const payload = JSON.parse(match[1]);
            if (payload?.needsSetup) {
              setIsSetupMode(true);
              setConfirmPin(["", "", "", "", "", ""]);
              setRemainingAttempts(null);
              toast({
                title: "PIN setup required",
                description: "No PIN is set yet. Please create a new 6-digit PIN to continue.",
              });
              return;
            }
            if (payload?.locked) {
              setIsLocked(true);
              setLockoutMinutes(payload.remainingMinutes || 30);
            } else if (payload?.remainingAttempts !== undefined) {
              setRemainingAttempts(payload.remainingAttempts);
            }
          } catch {
            // ignore parse errors
          }
        }
        throw error;
      }

      if (data?.error) {
        if (data.locked) {
          setIsLocked(true);
          setLockoutMinutes(data.remainingMinutes || 30);
        } else if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        throw new Error(data.error);
      }

      toast({
        title: "Verified",
        description: "Access granted to CEO Dashboard",
      });
      setRemainingAttempts(null);
      onVerified();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid PIN",
        variant: "destructive",
      });
      setPin(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-destructive rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Account Locked</h1>
              <p className="text-muted-foreground mb-4">
                Too many failed attempts. Try again in {lockoutMinutes} minutes.
              </p>
              <p className="text-xs text-muted-foreground">
                🔒 This lockout is for your security
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isSetupMode ? "Set Up Security PIN" : "CEO Dashboard Verification"}
            </h1>
            <p className="text-muted-foreground">
              {isSetupMode 
                ? "Create a 6-digit PIN to secure your CEO access"
                : "Enter your 6-digit security PIN to continue"
              }
            </p>
          </div>

          {remainingAttempts !== null && remainingAttempts < 5 && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-500">
                {remainingAttempts} attempts remaining before lockout
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {isSetupMode ? "Create PIN" : "Enter PIN"}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex gap-2 justify-center">
                {pin.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-background border-border"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {isSetupMode && (
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4" />
                  Confirm PIN
                </label>
                <div className="flex gap-2 justify-center">
                  {confirmPin.map((digit, index) => (
                    <Input
                      key={`confirm-${index}`}
                      ref={(el) => (confirmInputRefs.current[index] = el)}
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value, true)}
                      onKeyDown={(e) => handleKeyDown(index, e, true)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-background border-border"
                    />
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={isSetupMode ? handleSetupPin : handleVerifyPin}
              disabled={verifying}
              className="w-full h-12 text-lg font-semibold"
            >
              {verifying ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current"></div>
                  {isSetupMode ? "Setting up..." : "Verifying..."}
                </span>
              ) : (
                isSetupMode ? "Create PIN" : "Verify & Access"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              🔒 Your PIN is encrypted with bcrypt and stored securely
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
