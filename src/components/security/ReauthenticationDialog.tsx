import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, EyeOff, Fingerprint } from "lucide-react";
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
import { logSecurityEvent } from "@/lib/security/sessionSecurity";

interface ReauthenticationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionDescription: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ReauthenticationDialog({
  open,
  onOpenChange,
  actionDescription,
  onSuccess,
  onCancel,
}: ReauthenticationDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleReauthenticate = async () => {
    if (attempts >= 3) {
      toast.error("Too many failed attempts", {
        description: "Please try again later or reset your password."
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user session");

      // Try to re-authenticate by signing in again
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (error) {
        setAttempts(prev => prev + 1);
        await logSecurityEvent('reauth_failed', 'authentication', 'medium', {
          action: actionDescription,
          attempts: attempts + 1
        });
        throw error;
      }

      await logSecurityEvent('reauth_success', 'authentication', 'low', {
        action: actionDescription
      });

      toast.success("Identity verified");
      setPassword("");
      setAttempts(0);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Authentication failed", {
        description: error.message || "Invalid password. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword("");
    onCancel?.();
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && password.length >= 6) {
      handleReauthenticate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Verify Your Identity
          </DialogTitle>
          <DialogDescription>
            For security, please re-enter your password to continue.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-3">
              <Fingerprint className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Sensitive Action</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {actionDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reauth-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="reauth-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {attempts > 0 && (
            <p className="text-sm text-destructive">
              {3 - attempts} attempts remaining
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleReauthenticate}
              disabled={isLoading || password.length < 6 || attempts >= 3}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
