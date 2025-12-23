import { useState, useEffect } from "react";
import { 
  AlertTriangle, Clock, CheckCircle, XCircle, Gift, Truck, Package, 
  RotateCcw, Shield, CreditCard, MessageSquare, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useLiveChat } from "@/hooks/useLiveChat";
import { format } from "date-fns";

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
}

interface ComplaintTimelineProps {
  orderId: string;
  orderType: string | null;
  complaintStatus: string | null;
}

export function ComplaintTimeline({ orderId, orderType, complaintStatus }: ComplaintTimelineProps) {
  const { openChat } = useLiveChat();
  const [complaint, setComplaint] = useState<OrderComplaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
    const channel = supabase
      .channel(`complaint_${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_complaints", filter: `order_id=eq.${orderId}` },
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

    if (data) setComplaint(data);
    setIsLoading(false);
  };

  const handleContactSupport = () => {
    openChat(`Help with order #${orderId.slice(0, 8)} complaint`);
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
        // Pickup scheduled
        if (!complaint.pickup_status) {
          steps.push({
            label: "Pickup Scheduling",
            status: "pending",
            icon: <Truck className="w-5 h-5" />,
            description: "We'll schedule a pickup for your item",
          });
        } else if (complaint.pickup_status === "scheduled") {
          steps.push({
            label: "Pickup Scheduled",
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

        // Resolution step
        if (complaint.pickup_status === "picked_up") {
          if (complaint.resolution_type === "replacement" && complaint.replacement_order_id) {
            steps.push({
              label: "Replacement Shipped",
              status: "complete",
              icon: <Package className="w-5 h-5" />,
              description: `Order #${complaint.replacement_order_id.slice(0, 8)}`,
            });
          } else if (complaint.resolution_type === "refund") {
            steps.push({
              label: "Refund Processing",
              status: complaint.refund_status === "completed" ? "complete" : "current",
              icon: <CreditCard className="w-5 h-5" />,
              description: complaint.refund_status === "completed" 
                ? "Refund completed" 
                : "Refund is being processed",
            });
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
        if (complaint.refund_method) {
          steps.push({
            label: "Refund Processing",
            status: complaint.refund_status === "completed" ? "complete" : "current",
            icon: <CreditCard className="w-5 h-5" />,
            description: complaint.refund_status === "completed" 
              ? "Refund completed" 
              : "Refund is being processed",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-4 rounded-lg border ${
        isRejected 
          ? "bg-red-500/10 border-red-500/30" 
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
          ) : complaint.investigation_status === "investigating" ? (
            <Clock className="w-5 h-5 text-orange-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          <span className="font-semibold">
            {isRejected 
              ? "Request Not Approved" 
              : complaint.investigation_status === "investigating"
                ? "Investigation in Progress"
                : "Request Approved"
            }
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          {getComplaintTypeLabel(complaint.complaint_type)}
        </Badge>
      </div>

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

      {/* Coupon */}
      {complaint.coupon_code && (
        <div className="p-3 bg-primary/10 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Apology Coupon: <code className="font-mono font-bold">{complaint.coupon_code}</code> (20% off)
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

      {/* Contact Support */}
      <Button variant="outline" size="sm" onClick={handleContactSupport} className="w-full">
        <MessageSquare className="w-4 h-4 mr-2" />
        Contact Support
      </Button>
    </motion.div>
  );
}
