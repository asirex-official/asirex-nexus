import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, Clock, CheckCircle, XCircle, Gift, Truck, Package, 
  RotateCcw, Shield, CreditCard, MessageSquare, ArrowRight, PackageX,
  Loader2, ChevronRight, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useLiveChat } from "@/hooks/useLiveChat";
import { format } from "date-fns";

interface Complaint {
  id: string;
  order_id: string;
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

interface MyComplaintsViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onViewOrder?: (orderId: string) => void;
}

const COMPLAINT_TYPES = {
  not_received: { label: "Order Not Received", icon: PackageX, color: "text-red-500", bg: "bg-red-500/10" },
  damaged: { label: "Damaged Product", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  return: { label: "Return Request", icon: RotateCcw, color: "text-blue-500", bg: "bg-blue-500/10" },
  replace: { label: "Replacement Request", icon: Package, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  warranty: { label: "Warranty Claim", icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10" },
};

const STATUS_CONFIG = {
  investigating: { label: "Under Investigation", icon: Clock, color: "text-orange-500", bg: "bg-orange-500/20" },
  resolved_true: { label: "Approved", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/20" },
  resolved_false: { label: "Rejected", icon: XCircle, color: "text-red-500", bg: "bg-red-500/20" },
};

export function MyComplaintsViewer({ open, onOpenChange, userId, onViewOrder }: MyComplaintsViewerProps) {
  const { openChat } = useLiveChat();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (open) {
      fetchComplaints();
    }
  }, [open, userId]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("order_complaints")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComplaints(data);
    }
    setIsLoading(false);
  };

  const getComplaintConfig = (type: string) => {
    return COMPLAINT_TYPES[type as keyof typeof COMPLAINT_TYPES] || COMPLAINT_TYPES.damaged;
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.investigating;
  };

  const getTimelineSteps = (complaint: Complaint) => {
    const steps: { label: string; status: "complete" | "current" | "pending"; description?: string }[] = [];

    // Step 1: Submitted
    steps.push({
      label: "Request Submitted",
      status: "complete",
      description: format(new Date(complaint.created_at), "MMM d, h:mm a"),
    });

    // Step 2: Investigation
    if (complaint.investigation_status === "investigating") {
      steps.push({
        label: "Under Investigation",
        status: "current",
        description: "Our team is reviewing your request",
      });
    } else {
      steps.push({
        label: complaint.investigation_status === "resolved_true" ? "Request Approved" : "Not Approved",
        status: "complete",
        description: complaint.investigation_status === "resolved_true" 
          ? "Your request has been approved" 
          : "We couldn't verify the issue",
      });
    }

    if (complaint.investigation_status === "resolved_false") {
      return steps;
    }

    // Step 3: Pickup (if applicable)
    if (complaint.investigation_status === "resolved_true") {
      const needsPickup = ["damaged", "return", "replace", "warranty"].includes(complaint.complaint_type);
      
      if (needsPickup) {
        if (!complaint.pickup_status) {
          steps.push({
            label: "Pickup Scheduling",
            status: "pending",
            description: "We'll schedule pickup soon",
          });
        } else if (complaint.pickup_status === "scheduled") {
          steps.push({
            label: "Pickup Scheduled",
            status: "current",
            description: complaint.pickup_scheduled_at 
              ? format(new Date(complaint.pickup_scheduled_at), "EEEE, MMM d")
              : "Date to be confirmed",
          });
        } else if (complaint.pickup_status === "picked_up") {
          steps.push({
            label: "Item Picked Up",
            status: "complete",
            description: complaint.pickup_completed_at
              ? format(new Date(complaint.pickup_completed_at), "MMM d")
              : "Completed",
          });
        }
      }

      // Step 4: Resolution
      if (complaint.pickup_status === "picked_up" || complaint.complaint_type === "not_received") {
        if (complaint.resolution_type === "replacement" && complaint.replacement_order_id) {
          steps.push({
            label: "Replacement Order Created",
            status: "complete",
            description: `Order #${complaint.replacement_order_id.slice(0, 8)}`,
          });
        } else if (complaint.resolution_type === "refund") {
          steps.push({
            label: complaint.refund_status === "completed" ? "Refund Completed" : "Refund Processing",
            status: complaint.refund_status === "completed" ? "complete" : "current",
            description: complaint.refund_method === "gift_card" 
              ? "Store credit issued"
              : "Processing to your account",
          });
        } else if (!complaint.resolution_type && needsPickup) {
          steps.push({
            label: "Awaiting Resolution",
            status: "pending",
            description: "Processing your request",
          });
        }
      }
    }

    return steps;
  };

  const handleContactSupport = () => {
    openChat("Help with my complaint");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            My Complaints & Requests
          </DialogTitle>
          <DialogDescription>
            View status of your returns, replacements, warranty claims, and other requests
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Active Requests</h3>
            <p className="text-sm text-muted-foreground">
              You haven't filed any complaints or requests yet.
            </p>
          </div>
        ) : selectedComplaint ? (
          <div className="flex-1 overflow-y-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedComplaint(null)}
              className="mb-4"
            >
              ← Back to all requests
            </Button>

            {/* Complaint Details */}
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const config = getComplaintConfig(selectedComplaint.complaint_type);
                    const Icon = config.icon;
                    return (
                      <>
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold">{config.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Order #{selectedComplaint.order_id.slice(0, 8)}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                {(() => {
                  const status = getStatusConfig(selectedComplaint.investigation_status);
                  return (
                    <Badge className={`${status.bg} ${status.color} border-none`}>
                      {status.label}
                    </Badge>
                  );
                })()}
              </div>

              {/* Timeline */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Progress Timeline</h4>
                <div className="space-y-4">
                  {getTimelineSteps(selectedComplaint).map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        step.status === "complete" 
                          ? "bg-green-500/20 text-green-500" 
                          : step.status === "current"
                            ? "bg-orange-500/20 text-orange-500"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {step.status === "complete" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : step.status === "current" ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${step.status === "pending" ? "text-muted-foreground" : ""}`}>
                          {step.label}
                        </p>
                        {step.description && (
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Coupon */}
              {selectedComplaint.coupon_code && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Apology Coupon</p>
                      <p className="text-sm text-muted-foreground">20% off your next order</p>
                    </div>
                    <code className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded">
                      {selectedComplaint.coupon_code}
                    </code>
                  </div>
                </Card>
              )}

              {/* Replacement Order */}
              {selectedComplaint.replacement_order_id && (
                <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Replacement Order Created</p>
                        <p className="text-sm text-muted-foreground">
                          Track your new order #{selectedComplaint.replacement_order_id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    {onViewOrder && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-blue-500"
                        onClick={() => {
                          onOpenChange(false);
                          onViewOrder(selectedComplaint.replacement_order_id!);
                        }}
                      >
                        View <ExternalLink className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleContactSupport} className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                {onViewOrder && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false);
                      onViewOrder(selectedComplaint.order_id);
                    }}
                    className="flex-1"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    View Original Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3">
            {complaints.map((complaint, index) => {
              const config = getComplaintConfig(complaint.complaint_type);
              const status = getStatusConfig(complaint.investigation_status);
              const Icon = config.icon;

              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 cursor-pointer transition-all hover:bg-muted/50"
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{config.label}</p>
                            <Badge variant="outline" className={`${status.bg} ${status.color} border-none text-xs`}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Order #{complaint.order_id.slice(0, 8)} • {format(new Date(complaint.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
