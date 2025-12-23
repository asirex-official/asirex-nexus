import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Shield, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface PhoneVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  userId: string;
  existingPhone?: string;
}

export function PhoneVerificationDialog({
  open,
  onOpenChange,
  onVerified,
  userId,
  existingPhone,
}: PhoneVerificationDialogProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState(existingPhone || "");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (step === "otp" && !canResend) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, canResend]);

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-phone-otp", {
        body: { phone_number: phoneNumber, user_id: userId },
      });

      if (error) throw error;

      toast.success("OTP sent successfully! Check your email for demo.");
      setStep("otp");
      setCanResend(false);
      setResendTimer(30);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    if (attempts >= 3) {
      toast.error("Maximum attempts reached. Please request a new OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-phone-otp", {
        body: { phone_number: phoneNumber, user_id: userId, otp },
      });

      if (error) throw error;

      if (data.verified) {
        toast.success("Phone number verified successfully!");
        onVerified();
        onOpenChange(false);
      } else {
        throw new Error("Verification failed");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setAttempts((prev) => prev + 1);
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setOtp("");
    setAttempts(0);
    handleSendOTP();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Phone Verification
          </DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "Verify your phone number to continue"
              : "Enter the 6-digit OTP sent to your email (demo mode)"}
          </DialogDescription>
        </DialogHeader>

        {step === "phone" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 bg-muted rounded-md border">
                  <span className="text-sm">+91</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                />
              </div>
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={isLoading || phoneNumber.length < 10}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Send OTP
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enter OTP</Label>
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
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
              <p className="text-xs text-muted-foreground text-center">
                OTP valid for 5 minutes. Attempts: {attempts}/3
              </p>
            </div>

            <Button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6 || attempts >= 3}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <div className="text-center">
              {canResend ? (
                <Button variant="link" onClick={handleResend} disabled={isLoading}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Resend OTP
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in {resendTimer}s
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => setStep("phone")}
              className="w-full"
            >
              Change Phone Number
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
