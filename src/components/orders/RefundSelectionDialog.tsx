import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Banknote, Gift, Loader2, CreditCard } from "lucide-react";
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
    label: "Store Credit (Coupon)",
    description: "Instant – Use on your next order",
    icon: Gift,
    timing: "Instant",
    highlight: true,
  },
  {
    id: "original_payment",
    label: "Original Payment Method",
    description: "Refund to the same account you paid from",
    icon: CreditCard,
    timing: "3-7 days",
    highlight: false,
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (refundMethod === "gift_card") {
        // Auto-process gift card refund
        const { data, error } = await supabase.functions.invoke("process-gift-card-refund", {
          body: { order_id: orderId, user_id: userId, amount },
        });

        if (error) throw error;

        toast.success(`Store credit created! Code: ${data.gift_card_code}`, {
          duration: 10000,
        });
      } else {
        // Create refund request for PayU processing
        const { error } = await supabase.from("refund_requests").insert({
          order_id: orderId,
          user_id: userId,
          amount,
          payment_method: paymentMethod,
          refund_method: "original_payment",
          status: "pending",
        });

        if (error) throw error;

        // Also update order complaint if exists
        await supabase
          .from("order_complaints")
          .update({ refund_method: "original_payment" })
          .eq("order_id", orderId);

        toast.success("Refund request submitted! You'll receive the refund in 3-7 business days.");
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
                  <Icon className={`w-5 h-5 ${method.highlight ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{method.label}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        method.highlight 
                          ? "bg-green-500/20 text-green-600" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {method.timing}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          {/* Gift Card Info */}
          {refundMethod === "gift_card" && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
              <p className="font-medium text-green-600">Benefits of Store Credit:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>• Instant credit to your account</li>
                <li>• Valid for 1 year</li>
                <li>• Use on any product</li>
              </ul>
            </div>
          )}

          {/* Original Payment Info */}
          {refundMethod === "original_payment" && (
            <div className="p-3 bg-muted/50 border border-border rounded-lg text-sm">
              <p className="text-muted-foreground">
                The refund will be processed to <span className="font-medium">{paymentMethod || "your original payment method"}</span>. 
                This typically takes 3-7 business days depending on your bank.
              </p>
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
              `Confirm ${refundMethod === "gift_card" ? "Store Credit" : "Refund"}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
