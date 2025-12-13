import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
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
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
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

  const hashPin = async (pinString: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pinString + userId);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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
      const hashedPin = await hashPin(pinString);
      
      const { error } = await supabase
        .from("ceo_security")
        .upsert({
          user_id: userId,
          pin_hash: hashedPin,
          is_verified: true,
          last_verified_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "PIN Created",
        description: "Your security PIN has been set up successfully",
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
      const hashedPin = await hashPin(pinString);
      
      const { data, error } = await supabase
        .from("ceo_security")
        .select("pin_hash")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      if (data.pin_hash === hashedPin) {
        await supabase
          .from("ceo_security")
          .update({ 
            is_verified: true, 
            last_verified_at: new Date().toISOString() 
          })
          .eq("user_id", userId);

        toast({
          title: "Verified",
          description: "Access granted to CEO Dashboard",
        });
        onVerified();
      } else {
        toast({
          title: "Invalid PIN",
          description: "The PIN you entered is incorrect",
          variant: "destructive",
        });
        setPin(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Verification failed",
        variant: "destructive",
      });
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
              🔒 Your PIN is encrypted and stored securely
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
