import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Loader2, XCircle, RefreshCw } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderCancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  userId: string;
  onCancelled: () => void;
}

const CANCELLATION_REASONS = [
  "Changed my mind",
  "Found better price elsewhere",
  "Ordered by mistake",
  "Delivery time too long",
  "Payment issues",
  "Product no longer needed",
  "Other",
];

export function OrderCancellationDialog({
  open,
  onOpenChange,
  orderId,
  userId,
  onCancelled,
}: OrderCancellationDialogProps) {
  const [step, setStep] = useState<"reason" | "otp">("reason");
  const [reason, setReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

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

  const handleRequestOTP = async () => {
    if (!reason) {
      toast.error("Please select a reason for cancellation");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-cancellation-otp", {
        body: {
          order_id: orderId,
          user_id: userId,
          reason: reason === "Other" ? additionalNotes : reason,
        },
      });

      if (error) throw error;

      toast.success("Verification OTP sent to your email");
      setStep("otp");
      setCanResend(false);
      setResendTimer(30);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send verification OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndCancel = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-cancellation-otp", {
        body: {
          order_id: orderId,
          user_id: userId,
          otp,
        },
      });

      if (error) throw error;

      toast.success("Order cancelled successfully!");
      onCancelled();
      onOpenChange(false);

      // Show refund info if applicable
      if (data.needs_refund) {
        toast.info("You'll be redirected to select your refund method.", {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp("");
    handleRequestOTP();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="w-5 h-5" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>
            {step === "reason"
              ? "Please tell us why you want to cancel this order"
              : "Enter the verification code sent to your email"}
          </DialogDescription>
        </DialogHeader>

        {step === "reason" ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600">Important</p>
                <p className="text-muted-foreground">
                  Once cancelled, this action cannot be undone. You'll need to place a new order.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason for Cancellation</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {CANCELLATION_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reason === "Other" && (
              <div className="space-y-2">
                <Label>Please specify</Label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Tell us more about your reason..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Keep Order
              </Button>
              <Button
                variant="destructive"
                onClick={handleRequestOTP}
                disabled={isLoading || !reason || (reason === "Other" && !additionalNotes)}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enter Verification OTP</Label>
              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
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
                OTP valid for 5 minutes
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleVerifyAndCancel}
              disabled={isLoading || otp.length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>

            <div className="text-center">
              {canResend ? (
                <Button variant="link" onClick={handleResendOTP} disabled={isLoading}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Resend OTP
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Resend OTP in {resendTimer}s</p>
              )}
            </div>

            <Button variant="ghost" onClick={() => setStep("reason")} className="w-full">
              Go Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
