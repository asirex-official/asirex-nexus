import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Banknote, CreditCard, Gift, CheckCircle, Clock, AlertTriangle, Eye, Loader2,
  Building, Smartphone, RefreshCw, ExternalLink, User, Package, Calendar,
  AlertCircle, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, differenceInHours } from "date-fns";

interface RefundRequest {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  refund_method: string;
  bank_account_holder: string | null;
  bank_account_number_encrypted: string | null;
  bank_ifsc_encrypted: string | null;
  upi_id: string | null;
  gift_card_id: string | null;
  reason: string | null;
  status: string;
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  link_token: string | null;
  link_expires_at: string | null;
  email_sent_at: string | null;
  late_refund_coupon_code: string | null;
  late_refund_coupon_sent: boolean;
}

interface OrderInfo {
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total_amount: number;
  order_status: string;
}

export function RefundManager() {
  const [refunds, setRefunds] = useState<(RefundRequest & { order?: OrderInfo })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<(RefundRequest & { order?: OrderInfo }) | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchRefunds();
    // Realtime subscription
    const channel = supabase
      .channel("refunds_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "refund_requests" }, fetchRefunds)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRefunds = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("refund_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch order info for each refund
      const refundsWithOrders = await Promise.all(
        (data || []).map(async (refund: any) => {
          const { data: orderData } = await supabase
            .from("orders")
            .select("customer_name, customer_email, customer_phone, total_amount, order_status")
            .eq("id", refund.order_id)
            .single();

          return {
            ...refund,
            order: orderData as OrderInfo | undefined,
            late_refund_coupon_code: refund.late_refund_coupon_code || null,
            late_refund_coupon_sent: refund.late_refund_coupon_sent || false,
          };
        })
      );

      setRefunds(refundsWithOrders);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error("Failed to load refund requests");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if refund took more than 1 day - eligible for late refund coupon
  const isLateRefund = (refund: RefundRequest) => {
    const createdAt = new Date(refund.created_at);
    const now = new Date();
    return differenceInHours(now, createdAt) >= 24;
  };

  const handleApproveRefund = async (refund: RefundRequest & { order?: OrderInfo }) => {
    setProcessingId(refund.id);
    try {
      const isLate = isLateRefund(refund);
      let couponCode: string | null = null;

      // If refund took more than 1 day, generate apology coupon
      if (isLate && !refund.late_refund_coupon_code) {
        couponCode = `DELAY${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await supabase.from("coupons").insert({
          code: couponCode,
          description: "We apologize for the delay in processing your refund. As a token of our apology, please enjoy 20% off your next order. We value your patience and business.",
          discount_type: "percentage",
          discount_value: 20,
          usage_limit: 1,
          per_user_limit: 1,
          is_active: true,
          category: "apology",
          source: "apology_refund_delay",
          valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      const { error } = await supabase
        .from("refund_requests")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
          late_refund_coupon_code: couponCode || refund.late_refund_coupon_code,
          late_refund_coupon_sent: isLate,
        })
        .eq("id", refund.id);

      if (error) throw error;

      // Update order complaint refund status
      await supabase
        .from("order_complaints")
        .update({ refund_status: "completed" })
        .eq("order_id", refund.order_id);

      // Send notification to user
      let message = `Your refund of ₹${refund.amount.toLocaleString()} has been processed via ${getRefundMethodLabel(refund.refund_method)}.`;
      if (isLate && couponCode) {
        message += ` As an apology for the delay, here's a 20% discount code: ${couponCode}`;
      }

      await supabase.from("notifications").insert({
        user_id: refund.user_id,
        title: "Refund Completed! 🎉",
        message,
        type: "refund",
        link: "/track-order",
      });

      // Send email notification
      try {
        await supabase.functions.invoke("send-unified-notification", {
          body: {
            type: "refund_completed",
            userId: refund.user_id,
            userEmail: refund.order?.customer_email,
            userName: refund.order?.customer_name,
            data: {
              amount: refund.amount,
              method: getRefundMethodLabel(refund.refund_method),
              giftCardCode: isLate ? couponCode : null,
            },
            sendEmail: true,
            sendInApp: false, // Already sent above
          },
        });
      } catch (e) {
        console.error("Email notification failed:", e);
      }

      const toastMessage = isLate 
        ? `Refund completed with 20% apology coupon for delay`
        : "Refund marked as completed. User notified.";
      toast.success(toastMessage);
      setSelectedRefund(null);
      setAdminNotes("");
      fetchRefunds();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to process refund");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRefund = async (refund: RefundRequest) => {
    setProcessingId(refund.id);
    try {
      const { error } = await supabase
        .from("refund_requests")
        .update({
          status: "failed",
          admin_notes: adminNotes || "Refund request rejected",
        })
        .eq("id", refund.id);

      if (error) throw error;

      // Notify user via in-app and email
      await supabase.from("notifications").insert({
        user_id: refund.user_id,
        title: "Refund Issue",
        message: adminNotes || "There was an issue with your refund. Please contact support.",
        type: "refund",
        link: "/track-order",
      });

      // Send email
      try {
        await supabase.functions.invoke("send-unified-notification", {
          body: {
            type: "refund_rejected",
            userId: refund.user_id,
            userEmail: (refund as any).order?.customer_email,
            userName: (refund as any).order?.customer_name,
            data: { reason: adminNotes },
            sendEmail: true,
            sendInApp: false,
          },
        });
      } catch (e) {
        console.error("Email notification failed:", e);
      }

      toast.info("Refund marked as failed. User notified.");
      setSelectedRefund(null);
      setAdminNotes("");
      fetchRefunds();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to update");
    } finally {
      setProcessingId(null);
    }
  };

  const getRefundMethodIcon = (method: string) => {
    switch (method) {
      case "gift_card":
        return Gift;
      case "upi":
        return Smartphone;
      case "bank":
        return Building;
      case "pending_selection":
        return Clock;
      default:
        return CreditCard;
    }
  };

  const getRefundMethodLabel = (method: string) => {
    switch (method) {
      case "gift_card":
        return "Gift Card";
      case "upi":
        return "UPI";
      case "bank":
        return "Bank Transfer";
      case "pending_selection":
        return "Awaiting User Selection";
      default:
        return method;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "pending_user_selection":
        return "text-orange-500 bg-orange-500/10";
      case "processing":
        return "text-blue-500 bg-blue-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const filteredRefunds = refunds.filter((r) => {
    if (activeTab === "pending") return r.status === "pending";
    if (activeTab === "awaiting") return r.status === "pending_user_selection";
    if (activeTab === "completed") return r.status === "completed";
    if (activeTab === "failed") return r.status === "failed";
    return true;
  });

  const pendingCount = refunds.filter((r) => r.status === "pending").length;
  const awaitingCount = refunds.filter((r) => r.status === "pending_user_selection").length;

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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Banknote className="w-6 h-6 text-green-500" />
            Refund Management
          </h2>
          <p className="text-muted-foreground">
            Process and track customer refunds • {pendingCount} ready to pay • {awaitingCount} awaiting user
          </p>
        </div>
        <Button variant="outline" onClick={fetchRefunds}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1">
            <CreditCard className="w-4 h-4" />
            Ready to Pay
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="awaiting" className="gap-1">
            <Clock className="w-4 h-4" />
            Awaiting User
            {awaitingCount > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 justify-center bg-orange-500">
                {awaitingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1">
            <CheckCircle className="w-4 h-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="failed" className="gap-1">
            <AlertTriangle className="w-4 h-4" />
            Failed
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredRefunds.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Banknote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No refund requests in this category</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRefunds.map((refund, index) => {
                const MethodIcon = getRefundMethodIcon(refund.refund_method);
                const isLate = isLateRefund(refund);
                
                return (
                  <motion.div
                    key={refund.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`hover:border-primary/50 transition-all ${
                      isLate && refund.status === "pending" ? "border-orange-500/50 bg-orange-500/5" : ""
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${getStatusColor(refund.status)}`}>
                              <MethodIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-lg">
                                  ₹{refund.amount.toLocaleString()}
                                </span>
                                <Badge className={getStatusColor(refund.status)}>
                                  {refund.status === "pending_user_selection" 
                                    ? "Awaiting User" 
                                    : refund.status.charAt(0).toUpperCase() + refund.status.slice(1)
                                  }
                                </Badge>
                                {isLate && refund.status === "pending" && (
                                  <Badge className="bg-orange-500">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Delayed &gt;24h
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span>{refund.order?.customer_name || "Unknown"}</span>
                                <span>•</span>
                                <span>{refund.order?.customer_email}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <MethodIcon className="w-3 h-3" />
                                  {getRefundMethodLabel(refund.refund_method)}
                                </span>
                                {refund.upi_id && (
                                  <span className="font-mono text-primary">{refund.upi_id}</span>
                                )}
                                {refund.bank_ifsc_encrypted && (
                                  <span className="font-mono">IFSC: {refund.bank_ifsc_encrypted}</span>
                                )}
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(refund.created_at), "MMM d, yyyy")}
                                </span>
                              </div>
                              {refund.late_refund_coupon_code && (
                                <div className="mt-2 flex items-center gap-1 text-sm text-orange-600">
                                  <Gift className="w-3 h-3" />
                                  <span>Late coupon: <code className="font-mono">{refund.late_refund_coupon_code}</code></span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRefund(refund)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Refund Detail Dialog */}
      <Dialog open={!!selectedRefund} onOpenChange={() => setSelectedRefund(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedRefund && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-green-500" />
                  Refund Details
                </DialogTitle>
                <DialogDescription>
                  Review and process this refund request
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Amount & Status */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-2xl font-bold">₹{selectedRefund.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Refund Amount</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getStatusColor(selectedRefund.status)} text-lg px-3 py-1`}>
                      {selectedRefund.status === "pending_user_selection" 
                        ? "AWAITING USER" 
                        : selectedRefund.status.replace(/_/g, " ").toUpperCase()
                      }
                    </Badge>
                    {isLateRefund(selectedRefund) && selectedRefund.status === "pending" && (
                      <p className="text-xs text-orange-500 mt-1">Delayed &gt;24 hours - will get coupon</p>
                    )}
                  </div>
                </div>

                {/* Awaiting User Selection Notice */}
                {selectedRefund.status === "pending_user_selection" && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Waiting for Customer</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customer needs to select their preferred refund method (Gift Card, UPI, or Bank Transfer).
                      They will be prompted to do so in Track Order.
                    </p>
                  </div>
                )}

                {/* Customer Info */}
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{selectedRefund.order?.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedRefund.order?.customer_email}</p>
                    {selectedRefund.order?.customer_phone && (
                      <p className="text-sm font-mono">{selectedRefund.order.customer_phone}</p>
                    )}
                  </div>
                </div>

                {/* Refund Method Details */}
                <div className="space-y-2">
                  <Label>Refund Method & Payment Details</Label>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      {(() => {
                        const Icon = getRefundMethodIcon(selectedRefund.refund_method);
                        return <Icon className="w-5 h-5 text-primary" />;
                      })()}
                      <span className="font-semibold text-lg">
                        {getRefundMethodLabel(selectedRefund.refund_method)}
                      </span>
                    </div>
                    
                    {/* UPI Details */}
                    {selectedRefund.upi_id && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">UPI ID:</span>
                          <span className="font-mono font-bold text-primary text-lg">{selectedRefund.upi_id.split(' (')[0]}</span>
                        </div>
                        {selectedRefund.upi_id.includes('(') && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Name:</span>
                            <span className="font-medium">{selectedRefund.upi_id.match(/\(([^)]+)\)/)?.[1]}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Bank Details */}
                    {selectedRefund.bank_account_holder && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Account Holder:</span>
                          <span className="font-medium">{selectedRefund.bank_account_holder.split(' | ')[0]}</span>
                        </div>
                        {selectedRefund.bank_account_holder.includes('Bank:') && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Bank Name:</span>
                            <span className="font-medium">{selectedRefund.bank_account_holder.split('Bank: ')[1]}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Account Number:</span>
                          <span className="font-mono font-bold text-primary">{selectedRefund.bank_account_number_encrypted}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">IFSC Code:</span>
                          <span className="font-mono font-bold">{selectedRefund.bank_ifsc_encrypted}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Gift Card Info */}
                    {selectedRefund.refund_method === "gift_card" && (
                      <p className="text-sm text-muted-foreground">
                        Gift card will be auto-generated and credited to user's account instantly.
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Instructions for Admin */}
                {selectedRefund.status === "pending" && selectedRefund.refund_method !== "gift_card" && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Payment Instructions
                    </h4>
                    <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                      {selectedRefund.refund_method === "upi" && (
                        <>
                          <li>Open your UPI app (PhonePe, GPay, Paytm, etc.)</li>
                          <li>Send ₹{selectedRefund.amount.toLocaleString()} to <code className="font-mono text-primary">{selectedRefund.upi_id}</code></li>
                          <li>Take a screenshot of the successful payment</li>
                          <li>Click "Mark as Completed" below</li>
                        </>
                      )}
                      {selectedRefund.refund_method === "bank" && (
                        <>
                          <li>Open your bank's NEFT/IMPS portal</li>
                          <li>Transfer ₹{selectedRefund.amount.toLocaleString()} to:</li>
                          <li className="ml-4">Name: <strong>{selectedRefund.bank_account_holder?.split(' | ')[0]}</strong></li>
                          <li className="ml-4">Bank: <strong>{selectedRefund.bank_account_holder?.split('Bank: ')[1]}</strong></li>
                          <li className="ml-4">A/C: <strong className="font-mono text-primary">{selectedRefund.bank_account_number_encrypted}</strong></li>
                          <li className="ml-4">IFSC: <strong className="font-mono">{selectedRefund.bank_ifsc_encrypted}</strong></li>
                          <li>Save the transaction reference</li>
                          <li>Click "Mark as Completed" below</li>
                        </>
                      )}
                    </ol>
                  </div>
                )}

                {/* Reason */}
                {selectedRefund.reason && (
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedRefund.reason}</p>
                  </div>
                )}

                {/* Late Refund Coupon Info */}
                {isLateRefund(selectedRefund) && selectedRefund.status === "pending" && (
                  <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-600">
                      <Gift className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        This refund is delayed (&gt;24h). A 20% apology coupon will be automatically generated when you complete it.
                      </span>
                    </div>
                  </div>
                )}

                {/* Completed Late Coupon */}
                {selectedRefund.late_refund_coupon_code && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600">
                      <Gift className="w-4 h-4" />
                      <span className="text-sm">
                        Late refund coupon: <code className="font-mono font-bold">{selectedRefund.late_refund_coupon_code}</code> (20% off)
                      </span>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedRefund.status === "pending" && (
                  <div className="space-y-2">
                    <Label>Admin Notes (Optional)</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add transaction reference or notes..."
                      rows={2}
                    />
                  </div>
                )}

                {selectedRefund.admin_notes && selectedRefund.status !== "pending" && (
                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedRefund.admin_notes}</p>
                  </div>
                )}

                {/* Processed Info */}
                {selectedRefund.processed_at && (
                  <p className="text-sm text-muted-foreground">
                    Processed on {format(new Date(selectedRefund.processed_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                )}
              </div>

              {selectedRefund.status === "pending" && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectRefund(selectedRefund)}
                    disabled={processingId === selectedRefund.id}
                  >
                    {processingId === selectedRefund.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveRefund(selectedRefund)}
                    disabled={processingId === selectedRefund.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processingId === selectedRefund.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Mark as Completed
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
