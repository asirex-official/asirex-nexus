import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChangePinDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePinDialog({ userId, open, onOpenChange }: ChangePinDialogProps) {
  const [currentPin, setCurrentPin] = useState(["", "", "", "", "", ""]);
  const [newPin, setNewPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"current" | "new" | "confirm">("current");
  const [showPin, setShowPin] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const currentInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { toast } = useToast();

  const resetForm = () => {
    setCurrentPin(["", "", "", "", "", ""]);
    setNewPin(["", "", "", "", "", ""]);
    setConfirmPin(["", "", "", "", "", ""]);
    setStep("current");
    setShowPin(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handlePinChange = (
    index: number, 
    value: string, 
    pinState: string[], 
    setPinState: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newPinState = [...pinState];
    newPinState[index] = value.slice(-1);
    setPinState(newPinState);

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number, 
    e: React.KeyboardEvent, 
    pinState: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && index > 0 && !pinState[index]) {
      refs.current[index - 1]?.focus();
    }
  };

  const hashPin = async (pinString: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pinString + userId);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const verifyCurrentPin = async () => {
    const pinString = currentPin.join("");
    if (pinString.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please enter your current 6-digit PIN",
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
        setStep("new");
        setTimeout(() => newInputRefs.current[0]?.focus(), 100);
      } else {
        toast({
          title: "Incorrect PIN",
          description: "The current PIN you entered is incorrect",
          variant: "destructive",
        });
        setCurrentPin(["", "", "", "", "", ""]);
        currentInputRefs.current[0]?.focus();
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

  const handleNewPinSubmit = () => {
    const pinString = newPin.join("");
    if (pinString.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 6-digit PIN",
        variant: "destructive",
      });
      return;
    }
    setStep("confirm");
    setTimeout(() => confirmInputRefs.current[0]?.focus(), 100);
  };

  const handleConfirmAndSave = async () => {
    const newPinString = newPin.join("");
    const confirmPinString = confirmPin.join("");

    if (confirmPinString.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please confirm your new 6-digit PIN",
        variant: "destructive",
      });
      return;
    }

    if (newPinString !== confirmPinString) {
      toast({
        title: "PINs don't match",
        description: "New PIN and confirmation don't match",
        variant: "destructive",
      });
      setConfirmPin(["", "", "", "", "", ""]);
      confirmInputRefs.current[0]?.focus();
      return;
    }

    setVerifying(true);
    try {
      const hashedPin = await hashPin(newPinString);
      
      const { error } = await supabase
        .from("ceo_security")
        .update({
          pin_hash: hashedPin,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "PIN Updated",
        description: "Your security PIN has been changed successfully",
      });
      
      handleClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update PIN",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const renderPinInputs = (
    pinState: string[],
    setPinState: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    autoFocus: boolean = false
  ) => (
    <div className="flex gap-2 justify-center">
      {pinState.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (refs.current[index] = el)}
          type={showPin ? "text" : "password"}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handlePinChange(index, e.target.value, pinState, setPinState, refs)}
          onKeyDown={(e) => handleKeyDown(index, e, pinState, refs)}
          className="w-11 h-12 text-center text-xl font-bold bg-background border-border"
          autoFocus={autoFocus && index === 0}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Change Security PIN
          </DialogTitle>
          <DialogDescription>
            {step === "current" && "Enter your current PIN to continue"}
            {step === "new" && "Enter your new 6-digit PIN"}
            {step === "confirm" && "Confirm your new PIN"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step indicators */}
          <div className="flex justify-center gap-2">
            {["current", "new", "confirm"].map((s, i) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step === s 
                    ? "bg-primary" 
                    : ["current", "new", "confirm"].indexOf(step) > i 
                      ? "bg-primary/50" 
                      : "bg-muted"
                }`}
              />
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {step === "current" && "Current PIN"}
                {step === "new" && "New PIN"}
                {step === "confirm" && "Confirm New PIN"}
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

            {step === "current" && renderPinInputs(currentPin, setCurrentPin, currentInputRefs, true)}
            {step === "new" && renderPinInputs(newPin, setNewPin, newInputRefs, true)}
            {step === "confirm" && renderPinInputs(confirmPin, setConfirmPin, confirmInputRefs, true)}
          </motion.div>

          <div className="flex gap-3">
            {step !== "current" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === "confirm") setStep("new");
                  else if (step === "new") setStep("current");
                }}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => {
                if (step === "current") verifyCurrentPin();
                else if (step === "new") handleNewPinSubmit();
                else handleConfirmAndSave();
              }}
              disabled={verifying}
              className="flex-1"
            >
              {verifying ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                  Processing...
                </span>
              ) : (
                step === "confirm" ? "Save New PIN" : "Continue"
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            🔒 Your PIN is encrypted and stored securely
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
