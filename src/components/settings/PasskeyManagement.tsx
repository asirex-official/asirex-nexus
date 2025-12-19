import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Usb, Fingerprint, Trash2, Plus, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Passkey {
  id: string;
  credential_id: string;
  device_name: string;
  created_at: string;
  last_used_at: string | null;
}

type AuthenticatorType = 'usb' | 'biometric';

const PasskeyManagement = () => {
  const { user } = useAuth();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerType, setRegisterType] = useState<AuthenticatorType>('usb');

  useEffect(() => {
    if (user) {
      fetchPasskeys();
    }
  }, [user]);

  const fetchPasskeys = async () => {
    try {
      const { data, error } = await supabase
        .from('user_passkeys')
        .select('id, credential_id, device_name, created_at, last_used_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPasskeys(data || []);
    } catch (error) {
      console.error('Error fetching passkeys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerPasskey = async (type: AuthenticatorType) => {
    if (!user) {
      toast.error("You must be logged in to register a passkey");
      return;
    }

    if (!window.PublicKeyCredential) {
      toast.error("WebAuthn not supported", {
        description: "Your browser doesn't support passkeys"
      });
      return;
    }

    // Check platform authenticator availability for biometric
    if (type === 'biometric') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        toast.error("Biometric not available", {
          description: "Your device doesn't support biometric authentication"
        });
        return;
      }
    }

    setIsRegistering(true);

    try {
      // Get user email from profile or auth
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const userName = profile?.full_name || user.email?.split('@')[0] || 'User';

      // Get registration options from backend
      const optionsResponse = await supabase.functions.invoke('passkey-register-options', {
        body: {
          userId: user.id,
          userName,
          userEmail: user.email,
          authenticatorType: type
        }
      });

      if (optionsResponse.error || optionsResponse.data?.error) {
        throw new Error(optionsResponse.data?.error || optionsResponse.error?.message);
      }

      const options = optionsResponse.data;

      // Convert base64 challenge to ArrayBuffer
      const challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
      const userId = new TextEncoder().encode(options.user.id);

      // Convert excluded credentials
      const excludeCredentials = options.excludeCredentials?.map((cred: { id: string }) => ({
        id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
        type: "public-key" as const,
      }));

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: options.rp.name,
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: options.user.name,
            displayName: options.user.displayName,
          },
          pubKeyCredParams: options.pubKeyCredParams,
          authenticatorSelection: {
            authenticatorAttachment: type === 'biometric' ? 'platform' : 'cross-platform',
            requireResidentKey: type === 'biometric',
            userVerification: 'required',
          },
          timeout: options.timeout,
          attestation: options.attestation,
          excludeCredentials,
        }
      }) as PublicKeyCredential | null;

      if (!credential) {
        toast.error("Registration cancelled");
        return;
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Send credential to backend for verification and storage
      const verifyResponse = await supabase.functions.invoke('passkey-register-verify', {
        body: {
          userId: user.id,
          credential: {
            id: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
            response: {
              attestationObject: btoa(String.fromCharCode(...new Uint8Array(response.attestationObject))),
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
            }
          },
          deviceName: deviceName || (type === 'biometric' ? 'Biometric (Face/Fingerprint)' : 'USB Security Key'),
          authenticatorType: type
        }
      });

      if (verifyResponse.error || !verifyResponse.data?.success) {
        throw new Error(verifyResponse.data?.error || "Failed to register passkey");
      }

      toast.success("Passkey registered successfully!", {
        description: type === 'biometric' 
          ? "You can now sign in with your fingerprint or face" 
          : "You can now sign in with your USB security key"
      });

      setShowRegisterForm(false);
      setDeviceName("");
      fetchPasskeys();

    } catch (err: unknown) {
      console.error('Passkey registration error:', err);
      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        toast.error("Registration cancelled or timed out");
      } else if (error.name === 'InvalidStateError') {
        toast.error("This authenticator is already registered");
      } else {
        toast.error("Registration failed", {
          description: error.message
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const deletePasskey = async (passkeyId: string) => {
    try {
      const { error } = await supabase
        .from('user_passkeys')
        .delete()
        .eq('id', passkeyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success("Passkey removed");
      setPasskeys(passkeys.filter(p => p.id !== passkeyId));
    } catch (error) {
      console.error('Error deleting passkey:', error);
      toast.error("Failed to remove passkey");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Passkey Authentication
        </CardTitle>
        <CardDescription>
          Manage your USB security keys and biometric authentication for passwordless sign-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Registered Passkeys */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Registered Passkeys</h4>
          
          {passkeys.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-border rounded-lg">
              <Key className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No passkeys registered yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a USB security key or enable biometric authentication
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {passkeys.map((passkey) => (
                  <motion.div
                    key={passkey.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      {passkey.device_name?.toLowerCase().includes('biometric') ? (
                        <Fingerprint className="w-5 h-5 text-primary" />
                      ) : (
                        <Usb className="w-5 h-5 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{passkey.device_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDate(passkey.created_at)}
                          {passkey.last_used_at && ` • Last used ${formatDate(passkey.last_used_at)}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePasskey(passkey.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Register New Passkey */}
        <AnimatePresence>
          {showRegisterForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-border pt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name (Optional)</Label>
                <Input
                  id="deviceName"
                  placeholder="e.g., My YubiKey, Work Laptop"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRegisterType('usb');
                    registerPasskey('usb');
                  }}
                  disabled={isRegistering}
                  className="h-auto py-4 flex-col gap-2"
                >
                  <Usb className="w-6 h-6" />
                  <span className="text-xs">USB Security Key</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setRegisterType('biometric');
                    registerPasskey('biometric');
                  }}
                  disabled={isRegistering}
                  className="h-auto py-4 flex-col gap-2"
                >
                  <Fingerprint className="w-6 h-6" />
                  <span className="text-xs">Biometric</span>
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowRegisterForm(false);
                    setDeviceName("");
                  }}
                  disabled={isRegistering}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {isRegistering && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  {registerType === 'biometric' 
                    ? "Waiting for biometric verification..." 
                    : "Touch your security key..."}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                onClick={() => setShowRegisterForm(true)}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Register New Passkey
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            <strong>Biometric:</strong> Use your device's fingerprint or face recognition
          </p>
          <p className="flex items-center gap-1">
            <Usb className="w-3 h-3" />
            <strong>USB Key:</strong> Hardware security keys like YubiKey, Titan, etc.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasskeyManagement;
