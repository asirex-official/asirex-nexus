import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, Loader2, CheckCircle, XCircle, Clock, RefreshCw, 
  Truck, Package, Gift, Eye, RotateCcw, Shield, CreditCard, 
  PackageX, Calendar, User, Mail, Phone, DollarSign, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface OrderComplaint {
  id: string;
  order_id: string;
  user_id: string;
  complaint_type: string;
  description: string | null;
  images: string[] | null;
  investigation_status: string;
  investigation_notes: string | null;
  resolution_type: string | null;
  coupon_code: string | null;
  refund_method: string | null;
  refund_status: string | null;
  pickup_status: string | null;
  pickup_scheduled_at: string | null;
  pickup_completed_at: string | null;
  replacement_order_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // New fields
  pickup_attempt_number: number;
  max_pickup_attempts: number;
  pickup_failed_at: string | null;
  return_status: string;
  eligible_for_coupon: boolean;
  order?: {
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    total_amount: number;
    payment_method: string;
    shipping_address: string;
    items: any[];
  };
}

interface PickupAttempt {
  id: string;
  complaint_id: string;
  attempt_number: number;
  scheduled_date: string;
  attempted_at: string | null;
  status: string;
  failure_reason: string | null;
}

const COMPLAINT_TYPES = {
  not_received: { label: "Not Received", color: "bg-red-500", icon: PackageX },
  damaged: { label: "Damaged", color: "bg-orange-500", icon: AlertTriangle },
  return: { label: "Return", color: "bg-blue-500", icon: RotateCcw },
  replace: { label: "Replace", color: "bg-cyan-500", icon: Package },
  warranty: { label: "Warranty", color: "bg-purple-500", icon: Shield },
};

// Coupon is only for: replace, warranty, not_received (our fault)
// NOT for returns (customer's choice)
const COUPON_ELIGIBLE_TYPES = ["replace", "warranty", "not_received", "damaged"];

export default function UnifiedComplaintsManager() {
  const [complaints, setComplaints] = useState<OrderComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("investigating");
  const [selectedComplaint, setSelectedComplaint] = useState<OrderComplaint | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [pickupAttempts, setPickupAttempts] = useState<PickupAttempt[]>([]);
  const [failureReason, setFailureReason] = useState("");

  useEffect(() => {
    fetchComplaints();
    const channel = supabase
      .channel("complaints_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "order_complaints" }, fetchComplaints)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("order_complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch complaints");
      setIsLoading(false);
      return;
    }

    // Fetch order details
    const withOrders = await Promise.all(
      (data || []).map(async (c: any) => {
        const { data: order } = await supabase
          .from("orders")
          .select("customer_name, customer_email, customer_phone, total_amount, payment_method, shipping_address, items")
          .eq("id", c.order_id)
          .single();
        return { 
          ...c, 
          images: c.images as string[] | null, 
          order: order ? { ...order, items: Array.isArray(order.items) ? order.items : [] } : undefined,
          pickup_attempt_number: c.pickup_attempt_number || 0,
          max_pickup_attempts: c.max_pickup_attempts || 3,
          return_status: c.return_status || 'pending',
          eligible_for_coupon: c.eligible_for_coupon || false,
        } as OrderComplaint;
      })
    );

    setComplaints(withOrders);
    setIsLoading(false);
  };

  const fetchPickupAttempts = async (complaintId: string) => {
    const { data } = await supabase
      .from("return_pickup_attempts")
      .select("*")
      .eq("complaint_id", complaintId)
      .order("attempt_number", { ascending: true });
    setPickupAttempts((data as PickupAttempt[]) || []);
  };

  const sendNotification = async (
    complaint: OrderComplaint,
    notificationType: string,
    additionalData?: Record<string, any>
  ) => {
    try {
      await supabase.functions.invoke("send-complaint-notification", {
        body: {
          complaintId: complaint.id,
          orderId: complaint.order_id,
          userId: complaint.user_id,
          notificationType,
          complaintType: complaint.complaint_type,
          customerName: complaint.order?.customer_name || "Customer",
          customerEmail: complaint.order?.customer_email || "",
          additionalData,
        },
      });
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  // Action: Approve complaint
  // Coupon ONLY for replace, warranty, not_received, damaged - NOT for return
  const handleApprove = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);

    try {
      const isEligibleForCoupon = COUPON_ELIGIBLE_TYPES.includes(selectedComplaint.complaint_type);
      let couponCode: string | null = null;

      // Only generate coupon for eligible types (NOT returns)
      if (isEligibleForCoupon) {
        couponCode = `SORRY${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await supabase.from("coupons").insert({
          code: couponCode,
          description: "Apology coupon for order issue",
          discount_type: "percentage",
          discount_value: 20,
          usage_limit: 1,
          per_user_limit: 1,
          is_active: true,
          valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      // Update complaint
      await supabase
        .from("order_complaints")
        .update({
          investigation_status: "resolved_true",
          investigation_notes: adminNotes,
          coupon_code: couponCode,
          admin_notes: adminNotes,
          eligible_for_coupon: isEligibleForCoupon,
        })
        .eq("id", selectedComplaint.id);

      // Update order
      await supabase
        .from("orders")
        .update({ complaint_status: "approved" })
        .eq("id", selectedComplaint.order_id);

      await sendNotification(selectedComplaint, "complaint_approved", { 
        couponCode: isEligibleForCoupon ? couponCode : null, 
        couponDiscount: isEligibleForCoupon ? 20 : null,
        isReturn: selectedComplaint.complaint_type === "return",
      });

      const message = isEligibleForCoupon 
        ? "Complaint approved with 20% coupon - Customer notified"
        : "Return approved (no coupon for returns) - Customer notified";
      toast.success(message);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to approve");
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Reject complaint
  const handleReject = async () => {
    if (!selectedComplaint || !adminNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setIsUpdating(true);

    try {
      await supabase
        .from("order_complaints")
        .update({
          investigation_status: "resolved_false",
          investigation_notes: adminNotes,
          admin_notes: adminNotes,
        })
        .eq("id", selectedComplaint.id);

      await supabase
        .from("orders")
        .update({ complaint_status: "rejected" })
        .eq("id", selectedComplaint.order_id);

      await sendNotification(selectedComplaint, "complaint_rejected", { rejectionReason: adminNotes });
      toast.success("Marked as rejected - Customer notified");
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to reject");
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Schedule pickup attempt (tracks attempt number)
  const handleSchedulePickup = async () => {
    if (!selectedComplaint || !pickupDate) {
      toast.error("Please select a pickup date");
      return;
    }
    setIsUpdating(true);

    try {
      const attemptNumber = (selectedComplaint.pickup_attempt_number || 0) + 1;

      // Create pickup attempt record
      await supabase.from("return_pickup_attempts").insert({
        complaint_id: selectedComplaint.id,
        order_id: selectedComplaint.order_id,
        attempt_number: attemptNumber,
        scheduled_date: pickupDate,
        status: "scheduled",
      });

      // Update complaint
      await supabase
        .from("order_complaints")
        .update({
          pickup_status: "scheduled",
          pickup_scheduled_at: new Date(pickupDate).toISOString(),
          pickup_attempt_number: attemptNumber,
          admin_notes: adminNotes,
          return_status: "pickup_scheduled",
        })
        .eq("id", selectedComplaint.id);

      await sendNotification(selectedComplaint, "pickup_scheduled", {
        pickupDate: format(new Date(pickupDate), "EEEE, MMMM d, yyyy"),
        attemptNumber,
        maxAttempts: selectedComplaint.max_pickup_attempts,
      });

      toast.success(`Pickup attempt ${attemptNumber}/${selectedComplaint.max_pickup_attempts} scheduled`);
      fetchComplaints();
      fetchPickupAttempts(selectedComplaint.id);
    } catch (error) {
      toast.error("Failed to schedule pickup");
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Mark pickup as successful
  const handleMarkPickedUp = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);

    try {
      // Update the latest pickup attempt
      const { data: attempts } = await supabase
        .from("return_pickup_attempts")
        .select("*")
        .eq("complaint_id", selectedComplaint.id)
        .eq("status", "scheduled")
        .order("attempt_number", { ascending: false })
        .limit(1);

      if (attempts && attempts.length > 0) {
        await supabase
          .from("return_pickup_attempts")
          .update({
            status: "completed",
            attempted_at: new Date().toISOString(),
          })
          .eq("id", attempts[0].id);
      }

      await supabase
        .from("order_complaints")
        .update({
          pickup_status: "picked_up",
          pickup_completed_at: new Date().toISOString(),
          return_status: "picked_up",
        })
        .eq("id", selectedComplaint.id);

      await sendNotification(selectedComplaint, "pickup_completed");
      toast.success("Item picked up successfully!");
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Mark pickup attempt as failed
  const handlePickupFailed = async () => {
    if (!selectedComplaint || !failureReason.trim()) {
      toast.error("Please provide a failure reason");
      return;
    }
    setIsUpdating(true);

    try {
      const currentAttempt = selectedComplaint.pickup_attempt_number || 1;
      const maxAttempts = selectedComplaint.max_pickup_attempts || 3;

      // Update the latest pickup attempt as failed
      const { data: attempts } = await supabase
        .from("return_pickup_attempts")
        .select("*")
        .eq("complaint_id", selectedComplaint.id)
        .eq("status", "scheduled")
        .order("attempt_number", { ascending: false })
        .limit(1);

      if (attempts && attempts.length > 0) {
        await supabase
          .from("return_pickup_attempts")
          .update({
            status: "failed",
            attempted_at: new Date().toISOString(),
            failure_reason: failureReason,
          })
          .eq("id", attempts[0].id);
      }

      if (currentAttempt >= maxAttempts) {
        // All attempts exhausted - mark return as failed
        await supabase
          .from("order_complaints")
          .update({
            pickup_status: "failed",
            pickup_failed_at: new Date().toISOString(),
            return_status: "failed",
            admin_notes: `Return failed after ${maxAttempts} pickup attempts. Last reason: ${failureReason}`,
          })
          .eq("id", selectedComplaint.id);

        await sendNotification(selectedComplaint, "return_failed", {
          reason: `All ${maxAttempts} pickup attempts failed`,
        });

        toast.error(`Return failed - All ${maxAttempts} pickup attempts exhausted`);
      } else {
        // Can schedule another attempt
        await supabase
          .from("order_complaints")
          .update({
            pickup_status: "attempt_failed",
            return_status: "pending_retry",
          })
          .eq("id", selectedComplaint.id);

        toast.warning(`Pickup attempt ${currentAttempt} failed. ${maxAttempts - currentAttempt} attempts remaining.`);
      }

      setFailureReason("");
      fetchComplaints();
      fetchPickupAttempts(selectedComplaint.id);
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Create replacement order (with coupon for eligible types)
  const handleCreateReplacement = async () => {
    if (!selectedComplaint?.order) return;
    setIsUpdating(true);

    try {
      // Create replacement order
      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert({
          user_id: selectedComplaint.user_id,
          customer_name: selectedComplaint.order.customer_name,
          customer_email: selectedComplaint.order.customer_email,
          customer_phone: selectedComplaint.order.customer_phone,
          shipping_address: selectedComplaint.order.shipping_address,
          items: selectedComplaint.order.items,
          total_amount: 0, // Free replacement
          payment_status: "paid",
          payment_method: "replacement",
          order_status: "processing",
          order_type: selectedComplaint.complaint_type === "warranty" ? "warranty_replacement" : "replacement",
          parent_order_id: selectedComplaint.order_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update complaint with replacement order
      await supabase
        .from("order_complaints")
        .update({
          replacement_order_id: newOrder.id,
          resolution_type: "replacement",
          return_status: "completed",
        })
        .eq("id", selectedComplaint.id);

      await sendNotification(selectedComplaint, "replacement_created", {
        replacementOrderId: newOrder.id,
        couponCode: selectedComplaint.coupon_code,
      });

      toast.success("Replacement order created - Customer notified");
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create replacement");
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Process refund - Creates refund request for user to select method
  const handleProcessRefund = async () => {
    if (!selectedComplaint?.order) return;
    setIsUpdating(true);

    try {
      // For returns: NO coupon, user gets money back
      // For not_received/damaged: Already has coupon from approval
      
      // Create refund request (user needs to select payment method)
      await supabase.from("refund_requests").insert({
        order_id: selectedComplaint.order_id,
        user_id: selectedComplaint.user_id,
        amount: selectedComplaint.order.total_amount,
        payment_method: selectedComplaint.order.payment_method,
        refund_method: "pending_selection", // User will choose
        reason: `${selectedComplaint.complaint_type}: ${selectedComplaint.description || "No description"}`,
        status: "pending_user_selection",
      });

      await supabase
        .from("order_complaints")
        .update({
          refund_status: "pending_user_selection",
          resolution_type: "refund",
          return_status: selectedComplaint.complaint_type === "return" ? "completed" : selectedComplaint.return_status,
        })
        .eq("id", selectedComplaint.id);

      await sendNotification(selectedComplaint, "refund_initiated", {
        refundAmount: selectedComplaint.order.total_amount,
        needsSelection: true,
      });

      toast.success("Refund initiated - Customer asked to select payment method");
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to process refund");
    } finally {
      setIsUpdating(false);
    }
  };

  const getComplaintConfig = (type: string) => {
    return COMPLAINT_TYPES[type as keyof typeof COMPLAINT_TYPES] || { label: type, color: "bg-gray-500", icon: AlertTriangle };
  };

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "investigating") return c.investigation_status === "investigating";
    if (activeTab === "approved") return c.investigation_status === "resolved_true" && !c.replacement_order_id && c.refund_status !== "completed";
    if (activeTab === "pickup") return c.pickup_status === "scheduled" || c.pickup_status === "attempt_failed" || c.pickup_status === "picked_up";
    if (activeTab === "resolved") return c.replacement_order_id || c.refund_status === "completed" || c.return_status === "failed";
    return true;
  });

  const counts = {
    investigating: complaints.filter(c => c.investigation_status === "investigating").length,
    approved: complaints.filter(c => c.investigation_status === "resolved_true" && !c.replacement_order_id && c.refund_status !== "completed" && c.return_status !== "failed").length,
    pickup: complaints.filter(c => c.pickup_status === "scheduled" || c.pickup_status === "attempt_failed" || c.pickup_status === "picked_up").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Customer Complaints</h1>
          <p className="text-muted-foreground">
            Unified complaint management: Not Received, Damaged, Return, Replace, Warranty
          </p>
        </div>
        <div className="flex items-center gap-2">
          {counts.investigating > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              {counts.investigating} Pending
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchComplaints}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="investigating" className="relative">
            🔍 Investigating
            {counts.investigating > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {counts.investigating}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            ✅ Approved
            {counts.approved > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                {counts.approved}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pickup">
            🚚 Pickup
            {counts.pickup > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                {counts.pickup}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">✓ Resolved</TabsTrigger>
          <TabsTrigger value="all">All ({complaints.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredComplaints.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No complaints in this category</h3>
          <p className="text-muted-foreground">All caught up!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint, index) => {
            const config = getComplaintConfig(complaint.complaint_type);
            const Icon = config.icon;

            return (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                    complaint.investigation_status === "investigating" ? "border-red-500/50 bg-red-500/5" : ""
                  } ${complaint.return_status === "failed" ? "border-orange-500/50 bg-orange-500/5" : ""}`}
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    setAdminNotes(complaint.admin_notes || "");
                    setPickupDate(complaint.pickup_scheduled_at ? complaint.pickup_scheduled_at.split("T")[0] : "");
                    fetchPickupAttempts(complaint.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${config.color}/20`}>
                        <Icon className={`w-5 h-5 ${config.color.replace("bg-", "text-")}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{complaint.order?.customer_name}</h3>
                          <Badge className={config.color}>{config.label}</Badge>
                          {complaint.complaint_type === "return" && (
                            <Badge variant="outline" className="text-xs">No Coupon</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Order #{complaint.order_id.slice(0, 8)} • {format(new Date(complaint.created_at), "MMM d, h:mm a")}
                        </p>
                        {complaint.pickup_attempt_number > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Pickup Attempts: {complaint.pickup_attempt_number}/{complaint.max_pickup_attempts}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">₹{complaint.order?.total_amount?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{complaint.order?.payment_method}</p>
                      </div>
                      
                      {/* Status indicators */}
                      <div className="flex flex-col gap-1">
                        {complaint.investigation_status === "investigating" && (
                          <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Investigating</Badge>
                        )}
                        {complaint.investigation_status === "resolved_true" && !complaint.pickup_status && (
                          <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
                        )}
                        {complaint.pickup_status === "scheduled" && (
                          <Badge className="bg-blue-500"><Truck className="w-3 h-3 mr-1" />Pickup #{complaint.pickup_attempt_number}</Badge>
                        )}
                        {complaint.pickup_status === "attempt_failed" && (
                          <Badge className="bg-orange-500"><AlertCircle className="w-3 h-3 mr-1" />Retry Needed</Badge>
                        )}
                        {complaint.pickup_status === "picked_up" && !complaint.replacement_order_id && (
                          <Badge className="bg-purple-500"><Package className="w-3 h-3 mr-1" />Picked Up</Badge>
                        )}
                        {complaint.return_status === "failed" && (
                          <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Return Failed</Badge>
                        )}
                        {complaint.replacement_order_id && (
                          <Badge className="bg-green-600"><Package className="w-3 h-3 mr-1" />Replaced</Badge>
                        )}
                        {complaint.refund_status === "completed" && (
                          <Badge className="bg-green-600"><CreditCard className="w-3 h-3 mr-1" />Refunded</Badge>
                        )}
                        {complaint.investigation_status === "resolved_false" && (
                          <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const config = getComplaintConfig(selectedComplaint.complaint_type);
                    const Icon = config.icon;
                    return <><Icon className="w-5 h-5" /> {config.label} Complaint</>;
                  })()}
                  {selectedComplaint.complaint_type === "return" && (
                    <Badge variant="outline">No Coupon for Returns</Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                {/* Customer Info */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedComplaint.order?.customer_name}</p>
                    <p className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selectedComplaint.order?.customer_email}
                    </p>
                    {selectedComplaint.order?.customer_phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selectedComplaint.order.customer_phone}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-2">
                      {selectedComplaint.order?.shipping_address}
                    </p>
                  </div>
                </Card>

                {/* Order Info */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Order Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Order ID:</strong> #{selectedComplaint.order_id.slice(0, 8)}</p>
                    <p className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> ₹{selectedComplaint.order?.total_amount?.toLocaleString()}
                    </p>
                    <p><strong>Payment:</strong> {selectedComplaint.order?.payment_method}</p>
                    <p><strong>Submitted:</strong> {format(new Date(selectedComplaint.created_at), "PPpp")}</p>
                  </div>
                </Card>
              </div>

              {/* Pickup Attempts History */}
              {pickupAttempts.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Pickup Attempts ({pickupAttempts.length}/{selectedComplaint.max_pickup_attempts})
                  </h4>
                  <div className="space-y-2">
                    {pickupAttempts.map((attempt) => (
                      <div key={attempt.id} className={`p-2 rounded text-sm flex justify-between items-center ${
                        attempt.status === "completed" ? "bg-green-500/10" :
                        attempt.status === "failed" ? "bg-red-500/10" :
                        "bg-blue-500/10"
                      }`}>
                        <span>Attempt #{attempt.attempt_number} - {format(new Date(attempt.scheduled_date), "MMM d, yyyy")}</span>
                        <Badge className={
                          attempt.status === "completed" ? "bg-green-500" :
                          attempt.status === "failed" ? "bg-red-500" :
                          "bg-blue-500"
                        }>
                          {attempt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Description */}
              <Card className="p-4">
                <h4 className="font-semibold mb-2">Complaint Description</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedComplaint.description || "No description provided"}</p>
              </Card>

              {/* Images */}
              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Attached Images</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedComplaint.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Evidence ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => window.open(img, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes (required for rejection)..."
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4 border-t">
                {/* Step 1: Investigating - Approve/Reject */}
                {selectedComplaint.investigation_status === "investigating" && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 1: Review & Decision</h4>
                    <div className="flex gap-2">
                      <Button onClick={handleApprove} disabled={isUpdating} className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {selectedComplaint.complaint_type === "return" 
                          ? "Approve Return (No Coupon)" 
                          : "Approve & Generate Coupon"
                        }
                      </Button>
                      <Button onClick={handleReject} disabled={isUpdating} variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject (Requires Notes)
                      </Button>
                    </div>
                    {selectedComplaint.complaint_type === "return" && (
                      <p className="text-sm text-muted-foreground">
                        Note: Returns don't receive a 20% coupon. Only replacements, warranty claims, and order issues (damaged/not received) are eligible.
                      </p>
                    )}
                  </div>
                )}

                {/* Step 2: Approved - Schedule Pickup (for return, replace, damaged, warranty) */}
                {selectedComplaint.investigation_status === "resolved_true" && 
                 (!selectedComplaint.pickup_status || selectedComplaint.pickup_status === "attempt_failed") && 
                 selectedComplaint.complaint_type !== "not_received" &&
                 selectedComplaint.return_status !== "failed" && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">
                      Step 2: Schedule Pickup 
                      {selectedComplaint.pickup_attempt_number > 0 && (
                        <span className="text-muted-foreground font-normal ml-2">
                          (Attempt {selectedComplaint.pickup_attempt_number + 1}/{selectedComplaint.max_pickup_attempts})
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Item needs to be picked up before processing refund/replacement.
                      {selectedComplaint.pickup_status === "attempt_failed" && (
                        <span className="text-orange-500 ml-1">
                          Previous attempt failed. {selectedComplaint.max_pickup_attempts - selectedComplaint.pickup_attempt_number} attempts remaining.
                        </span>
                      )}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                      <Button onClick={handleSchedulePickup} disabled={!pickupDate || isUpdating}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Pickup
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2b: For not_received - Direct refund option */}
                {selectedComplaint.investigation_status === "resolved_true" && 
                 selectedComplaint.complaint_type === "not_received" && 
                 !selectedComplaint.refund_status && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 2: Process Refund</h4>
                    <p className="text-sm text-muted-foreground">
                      No pickup needed for order not received. Customer already received 20% coupon.
                    </p>
                    <Button onClick={handleProcessRefund} disabled={isUpdating}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Initiate Refund (₹{selectedComplaint.order?.total_amount?.toLocaleString()})
                    </Button>
                  </div>
                )}

                {/* Step 3: Pickup Scheduled - Mark as Picked Up or Failed */}
                {selectedComplaint.pickup_status === "scheduled" && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 3: Confirm Pickup Result</h4>
                    <p className="text-sm text-muted-foreground">
                      Scheduled for: {format(new Date(selectedComplaint.pickup_scheduled_at!), "PPP")}
                      <span className="ml-2">(Attempt {selectedComplaint.pickup_attempt_number}/{selectedComplaint.max_pickup_attempts})</span>
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleMarkPickedUp} disabled={isUpdating} className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Pickup Successful
                      </Button>
                      <Button variant="outline" onClick={() => document.getElementById("failure-input")?.focus()}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Pickup Failed
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="failure-input"
                        placeholder="Failure reason (e.g., customer not available)"
                        value={failureReason}
                        onChange={(e) => setFailureReason(e.target.value)}
                      />
                      <Button 
                        variant="destructive" 
                        onClick={handlePickupFailed} 
                        disabled={!failureReason.trim() || isUpdating}
                      >
                        Mark Failed
                      </Button>
                    </div>
                  </div>
                )}

                {/* Return Failed - Admin manages */}
                {selectedComplaint.return_status === "failed" && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Return Failed - All {selectedComplaint.max_pickup_attempts} pickup attempts exhausted</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Customer has been notified. You may need to contact them directly to resolve this issue.
                    </p>
                  </div>
                )}

                {/* Step 4: Picked Up - Create Replacement or Refund */}
                {selectedComplaint.pickup_status === "picked_up" && 
                 !selectedComplaint.replacement_order_id && 
                 selectedComplaint.refund_status !== "completed" &&
                 !selectedComplaint.refund_status && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 4: Issue Resolution</h4>
                    <p className="text-sm text-muted-foreground">
                      Item has been picked up. {selectedComplaint.complaint_type === "return" 
                        ? "Process refund for return." 
                        : "Create replacement or process refund."
                      }
                    </p>
                    <div className="flex gap-2">
                      {selectedComplaint.complaint_type !== "return" && (
                        <Button onClick={handleCreateReplacement} disabled={isUpdating}>
                          <Package className="w-4 h-4 mr-2" />
                          Create Replacement Order
                        </Button>
                      )}
                      <Button variant={selectedComplaint.complaint_type === "return" ? "default" : "outline"} onClick={handleProcessRefund} disabled={isUpdating}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Process Refund
                      </Button>
                    </div>
                  </div>
                )}

                {/* Completion Status */}
                {(selectedComplaint.replacement_order_id || selectedComplaint.refund_status === "completed") && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">
                        {selectedComplaint.replacement_order_id 
                          ? `Replacement Order Created: #${selectedComplaint.replacement_order_id.slice(0, 8)}`
                          : "Refund Completed"
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Coupon Info - Only show for eligible types */}
                {selectedComplaint.coupon_code && selectedComplaint.complaint_type !== "return" && (
                  <div className="p-3 bg-primary/10 rounded-lg flex items-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      Coupon Generated: <code className="font-mono font-bold">{selectedComplaint.coupon_code}</code> (20% off)
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
