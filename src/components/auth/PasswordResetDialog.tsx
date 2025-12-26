import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowLeft, Shield, CheckCircle, Eye, EyeOff, Phone, MessageSquare } from "lucide-react";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "method" | "otp" | "newPassword" | "success";

export function PasswordResetDialog({ open, onOpenChange }: PasswordResetDialogProps) {
  const [step, setStep] = useState<Step>("method");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpMethod, setOtpMethod] = useState<'email' | 'sms'>('email');
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    if (otpMethod === 'email' && !email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (otpMethod === 'sms' && (!phoneNumber || phoneNumber.length < 10)) {
      toast({
        title: "Phone required",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (otpMethod === 'sms') {
        const { data, error } = await supabase.functions.invoke('send-sms-otp', {
          body: { 
            phone_number: phoneNumber, 
            purpose: 'password_reset',
            email: email || undefined
          }
        });

        if (error || data?.error) {
          toast({
            title: "Error",
            description: data?.error || "Failed to send SMS OTP. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "OTP Sent",
          description: `We've sent a 6-digit code to +91 ${phoneNumber}`,
        });
      } else {
        const { data, error } = await supabase.functions.invoke('send-password-reset-otp', {
          body: { email }
        });

        if (error) {
          toast({
            title: "Error",
            description: "Failed to send reset code. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Reset Code Sent",
          description: `We've sent a 6-digit code to ${email}`,
        });
      }

      setStep("otp");
      setResendCooldown(60);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await handleSendOTP();
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    // Move to password entry step
    setStep("newPassword");
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (otpMethod === 'sms') {
        // First verify SMS OTP
        const verifyResponse = await supabase.functions.invoke('verify-sms-otp', {
          body: { phone_number: phoneNumber, otp }
        });

        if (verifyResponse.error || verifyResponse.data?.error) {
          const errorMessage = verifyResponse.data?.error || "Invalid code. Please try again.";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          if (errorMessage.includes("expired") || errorMessage.includes("attempts")) {
            setStep("method");
            setOtp("");
          }
          return;
        }

        // If SMS OTP verified, update password via email if provided
        if (email) {
          response = await supabase.functions.invoke('verify-password-reset-otp', {
            body: { email, otp, newPassword, skipOtpVerify: true }
          });
        } else {
          toast({
            title: "Email Required",
            description: "Please provide an email to update password.",
            variant: "destructive",
          });
          return;
        }
      } else {
        response = await supabase.functions.invoke('verify-password-reset-otp', {
          body: { email, otp, newPassword }
        });
      }

      if (response?.error || response?.data?.error) {
        const errorMessage = response.data?.error || "Invalid code. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        if (errorMessage.includes("expired") || errorMessage.includes("attempts")) {
          setStep("method");
          setOtp("");
        }
        return;
      }

      toast({
        title: "Password Updated!",
        description: "Your password has been successfully reset.",
      });
      setStep("success");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("method");
    setEmail("");
    setPhoneNumber("");
    setOtpMethod('email');
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            {step === "method" && "Choose how to receive your reset code."}
            {step === "otp" && `Enter the 6-digit code sent to your ${otpMethod === 'sms' ? 'phone' : 'email'}.`}
            {step === "newPassword" && "Create your new password."}
            {step === "success" && "Password reset complete!"}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <Label>Receive reset code via</Label>
                <RadioGroup
                  value={otpMethod}
                  onValueChange={(v) => setOtpMethod(v as 'email' | 'sms')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="reset-email-method" />
                    <Label htmlFor="reset-email-method" className="flex items-center gap-2 cursor-pointer font-normal">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="reset-sms-method" />
                    <Label htmlFor="reset-sms-method" className="flex items-center gap-2 cursor-pointer font-normal">
                      <MessageSquare className="w-4 h-4" />
                      SMS
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {otpMethod === 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reset-phone">Phone Number</Label>
                    <div className="relative flex gap-2">
                      <div className="flex items-center gap-1 px-3 bg-muted rounded-md border h-10">
                        <span className="text-sm text-muted-foreground">+91</span>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="reset-phone"
                          type="tel"
                          placeholder="Enter 10-digit number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email-sms">Email (for password update)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reset-email-sms"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Required to update your password
                    </p>
                  </div>
                </>
              )}

              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Reset Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Code sent to {otpMethod === 'sms' ? `+91 ${phoneNumber}` : email}
                </p>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0}
                    className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("method")}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === "newPassword" && (
            <motion.div
              key="newPassword"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={newPassword} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-destructive">Passwords don't match</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("otp")}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                  className="flex-1"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Password Reset Complete!</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <Button onClick={handleClose} className="w-full">
                Back to Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
