import { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle, XCircle, Gift, Truck, Package, RotateCcw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

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
  replacement_order_id: string | null;
  created_at: string;
}

interface OrderComplaintStatusProps {
  orderId: string;
  complaintStatus: string | null;
  orderType: string;
}

export function OrderComplaintStatus({ orderId, complaintStatus, orderType }: OrderComplaintStatusProps) {
  const [complaint, setComplaint] = useState<OrderComplaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComplaint();
  }, [orderId]);

  const fetchComplaint = async () => {
    const { data, error } = await supabase
      .from("order_complaints")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setComplaint(data);
    }
    setIsLoading(false);
  };

  if (isLoading || !complaint) return null;

  const getStatusConfig = () => {
    // Order type based theming
    if (orderType === "replacement") {
      return {
        bgColor: "bg-blue-500/10 border-blue-500/30",
        iconColor: "text-blue-500",
        icon: Package,
        title: "Replacement Order",
        description: "This is a replacement for your original order",
      };
    }

    if (orderType === "warranty_replacement") {
      return {
        bgColor: "bg-purple-500/10 border-purple-500/30",
        iconColor: "text-purple-500",
        icon: Shield,
        title: "Warranty Replacement",
        description: "This order was created under warranty claim",
      };
    }

    // Complaint status based theming
    switch (complaint.investigation_status) {
      case "investigating":
        return {
          bgColor: "bg-red-500/10 border-red-500/30",
          iconColor: "text-red-500",
          icon: Clock,
          title: "Investigation in Progress",
          description: "Our team is investigating your complaint. We'll update you soon.",
        };

      case "resolved_false":
        return {
          bgColor: "bg-red-500/10 border-red-500/30",
          iconColor: "text-red-500",
          icon: XCircle,
          title: "False Report Detected",
          description: "Our records show the delivery partner handed the product successfully.",
        };

      case "resolved_true":
        if (complaint.pickup_status === "scheduled") {
          return {
            bgColor: "bg-orange-500/10 border-orange-500/30",
            iconColor: "text-orange-500",
            icon: Truck,
            title: "Pickup Scheduled",
            description: `Our agent will pick up the item on ${complaint.pickup_scheduled_at ? new Date(complaint.pickup_scheduled_at).toLocaleDateString() : "soon"}`,
          };
        }

        if (complaint.pickup_status === "picked_up") {
          return {
            bgColor: "bg-blue-500/10 border-blue-500/30",
            iconColor: "text-blue-500",
            icon: Package,
            title: "Item Picked Up",
            description: "We've received your item. Processing your request...",
          };
        }

        if (complaint.replacement_order_id) {
          return {
            bgColor: "bg-green-500/10 border-green-500/30",
            iconColor: "text-green-500",
            icon: CheckCircle,
            title: "Replacement Shipped",
            description: "Your replacement order has been placed!",
          };
        }

        if (complaint.refund_status === "completed") {
          return {
            bgColor: "bg-green-500/10 border-green-500/30",
            iconColor: "text-green-500",
            icon: CheckCircle,
            title: "Refund Completed",
            description: "Your refund has been processed successfully.",
          };
        }

        return {
          bgColor: "bg-orange-500/10 border-orange-500/30",
          iconColor: "text-orange-500",
          icon: CheckCircle,
          title: "Complaint Accepted",
          description: "We're sorry for the inconvenience. Processing your request...",
        };

      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-4 rounded-lg border ${config.bgColor}`}
    >
      <div className="flex items-start gap-3">
        <StatusIcon className={`w-6 h-6 ${config.iconColor} mt-0.5`} />
        <div className="flex-1">
          <p className={`font-semibold ${config.iconColor}`}>{config.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>

          {/* Show coupon if available */}
          {complaint.coupon_code && (
            <div className="mt-3 p-2 bg-primary/10 rounded flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm">
                Apology Coupon: <code className="font-mono font-bold">{complaint.coupon_code}</code> (20% off)
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
