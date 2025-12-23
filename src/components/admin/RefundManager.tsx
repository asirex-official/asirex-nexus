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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

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
        (data || []).map(async (refund) => {
          const { data: orderData } = await supabase
            .from("orders")
            .select("customer_name, customer_email, customer_phone, total_amount, order_status")
            .eq("id", refund.order_id)
            .single();

          return {
            ...refund,
            order: orderData as OrderInfo | undefined,
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

  const handleApproveRefund = async (refund: RefundRequest) => {
    setProcessingId(refund.id);
    try {
      const { error } = await supabase
        .from("refund_requests")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
        })
        .eq("id", refund.id);

      if (error) throw error;

      // Send notification to user
      await supabase.from("notifications").insert({
        user_id: refund.user_id,
        title: "Refund Completed",
        message: `Your refund of ₹${refund.amount.toLocaleString()} has been processed via ${getRefundMethodLabel(refund.refund_method)}. If not received, please contact support.`,
        type: "refund",
        link: "/track-order",
      });

      toast.success("Refund marked as completed. User notified.");
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

      // Notify user
      await supabase.from("notifications").insert({
        user_id: refund.user_id,
        title: "Refund Issue",
        message: adminNotes || "There was an issue with your refund. Please contact support.",
        type: "refund",
        link: "/track-order",
      });

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
        return "Pending Selection";
      default:
        return method;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "pending":
      case "pending_user_selection":
        return "text-yellow-500 bg-yellow-500/10";
      case "processing":
        return "text-blue-500 bg-blue-500/10";
      case "failed":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const filteredRefunds = refunds.filter((r) => {
    if (activeTab === "pending") return r.status === "pending" || r.status === "pending_user_selection";
    if (activeTab === "completed") return r.status === "completed";
    if (activeTab === "failed") return r.status === "failed";
    return true;
  });

  const pendingCount = refunds.filter((r) => r.status === "pending" || r.status === "pending_user_selection").length;

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
            Process and track customer refunds • {pendingCount} pending
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
            <Clock className="w-4 h-4" />
            Pending
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                {pendingCount}
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
                return (
                  <motion.div
                    key={refund.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:border-primary/50 transition-all">
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
                                  {refund.status.replace(/_/g, " ").charAt(0).toUpperCase() +
                                    refund.status.replace(/_/g, " ").slice(1)}
                                </Badge>
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
                              {refund.reason && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Reason: {refund.reason}
                                </p>
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
                  <Badge className={`${getStatusColor(selectedRefund.status)} text-lg px-3 py-1`}>
                    {selectedRefund.status.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </div>

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
                  <Label>Refund Method</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const Icon = getRefundMethodIcon(selectedRefund.refund_method);
                        return <Icon className="w-5 h-5 text-primary" />;
                      })()}
                      <span className="font-medium">
                        {getRefundMethodLabel(selectedRefund.refund_method)}
                      </span>
                    </div>
                    {selectedRefund.upi_id && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">UPI ID:</span>{" "}
                        <span className="font-mono">{selectedRefund.upi_id}</span>
                      </p>
                    )}
                    {selectedRefund.bank_account_holder && (
                      <>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Account Holder:</span>{" "}
                          {selectedRefund.bank_account_holder}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Account Number:</span>{" "}
                          <span className="font-mono">****{selectedRefund.bank_account_number_encrypted?.slice(-4)}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">IFSC:</span>{" "}
                          <span className="font-mono">{selectedRefund.bank_ifsc_encrypted}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Reason */}
                {selectedRefund.reason && (
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <p className="text-sm p-3 bg-muted/50 rounded-lg">{selectedRefund.reason}</p>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedRefund.status === "pending" && (
                  <div className="space-y-2">
                    <Label>Admin Notes (Optional)</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any notes about this refund..."
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
