import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Banknote, CreditCard, Gift, Loader2, Building, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RefundSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  onSubmitted: () => void;
}

const REFUND_METHODS = [
  {
    id: "gift_card",
    label: "Website Gift Card",
    description: "Fastest – within 1 minute",
    icon: Gift,
    instant: true,
    timing: "~1 min",
  },
  {
    id: "upi",
    label: "UPI Transfer",
    description: "Up to 24 hours",
    icon: Smartphone,
    instant: false,
    timing: "24 hrs",
  },
  {
    id: "bank",
    label: "Bank Transfer (Net Banking)",
    description: "Up to 2 business days",
    icon: Building,
    instant: false,
    timing: "2 days",
  },
];

export function RefundSelectionDialog({
  open,
  onOpenChange,
  orderId,
  userId,
  amount,
  paymentMethod,
  onSubmitted,
}: RefundSelectionDialogProps) {
  const [refundMethod, setRefundMethod] = useState("gift_card");
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateUPI = (upi: string) => {
    return /^[\w.-]+@[\w]+$/.test(upi);
  };

  const handleSubmit = async () => {
    // Validation
    if (refundMethod === "upi") {
      if (!validateUPI(upiId)) {
        toast.error("Please enter a valid UPI ID (e.g., name@upi)");
        return;
      }
      if (!upiName.trim()) {
        toast.error("Please enter the name linked to UPI ID");
        return;
      }
    }

    if (refundMethod === "bank") {
      if (!accountHolder || !accountNumber || !ifscCode || !bankName) {
        toast.error("Please fill all bank details");
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        toast.error("Account numbers do not match");
        return;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
        toast.error("Please enter a valid IFSC code");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (refundMethod === "gift_card") {
        // Auto-process gift card refund
        const { data, error } = await supabase.functions.invoke("process-gift-card-refund", {
          body: { order_id: orderId, user_id: userId, amount },
        });

        if (error) throw error;

        toast.success(`Gift card created! Code: ${data.gift_card_code}`, {
          duration: 10000,
        });
      } else {
        // Create refund request for manual processing
        const { error } = await supabase.from("refund_requests").insert({
          order_id: orderId,
          user_id: userId,
          amount,
          payment_method: paymentMethod,
          refund_method: refundMethod,
          upi_id: refundMethod === "upi" ? `${upiId} (${upiName})` : null,
          bank_account_holder: refundMethod === "bank" ? `${accountHolder} | Bank: ${bankName}` : null,
          bank_account_number_encrypted: refundMethod === "bank" ? accountNumber : null,
          bank_ifsc_encrypted: refundMethod === "bank" ? ifscCode.toUpperCase() : null,
          status: "pending",
        });

        if (error) throw error;

        toast.success("Refund request submitted! You'll receive updates via email.");
      }

      onSubmitted();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to process refund");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-500" />
            Select Refund Method
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to receive your refund of ₹{amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={refundMethod} onValueChange={setRefundMethod} className="space-y-3">
            {REFUND_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <Label
                  key={method.id}
                  htmlFor={method.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    refundMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{method.label}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        method.instant 
                          ? "bg-green-500/20 text-green-600" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {(method as any).timing}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          {/* UPI Details */}
          {refundMethod === "upi" && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label>UPI ID <span className="text-destructive">*</span></Label>
                <Input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (as registered with UPI) <span className="text-destructive">*</span></Label>
                <Input
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                  placeholder="Full name linked to UPI"
                />
              </div>
            </div>
          )}

          {/* Bank Details */}
          {refundMethod === "bank" && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label>Account Holder Name <span className="text-destructive">*</span></Label>
                <Input
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Full name as per bank records"
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Name <span className="text-destructive">*</span></Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., State Bank of India"
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number <span className="text-destructive">*</span></Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter account number"
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Account Number <span className="text-destructive">*</span></Label>
                <Input
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Re-enter account number"
                />
                {confirmAccountNumber && accountNumber !== confirmAccountNumber && (
                  <p className="text-xs text-destructive">Account numbers don't match</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>IFSC Code <span className="text-destructive">*</span></Label>
                <Input
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SBIN0001234"
                  maxLength={11}
                />
              </div>
            </div>
          )}

          {/* Gift Card Info */}
          {refundMethod === "gift_card" && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
              <p className="font-medium text-green-600">Benefits of Gift Card Refund:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Instant credit to your account</li>
                <li>• Valid for 1 year</li>
                <li>• Use on any product</li>
                <li>• Secure & non-transferable</li>
              </ul>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Confirm ${refundMethod === "gift_card" ? "Gift Card" : "Refund"}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
