import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldCheck, AlertTriangle, Smartphone, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logSecurityEvent, updateUserSecuritySettings } from "@/lib/security/sessionSecurity";

interface Mandatory2FASetupProps {
  userId: string;
  userEmail: string;
  isStaff: boolean;
  onComplete: () => void;
  onSkip?: () => void; // Only for non-staff users
}

export function Mandatory2FASetup({
  userId,
  userEmail,
  isStaff,
  onComplete,
  onSkip,
}: Mandatory2FASetupProps) {
  const [showSetup, setShowSetup] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    checkExisting2FA();
  }, [userId]);

  const checkExisting2FA = async () => {
    try {
      const { data } = await supabase
        .from('user_2fa')
        .select('is_enabled')
        .eq('user_id', userId)
        .single();

      if (data?.is_enabled) {
        setIs2FAEnabled(true);
        onComplete();
      }
    } catch {
      // No 2FA set up yet
    } finally {
      setIsChecking(false);
    }
  };

  const handleSetupComplete = async () => {
    try {
      await updateUserSecuritySettings(userId, {
        is_2fa_setup_complete: true,
        require_2fa: true
      });

      await logSecurityEvent('2fa_enabled', 'security', 'low', {
        method: 'totp'
      });

      setIs2FAEnabled(true);
      toast.success("Two-Factor Authentication enabled!", {
        description: "Your account is now protected with 2FA."
      });
      onComplete();
    } catch (error) {
      console.error('Failed to update security settings:', error);
    }
  };

  const handleSkip = async () => {
    if (isStaff) {
      toast.error("2FA is required for staff members", {
        description: "You must set up two-factor authentication to continue."
      });
      return;
    }

    await logSecurityEvent('2fa_setup_skipped', 'security', 'medium');
    onSkip?.();
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (is2FAEnabled) {
    return null;
  }

  return (
    <>
      <Dialog open={!showSetup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              {isStaff ? "Required: Set Up Two-Factor Authentication" : "Secure Your Account"}
            </DialogTitle>
            <DialogDescription>
              {isStaff
                ? "As a staff member, two-factor authentication is mandatory to protect company data."
                : "Add an extra layer of security to your account with two-factor authentication."}
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {isStaff && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Mandatory Security Requirement
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You cannot access the system without setting up 2FA.
                      This protects sensitive company information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Authenticator App</h4>
                  <p className="text-sm text-muted-foreground">
                    Use an app like Google Authenticator or Authy to generate secure codes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">Backup Codes</h4>
                  <p className="text-sm text-muted-foreground">
                    Get emergency backup codes in case you lose access to your device
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium">Enhanced Protection</h4>
                  <p className="text-sm text-muted-foreground">
                    Even if your password is compromised, attackers cannot access your account
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {!isStaff && onSkip && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                >
                  Skip for Now
                </Button>
              )}
              <Button
                className={!isStaff && onSkip ? "flex-1" : "w-full"}
                onClick={() => setShowSetup(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Set Up 2FA
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      <TwoFactorSetup
        open={showSetup}
        onOpenChange={setShowSetup}
        onSuccess={handleSetupComplete}
      />
    </>
  );
}
