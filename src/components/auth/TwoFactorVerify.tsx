import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, Key } from "lucide-react";
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

interface TwoFactorVerifyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorVerify({ 
  open, 
  onOpenChange, 
  userEmail, 
  onSuccess, 
  onCancel 
}: TwoFactorVerifyProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleVerify = async () => {
    if (code.length < 6) {
      toast.error("Please enter a valid code");
      return;
    }

    if (attempts >= 5) {
      toast.error("Too many failed attempts", {
        description: "Please wait 15 minutes before trying again",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-2fa", {
        body: { 
          email: userEmail, 
          code: code.trim(),
          isBackupCode: useBackupCode 
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Verification successful");
        setCode("");
        setAttempts(0);
        onSuccess();
      } else {
        setAttempts(prev => prev + 1);
        toast.error("Invalid code", {
          description: `${5 - attempts - 1} attempts remaining`,
        });
      }
    } catch (error) {
      console.error("2FA verification error:", error);
      setAttempts(prev => prev + 1);
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length >= 6) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Enter the code from your authenticator app
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="2fa-code">
              {useBackupCode ? "Backup Code" : "Verification Code"}
            </Label>
            <Input
              id="2fa-code"
              type="text"
              inputMode={useBackupCode ? "text" : "numeric"}
              pattern={useBackupCode ? undefined : "[0-9]*"}
              maxLength={useBackupCode ? 10 : 6}
              placeholder={useBackupCode ? "XXXX-XXXX" : "000000"}
              value={code}
              onChange={(e) => setCode(useBackupCode ? e.target.value : e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
          </div>

          {attempts > 0 && (
            <p className="text-xs text-destructive text-center">
              {5 - attempts} attempts remaining
            </p>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerify} 
              disabled={isLoading || code.length < 6}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {useBackupCode ? (
                <>
                  <Key className="w-3 h-3 inline mr-1" />
                  Use authenticator code instead
                </>
              ) : (
                "Lost your device? Use a backup code"
              )}
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
