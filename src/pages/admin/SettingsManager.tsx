import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, AlertTriangle, Construction, Shield, Key, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSiteSettings, useUpdateSiteSettings } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useAuth } from "@/hooks/useAuth";
import ChangePinDialog from "@/components/admin/ChangePinDialog";
import { SecurityLogsViewer } from "@/components/admin/SecurityLogsViewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SettingsManager() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { toast } = useToast();
  const auditLog = useAuditLog();
  const { user, isSuperAdmin } = useAuth();
  
  const [maintenanceMode, setMaintenanceMode] = useState({
    enabled: false,
    message: "We are currently updating our systems. Please check back soon."
  });
  
  const [showChangePin, setShowChangePin] = useState(false);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);

  useEffect(() => {
    if (settings?.maintenance_mode) {
      setMaintenanceMode(settings.maintenance_mode);
    }
  }, [settings]);

  const handleSaveMaintenanceMode = async () => {
    const oldEnabled = settings?.maintenance_mode?.enabled;
    try {
      await updateSettings.mutateAsync({
        key: "maintenance_mode",
        value: maintenanceMode
      });
      await auditLog.logMaintenanceModeToggled(maintenanceMode.enabled);
      if (oldEnabled !== maintenanceMode.enabled) {
        await auditLog.logSettingsChanged("maintenance_mode", oldEnabled, maintenanceMode.enabled);
      }
      toast({ title: "Settings saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your site settings</p>
      </div>

      {/* Security Settings - Only for Super Admin */}
      {isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Shield className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-semibold mb-1">Security Settings</h2>
              <p className="text-sm text-muted-foreground">
                Manage your security PIN and view security logs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowChangePin(true)}
              className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
            >
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Key className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Change PIN</p>
                <p className="text-sm text-muted-foreground">Update your security PIN</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSecurityLogs(true)}
              className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <div className="p-3 rounded-xl bg-red-500/20">
                <ShieldCheck className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Security Logs</p>
                <p className="text-sm text-muted-foreground">View security activity</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Maintenance Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isSuperAdmin ? 0.1 : 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-xl ${maintenanceMode.enabled ? 'bg-destructive/20' : 'bg-muted'}`}>
            <Construction className={`w-6 h-6 ${maintenanceMode.enabled ? 'text-destructive' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold mb-1">Maintenance Mode</h2>
            <p className="text-sm text-muted-foreground">
              When enabled, visitors will see a "Coming Soon" page instead of your site.
            </p>
          </div>
        </div>

        {maintenanceMode.enabled && (
          <div className="flex items-center gap-3 p-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> Your site is currently in maintenance mode. 
              Visitors cannot access the main content.
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
              <Label className="text-base">Enable Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Redirect all visitors to a coming soon page
              </p>
            </div>
            <Switch
              checked={maintenanceMode.enabled}
              onCheckedChange={(enabled) => setMaintenanceMode({ ...maintenanceMode, enabled })}
            />
          </div>

          <div className="space-y-2">
            <Label>Maintenance Message</Label>
            <Textarea
              value={maintenanceMode.message}
              onChange={(e) => setMaintenanceMode({ ...maintenanceMode, message: e.target.value })}
              rows={3}
              placeholder="Message to display to visitors..."
            />
          </div>

          <Button variant="hero" onClick={handleSaveMaintenanceMode}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </motion.div>

      {/* Additional Settings Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isSuperAdmin ? 0.2 : 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="font-display text-xl font-semibold mb-4">Payment Settings</h2>
        <p className="text-muted-foreground mb-4">
          Configure your payment gateway integration.
        </p>
        <div className="p-4 bg-muted/30 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            Payment integration (Razorpay/Stripe) can be configured in the environment settings.
          </p>
        </div>
      </motion.div>

      {/* Change PIN Dialog */}
      {user && (
        <ChangePinDialog 
          userId={user.id} 
          open={showChangePin} 
          onOpenChange={setShowChangePin} 
        />
      )}

      {/* Security Logs Dialog */}
      <Dialog open={showSecurityLogs} onOpenChange={setShowSecurityLogs}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              Security Logs
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(85vh-100px)]">
            <SecurityLogsViewer />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
