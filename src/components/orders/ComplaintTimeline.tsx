import { useState, useEffect } from "react";
import { 
  AlertTriangle, Clock, CheckCircle, XCircle, Gift, Truck, Package, 
  RotateCcw, Shield, CreditCard, MessageSquare, ArrowRight, AlertCircle,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useLiveChat } from "@/hooks/useLiveChat";
import { format } from "date-fns";
import { RefundSelectionDialog } from "./RefundSelectionDialog";

interface OrderComplaint {
  id: string;
  complaint_type: string;
  investigation_status: string;
  resolution_type: string | null;
  coupon_code: string | null;
  refund_method: string | null;
  refund_status: string | null;
  pickup_status: string | null;
  pickup_scheduled_at: string | null;
  pickup_completed_at: string | null;
  replacement_order_id: string | null;
  created_at: string;
  updated_at: string;
  pickup_attempt_number: number;
  max_pickup_attempts: number;
  return_status: string;
  eligible_for_coupon: boolean;
}

interface RefundRequest {
  id: string;
  amount: number;
  refund_method: string;
  status: string;
  late_refund_coupon_code: string | null;
}

interface PickupAttempt {
  id: string;
  attempt_number: number;
  scheduled_date: string;
  status: string;
  failure_reason: string | null;
}

interface ComplaintTimelineProps {
  orderId: string;
  orderType: string | null;
  complaintStatus: string | null;
  userId?: string;
  orderAmount?: number;
  paymentMethod?: string;
}

export function ComplaintTimeline({ 
  orderId, 
  orderType, 
  complaintStatus,
  userId,
  orderAmount,
  paymentMethod 
}: ComplaintTimelineProps) {
  const { openChat } = useLiveChat();
  const [complaint, setComplaint] = useState<OrderComplaint | null>(null);
  const [refundRequest, setRefundRequest] = useState<RefundRequest | null>(null);
  const [pickupAttempts, setPickupAttempts] = useState<PickupAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefundDialog, setShowRefundDialog] = useState(false);

  useEffect(() => {
    fetchComplaint();
    const channel = supabase
      .channel(`complaint_${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_complaints", filter: `order_id=eq.${orderId}` },
        () => fetchComplaint()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "refund_requests", filter: `order_id=eq.${orderId}` },
        () => fetchComplaint()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  const fetchComplaint = async () => {
    const { data } = await supabase
      .from("order_complaints")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setComplaint({
        ...data,
        pickup_attempt_number: data.pickup_attempt_number || 0,
        max_pickup_attempts: data.max_pickup_attempts || 3,
        return_status: data.return_status || 'pending',
        eligible_for_coupon: data.eligible_for_coupon || false,
      });

      // Fetch pickup attempts
      const { data: attempts } = await supabase
        .from("return_pickup_attempts")
        .select("*")
        .eq("complaint_id", data.id)
        .order("attempt_number", { ascending: true });
      
      setPickupAttempts((attempts as PickupAttempt[]) || []);

      // Fetch refund request if exists
      const { data: refund } = await supabase
        .from("refund_requests")
        .select("id, amount, refund_method, status, late_refund_coupon_code")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setRefundRequest(refund as RefundRequest | null);
    }
    setIsLoading(false);
  };

  const handleContactSupport = () => {
    openChat(`Help with order #${orderId.slice(0, 8)} complaint`);
  };

  const handleSelectRefundMethod = () => {
    setShowRefundDialog(true);
  };

  if (isLoading || (!complaint && !orderType)) return null;

  // Special order types (replacement/warranty replacement)
  if (orderType === "replacement" || orderType === "warranty_replacement") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-4 rounded-lg border ${
          orderType === "warranty_replacement" 
            ? "bg-purple-500/10 border-purple-500/30" 
            : "bg-blue-500/10 border-blue-500/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {orderType === "warranty_replacement" ? (
            <Shield className="w-6 h-6 text-purple-500" />
          ) : (
            <Package className="w-6 h-6 text-blue-500" />
          )}
          <div>
            <p className={`font-semibold ${orderType === "warranty_replacement" ? "text-purple-500" : "text-blue-500"}`}>
              {orderType === "warranty_replacement" ? "Warranty Replacement Order" : "Replacement Order"}
            </p>
            <p className="text-sm text-muted-foreground">
              This order was created as a {orderType === "warranty_replacement" ? "warranty" : ""} replacement at no extra cost.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!complaint) return null;

  // Check if user needs to select refund method
  const needsRefundMethodSelection = refundRequest?.status === "pending_user_selection";

  // Build timeline steps
  const getTimelineSteps = () => {
    const steps: { label: string; status: "complete" | "current" | "pending"; icon: React.ReactNode; date?: string; description?: string }[] = [];

    // Step 1: Request Submitted (always complete if we have a complaint)
    steps.push({
      label: "Request Submitted",
      status: "complete",
      icon: <CheckCircle className="w-5 h-5" />,
      date: format(new Date(complaint.created_at), "MMM d, h:mm a"),
      description: getComplaintTypeLabel(complaint.complaint_type),
    });

    // Step 2: Under Investigation
    if (complaint.investigation_status === "investigating") {
      steps.push({
        label: "Under Investigation",
        status: "current",
        icon: <Clock className="w-5 h-5" />,
        description: "Our team is reviewing your request",
      });
    } else {
      steps.push({
        label: "Investigation Complete",
        status: "complete",
        icon: complaint.investigation_status === "resolved_true" 
          ? <CheckCircle className="w-5 h-5" /> 
          : <XCircle className="w-5 h-5" />,
        description: complaint.investigation_status === "resolved_true" 
          ? "Request approved" 
          : "Request could not be verified",
      });
    }

    // If rejected, stop here
    if (complaint.investigation_status === "resolved_false") {
      return steps;
    }

    // For approved complaints, add pickup steps if applicable
    if (complaint.investigation_status === "resolved_true") {
      const needsPickup = ["damaged", "return", "replace", "warranty"].includes(complaint.complaint_type);
      
      if (needsPickup) {
        // Check return status
        if (complaint.return_status === "failed") {
          steps.push({
            label: "Pickup Failed",
            status: "current",
            icon: <XCircle className="w-5 h-5" />,
            description: `All ${complaint.max_pickup_attempts} pickup attempts failed. Contact support.`,
          });
          return steps;
        }

        // Pickup scheduling/progress
        if (!complaint.pickup_status || complaint.pickup_status === "attempt_failed") {
          steps.push({
            label: complaint.pickup_attempt_number > 0 ? "Rescheduling Pickup" : "Pickup Scheduling",
            status: complaint.pickup_status === "attempt_failed" ? "current" : "pending",
            icon: <Truck className="w-5 h-5" />,
            description: complaint.pickup_attempt_number > 0 
              ? `Attempt ${complaint.pickup_attempt_number}/${complaint.max_pickup_attempts} failed. Awaiting reschedule.`
              : "We'll schedule a pickup for your item",
          });
        } else if (complaint.pickup_status === "scheduled") {
          steps.push({
            label: `Pickup Scheduled (Attempt ${complaint.pickup_attempt_number}/${complaint.max_pickup_attempts})`,
            status: "current",
            icon: <Truck className="w-5 h-5" />,
            date: complaint.pickup_scheduled_at 
              ? format(new Date(complaint.pickup_scheduled_at), "MMM d") 
              : undefined,
            description: "Our agent will pick up the item",
          });
        } else if (complaint.pickup_status === "picked_up") {
          steps.push({
            label: "Item Picked Up",
            status: "complete",
            icon: <CheckCircle className="w-5 h-5" />,
            date: complaint.pickup_completed_at 
              ? format(new Date(complaint.pickup_completed_at), "MMM d") 
              : undefined,
          });
        }

        // Resolution step after pickup
        if (complaint.pickup_status === "picked_up") {
          if (complaint.resolution_type === "replacement" && complaint.replacement_order_id) {
            steps.push({
              label: "Replacement Shipped",
              status: "complete",
              icon: <Package className="w-5 h-5" />,
              description: `Order #${complaint.replacement_order_id.slice(0, 8)}`,
            });
          } else if (complaint.resolution_type === "refund" || needsRefundMethodSelection || refundRequest) {
            if (needsRefundMethodSelection) {
              steps.push({
                label: "Select Refund Method",
                status: "current",
                icon: <Banknote className="w-5 h-5" />,
                description: "Please choose how you'd like to receive your refund",
              });
            } else if (refundRequest?.status === "pending") {
              steps.push({
                label: "Refund Processing",
                status: "current",
                icon: <CreditCard className="w-5 h-5" />,
                description: "Your refund is being processed",
              });
            } else if (refundRequest?.status === "completed") {
              steps.push({
                label: "Refund Completed",
                status: "complete",
                icon: <CheckCircle className="w-5 h-5" />,
                description: "Refund has been sent to your account",
              });
            } else {
              steps.push({
                label: "Processing Resolution",
                status: "current",
                icon: <Clock className="w-5 h-5" />,
                description: "We're processing your request",
              });
            }
          } else {
            steps.push({
              label: "Processing Resolution",
              status: "current",
              icon: <Clock className="w-5 h-5" />,
              description: "We're processing your request",
            });
          }
        }
      } else {
        // For not_received, go straight to refund
        if (needsRefundMethodSelection) {
          steps.push({
            label: "Select Refund Method",
            status: "current",
            icon: <Banknote className="w-5 h-5" />,
            description: "Please choose how you'd like to receive your refund",
          });
        } else if (refundRequest?.status === "pending") {
          steps.push({
            label: "Refund Processing",
            status: "current",
            icon: <CreditCard className="w-5 h-5" />,
            description: "Your refund is being processed",
          });
        } else if (refundRequest?.status === "completed") {
          steps.push({
            label: "Refund Completed",
            status: "complete",
            icon: <CheckCircle className="w-5 h-5" />,
            description: "Refund has been sent to your account",
          });
        }
      }
    }

    return steps;
  };

  const getComplaintTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      not_received: "Order Not Received",
      damaged: "Damaged Product",
      return: "Return Request",
      replace: "Replacement Request",
      warranty: "Warranty Claim",
    };
    return labels[type] || type;
  };

  const steps = getTimelineSteps();
  const isRejected = complaint.investigation_status === "resolved_false";
  const isReturnFailed = complaint.return_status === "failed";
  const isReturn = complaint.complaint_type === "return";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-4 rounded-lg border ${
          isRejected 
            ? "bg-red-500/10 border-red-500/30" 
            : isReturnFailed
              ? "bg-orange-500/10 border-orange-500/30"
              : complaint.investigation_status === "investigating"
                ? "bg-orange-500/10 border-orange-500/30"
                : "bg-green-500/10 border-green-500/30"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isRejected ? (
              <XCircle className="w-5 h-5 text-red-500" />
            ) : isReturnFailed ? (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            ) : complaint.investigation_status === "investigating" ? (
              <Clock className="w-5 h-5 text-orange-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <span className="font-semibold">
              {isRejected 
                ? "Request Not Approved" 
                : isReturnFailed
                  ? "Return Failed"
                  : complaint.investigation_status === "investigating"
                    ? "Investigation in Progress"
                    : "Request Approved"
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getComplaintTypeLabel(complaint.complaint_type)}
            </Badge>
            {isReturn && !complaint.coupon_code && (
              <Badge variant="secondary" className="text-xs">No Coupon</Badge>
            )}
          </div>
        </div>

        {/* Pickup Attempts Progress (if applicable) */}
        {complaint.pickup_attempt_number > 0 && !isRejected && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Pickup Attempts</span>
              <span className="text-sm text-muted-foreground">
                {complaint.pickup_attempt_number}/{complaint.max_pickup_attempts}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: complaint.max_pickup_attempts }).map((_, i) => {
                const attempt = pickupAttempts.find(a => a.attempt_number === i + 1);
                return (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded ${
                      !attempt
                        ? "bg-muted"
                        : attempt.status === "completed"
                          ? "bg-green-500"
                          : attempt.status === "failed"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3 mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.status === "complete" 
                  ? "bg-green-500/20 text-green-500" 
                  : step.status === "current"
                    ? "bg-orange-500/20 text-orange-500"
                    : "bg-muted text-muted-foreground"
              }`}>
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-medium ${step.status === "pending" ? "text-muted-foreground" : ""}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <span className="text-xs text-muted-foreground">{step.date}</span>
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Refund Method Selection Button */}
        {needsRefundMethodSelection && userId && orderAmount && (
          <div className="p-3 bg-primary/10 rounded-lg mb-4">
            <p className="text-sm mb-2">Please select how you'd like to receive your refund of ₹{orderAmount.toLocaleString()}</p>
            <Button onClick={handleSelectRefundMethod} className="w-full">
              <Banknote className="w-4 h-4 mr-2" />
              Choose Refund Method
            </Button>
          </div>
        )}

        {/* Coupon - Only for eligible types (NOT returns) */}
        {complaint.coupon_code && complaint.eligible_for_coupon && (
          <div className="p-3 bg-primary/10 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm">
                Apology Coupon: <code className="font-mono font-bold">{complaint.coupon_code}</code> (20% off)
              </span>
            </div>
          </div>
        )}

        {/* Late Refund Coupon */}
        {refundRequest?.late_refund_coupon_code && (
          <div className="p-3 bg-orange-500/10 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-orange-500" />
              <span className="text-sm">
                Apology for delay: <code className="font-mono font-bold">{refundRequest.late_refund_coupon_code}</code> (20% off)
              </span>
            </div>
          </div>
        )}

        {/* Replacement Order Link */}
        {complaint.replacement_order_id && (
          <div className="p-3 bg-blue-500/10 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Replacement Order Created</span>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-500">
                View Order <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Return Failed Message */}
        {isReturnFailed && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Return could not be completed after {complaint.max_pickup_attempts} attempts. Please contact support.
              </span>
            </div>
          </div>
        )}

        {/* Contact Support */}
        <Button variant="outline" size="sm" onClick={handleContactSupport} className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </motion.div>

      {/* Refund Selection Dialog */}
      {userId && orderAmount && paymentMethod && (
        <RefundSelectionDialog
          open={showRefundDialog}
          onOpenChange={setShowRefundDialog}
          orderId={orderId}
          userId={userId}
          amount={orderAmount}
          paymentMethod={paymentMethod}
          onSubmitted={fetchComplaint}
        />
      )}
    </>
  );
}
