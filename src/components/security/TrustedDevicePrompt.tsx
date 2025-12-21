import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Shield, AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getDeviceName } from "@/lib/security/deviceFingerprint";

interface TrustedDevicePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  deviceFingerprint: string;
  onTrust: () => void;
  onDeny: () => void;
}

export function TrustedDevicePrompt({
  open,
  onOpenChange,
  userId,
  deviceFingerprint,
  onTrust,
  onDeny,
}: TrustedDevicePromptProps) {
  const [deviceName, setDeviceName] = useState(getDeviceName());
  const [trustDuration, setTrustDuration] = useState<"30" | "90" | "forever">("30");
  const [isLoading, setIsLoading] = useState(false);

  const handleTrustDevice = async () => {
    setIsLoading(true);
    try {
      const expiresAt = trustDuration === "forever" 
        ? null 
        : new Date(Date.now() + parseInt(trustDuration) * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from('trusted_devices')
        .upsert({
          user_id: userId,
          device_fingerprint: deviceFingerprint,
          device_name: deviceName,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          },
          is_trusted: true,
          trust_expires_at: expiresAt?.toISOString() || null,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_fingerprint'
        });

      if (error) throw error;

      toast.success("Device trusted", {
        description: `This device has been added to your trusted devices${trustDuration !== "forever" ? ` for ${trustDuration} days` : ""}.`
      });
      
      onTrust();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to trust device", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDenyDevice = () => {
    onDeny();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            New Device Detected
          </DialogTitle>
          <DialogDescription>
            We noticed you're logging in from a new device. Would you like to trust this device?
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Security Notice
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Trusting a device means you won't need additional verification when logging in from it.
                  Only trust devices you own and control.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Device Name</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="My Device"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trust Duration</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
                { value: "forever", label: "Forever" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTrustDuration(option.value as typeof trustDuration)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    trustDuration === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDenyDevice}
            >
              <X className="w-4 h-4 mr-2" />
              Don't Trust
            </Button>
            <Button
              className="flex-1"
              onClick={handleTrustDevice}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Trust Device
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
