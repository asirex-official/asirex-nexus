import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, Loader2, CheckCircle, XCircle, Clock, 
  RefreshCw, Truck, Package, Gift, Search, Eye, Filter,
  Ban, RotateCcw, Shield
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
  DialogFooter,
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
  images: any;
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
  order?: {
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    total_amount: number;
    payment_method: string;
    items: any;
  };
}

export default function OrderComplaintsManager() {
  const [complaints, setComplaints] = useState<OrderComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("investigating");
  const [selectedComplaint, setSelectedComplaint] = useState<OrderComplaint | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchComplaints();
    setupRealtime();
  }, []);

  const setupRealtime = () => {
    const channel = supabase
      .channel("order_complaints_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_complaints" },
        () => {
          fetchComplaints();
          toast.info("Complaint list updated");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

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

    // Fetch order details for each complaint
    const complaintsWithOrders = await Promise.all(
      (data || []).map(async (complaint) => {
        const { data: order } = await supabase
          .from("orders")
          .select("customer_name, customer_email, customer_phone, total_amount, payment_method, items")
          .eq("id", complaint.order_id)
          .single();

        return { ...complaint, order };
      })
    );

    setComplaints(complaintsWithOrders);
    setIsLoading(false);
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
      console.error("Failed to send notification:", error);
    }
  };

  const handleResolveAsTrue = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);

    try {
      // Generate coupon code
      const couponCode = `SORRY${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create apology coupon with proper category, description and source
      await supabase.from("coupons").insert({
        code: couponCode,
        description: "We sincerely apologize for the inconvenience caused with your order. Please accept this 20% discount on your next purchase as our apology.",
        discount_type: "percentage",
        discount_value: 20,
        usage_limit: 1,
        per_user_limit: 1,
        is_active: true,
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        category: "apology",
        source: "apology_complaint",
      });

      // Update complaint
      await supabase
        .from("order_complaints")
        .update({
          investigation_status: "resolved_true",
          investigation_notes: adminNotes,
          coupon_code: couponCode,
          coupon_discount: 20,
        })
        .eq("id", selectedComplaint.id);

      // Update order status
      await supabase
        .from("orders")
        .update({ complaint_status: "resolved" })
        .eq("id", selectedComplaint.order_id);

      // Send notification
      await sendNotification(selectedComplaint, "complaint_approved", {
        couponCode,
        couponDiscount: 20,
      });

      toast.success("Complaint resolved - Coupon generated & customer notified");
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to resolve complaint");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolveAsFalse = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);

    try {
      await supabase
        .from("order_complaints")
        .update({
          investigation_status: "resolved_false",
          investigation_notes: adminNotes,
        })
        .eq("id", selectedComplaint.id);

      await supabase
        .from("orders")
        .update({ complaint_status: "false_report" })
        .eq("id", selectedComplaint.order_id);

      // Send rejection notification
      await sendNotification(selectedComplaint, "complaint_rejected", {
        rejectionReason: adminNotes || "Investigation determined the claim was not valid.",
      });

      toast.success("Marked as false report - Customer notified");
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to update complaint");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSchedulePickup = async () => {
    if (!selectedComplaint || !pickupDate) return;
    setIsUpdating(true);

    try {
      await supabase
        .from("order_complaints")
        .update({
          pickup_status: "scheduled",
          pickup_scheduled_at: new Date(pickupDate).toISOString(),
          admin_notes: adminNotes,
        })
        .eq("id", selectedComplaint.id);

      // Send pickup scheduled notification
      await sendNotification(selectedComplaint, "pickup_scheduled", {
        pickupDate: new Date(pickupDate).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      });

      toast.success("Pickup scheduled - Customer notified");
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to schedule pickup");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkPickedUp = async () => {
    if (!selectedComplaint) return;
    setIsUpdating(true);

    try {
      await supabase
        .from("order_complaints")
        .update({
          pickup_status: "picked_up",
          pickup_completed_at: new Date().toISOString(),
        })
        .eq("id", selectedComplaint.id);

      // Send pickup completed notification
      await sendNotification(selectedComplaint, "pickup_completed", {});

      toast.success("Marked as picked up - Customer notified");
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

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
          items: selectedComplaint.order.items,
          total_amount: 0,
          payment_status: "paid",
          payment_method: "replacement",
          order_status: "processing",
          order_type: selectedComplaint.complaint_type === "warranty" ? "warranty_replacement" : "replacement",
          parent_order_id: selectedComplaint.order_id,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("order_complaints")
        .update({
          replacement_order_id: newOrder.id,
          resolution_type: "replacement",
        })
        .eq("id", selectedComplaint.id);

      await sendNotification(selectedComplaint, "replacement_created", {
        replacementOrderId: newOrder.id,
      });

      toast.success("Replacement order created - Customer notified");
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create replacement order");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProcessRefund = async (refundMethod: string) => {
    if (!selectedComplaint) return;
    setIsUpdating(true);

    try {
      // Create refund request
      await supabase.from("refund_requests").insert({
        order_id: selectedComplaint.order_id,
        user_id: selectedComplaint.user_id,
        amount: selectedComplaint.order?.total_amount || 0,
        payment_method: selectedComplaint.order?.payment_method || "unknown",
        refund_method: refundMethod,
        reason: `Complaint: ${selectedComplaint.complaint_type}`,
        status: "pending",
      });

      // Update complaint
      await supabase
        .from("order_complaints")
        .update({
          refund_method: refundMethod,
          refund_status: "pending",
          resolution_type: "refund",
        })
        .eq("id", selectedComplaint.id);

      toast.success("Refund request created");
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to process refund");
    } finally {
      setIsUpdating(false);
    }
  };

  const getComplaintBadge = (type: string) => {
    switch (type) {
      case "not_received":
        return <Badge variant="destructive">Not Received</Badge>;
      case "damaged":
        return <Badge className="bg-orange-500">Damaged</Badge>;
      case "return":
        return <Badge className="bg-blue-500">Return</Badge>;
      case "replace":
        return <Badge className="bg-cyan-500">Replace</Badge>;
      case "warranty":
        return <Badge className="bg-purple-500">Warranty</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "investigating":
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Investigating</Badge>;
      case "resolved_true":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "resolved_false":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />False Report</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "investigating") return c.investigation_status === "investigating";
    if (activeTab === "resolved") return c.investigation_status.startsWith("resolved");
    if (activeTab === "pickup") return c.pickup_status === "scheduled" || c.pickup_status === "picked_up";
    return true;
  });

  const investigatingCount = complaints.filter(c => c.investigation_status === "investigating").length;

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
          <h1 className="font-display text-3xl font-bold mb-2">Order Complaints</h1>
          <p className="text-muted-foreground">
            Manage customer complaints and issues
          </p>
        </div>
        {investigatingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {investigatingCount} Pending Investigation
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="investigating" className="relative">
            Investigating
            {investigatingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {investigatingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="pickup">Pickup Required</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <Button variant="outline" size="sm" onClick={fetchComplaints}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>

      {filteredComplaints.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No complaints found</h3>
          <p className="text-muted-foreground">
            {activeTab === "investigating" 
              ? "No complaints pending investigation" 
              : "No complaints in this category"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint, index) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                  complaint.investigation_status === "investigating" 
                    ? "border-red-500/50 bg-red-500/5" 
                    : ""
                }`}
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setAdminNotes(complaint.admin_notes || "");
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      complaint.complaint_type === "warranty" 
                        ? "bg-purple-500/20" 
                        : "bg-orange-500/20"
                    }`}>
                      {complaint.complaint_type === "warranty" ? (
                        <Shield className="w-5 h-5 text-purple-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{complaint.order?.customer_name}</h3>
                        {getComplaintBadge(complaint.complaint_type)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Order: {complaint.order_id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">₹{complaint.order?.total_amount?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(complaint.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    {getStatusBadge(complaint.investigation_status)}
                  </div>
                </div>

                {complaint.pickup_status && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span>Pickup: {complaint.pickup_status}</span>
                    {complaint.pickup_scheduled_at && (
                      <span className="text-muted-foreground">
                        ({format(new Date(complaint.pickup_scheduled_at), "MMM d")})
                      </span>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Complaint Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Customer Info */}
                <Card className="p-4 bg-muted/30">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{selectedComplaint.order?.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedComplaint.order?.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Complaint Type</p>
                      {getComplaintBadge(selectedComplaint.complaint_type)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Order Amount</p>
                      <p className="font-medium">₹{selectedComplaint.order?.total_amount?.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Description</p>
                      <p className="font-medium">{selectedComplaint.description || "No description"}</p>
                    </div>
                  </div>
                </Card>

                {/* Images */}
                {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Attached Images</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedComplaint.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Evidence ${i + 1}`}
                          className="w-24 h-24 object-cover rounded-lg"
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
                    placeholder="Add investigation notes..."
                    className="mt-1"
                  />
                </div>

                {/* Actions based on status */}
                {selectedComplaint.investigation_status === "investigating" && (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="font-semibold">Resolution Actions</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleResolveAsTrue}
                        disabled={isUpdating}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify & Approve
                      </Button>
                      <Button
                        onClick={handleResolveAsFalse}
                        disabled={isUpdating}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Mark as False Report
                      </Button>
                    </div>
                  </div>
                )}

                {selectedComplaint.investigation_status === "resolved_true" && !selectedComplaint.pickup_status && (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="font-semibold">Schedule Pickup (for return/replace)</p>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                      />
                      <Button onClick={handleSchedulePickup} disabled={!pickupDate || isUpdating}>
                        <Truck className="w-4 h-4 mr-2" />
                        Schedule Pickup
                      </Button>
                    </div>
                  </div>
                )}

                {selectedComplaint.pickup_status === "scheduled" && (
                  <div className="pt-4 border-t">
                    <Button onClick={handleMarkPickedUp} disabled={isUpdating}>
                      <Package className="w-4 h-4 mr-2" />
                      Mark as Picked Up
                    </Button>
                  </div>
                )}

                {selectedComplaint.pickup_status === "picked_up" && !selectedComplaint.replacement_order_id && (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="font-semibold">Process Resolution</p>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateReplacement} disabled={isUpdating}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Create Replacement Order
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleProcessRefund("original")}
                        disabled={isUpdating}
                      >
                        Process Refund
                      </Button>
                    </div>
                  </div>
                )}

                {selectedComplaint.coupon_code && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm">
                      <Gift className="w-4 h-4 inline mr-2" />
                      Coupon Generated: <code className="font-mono font-bold">{selectedComplaint.coupon_code}</code>
                    </p>
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
