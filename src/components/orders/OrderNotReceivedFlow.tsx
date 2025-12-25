import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Clock, CheckCircle, XCircle, Gift, CreditCard, Wallet, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLiveChat } from "@/hooks/useLiveChat";

interface OrderNotReceivedFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  userId: string;
  orderPaymentMethod: string;
  onCompleted: () => void;
}

const REFUND_METHODS = [
  {
    id: "original",
    label: "Original Payment Method",
    description: "Refund to your original payment method",
    icon: CreditCard,
  },
  {
    id: "bank",
    label: "Bank Transfer",
    description: "Direct transfer to your bank account",
    icon: Building2,
  },
  {
    id: "gift_card",
    label: "Store Credit / Gift Card",
    description: "Get store credit for future purchases",
    icon: Gift,
  },
];

export function OrderNotReceivedFlow({
  open,
  onOpenChange,
  orderId,
  userId,
  orderPaymentMethod,
  onCompleted,
}: OrderNotReceivedFlowProps) {
  const [step, setStep] = useState<"confirm" | "refund_method" | "success">("confirm");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRefundMethod, setSelectedRefundMethod] = useState<string | null>(null);
  const { openChat } = useLiveChat();

  const handleSubmitComplaint = async () => {
    setIsLoading(true);
    try {
      // Create complaint record
      const { data: complaint, error } = await supabase
        .from("order_complaints")
        .insert({
          order_id: orderId,
          user_id: userId,
          complaint_type: "not_received",
          description: "Customer reported order not received",
          investigation_status: "investigating",
        })
        .select()
        .single();

      if (error) throw error;

      // Update order with complaint status
      await supabase
        .from("orders")
        .update({ 
          active_complaint_id: complaint.id,
          complaint_status: "investigating"
        })
        .eq("id", orderId);

      // For prepaid orders, ask for refund method
      if (orderPaymentMethod !== "cod") {
        setStep("refund_method");
      } else {
        // For COD, just create coupon and finish
        await createCouponAndFinish(complaint.id);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint");
    } finally {
      setIsLoading(false);
    }
  };

  const createCouponAndFinish = async (complaintId: string, refundMethod?: string) => {
    setIsLoading(true);
    try {
      // Generate coupon code
      const couponCode = `SORRY${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create coupon in database with proper category and source
      const { error: couponError } = await supabase
        .from("coupons")
        .insert({
          code: couponCode,
          description: "We sincerely apologize for the order issue you experienced. Please accept this 20% discount on your next purchase.",
          discount_type: "percentage",
          discount_value: 20,
          usage_limit: 1,
          per_user_limit: 1,
          is_active: true,
          valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
          category: "apology",
          source: "apology_complaint",
        });

      if (couponError) throw couponError;

      // Update complaint with coupon and refund info
      await supabase
        .from("order_complaints")
        .update({
          coupon_code: couponCode,
          refund_method: refundMethod || null,
          resolution_type: refundMethod ? "refund" : "coupon",
        })
        .eq("id", complaintId);

      setStep("success");
      toast.success("Your complaint has been registered");
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error("Failed to process your request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundMethodSelect = async () => {
    if (!selectedRefundMethod) return;

    // Get complaint ID first
    const { data: order } = await supabase
      .from("orders")
      .select("active_complaint_id")
      .eq("id", orderId)
      .single();

    if (order?.active_complaint_id) {
      await createCouponAndFinish(order.active_complaint_id, selectedRefundMethod);
    }
  };

  const handleContactSupport = () => {
    const message = `Order Not Received - Order ID: ${orderId.slice(0, 8).toUpperCase()}\n\nI reported that I haven't received my order. Please help me track this issue.`;
    openChat(message);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    if (step === "success") {
      onCompleted();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            {step === "confirm" && "Report Order Not Received"}
            {step === "refund_method" && "Select Refund Method"}
            {step === "success" && "Complaint Registered"}
          </DialogTitle>
          <DialogDescription>
            {step === "confirm" && "Our team will investigate your complaint. If verified, you'll receive a refund and a 20% discount coupon."}
            {step === "refund_method" && "How would you like to receive your refund once verified?"}
            {step === "success" && "We apologize for the inconvenience. Here's what happens next:"}
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" && (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-sm text-orange-400">
                <strong>Note:</strong> False reports may result in account restrictions. Our delivery partners record proof of delivery.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComplaint}
                disabled={isLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm Report"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "refund_method" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              As an apology, you'll also receive a <strong>20% discount coupon</strong> for your next order.
            </p>

            <div className="space-y-3">
              {REFUND_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedRefundMethod === method.id;

                return (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedRefundMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <Button
              onClick={handleRefundMethodSelect}
              disabled={!selectedRefundMethod || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Investigation Started</p>
                  <p className="text-sm text-muted-foreground">
                    Our team is verifying your complaint. This usually takes 24-48 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Gift className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">20% Apology Coupon</p>
                  <p className="text-sm text-muted-foreground">
                    A discount coupon has been added to your account as an apology.
                  </p>
                </div>
              </div>

              {selectedRefundMethod && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Refund Pending Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Once verified, refund will be processed to your selected method.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleContactSupport} className="flex-1">
                Contact Support
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
