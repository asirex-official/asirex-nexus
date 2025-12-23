import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, CheckCircle, Truck, X, Phone, MapPin, RotateCcw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

interface DeliveryAttempt {
  id: string;
  attempt_number: number;
  scheduled_date: string;
  attempted_at: string | null;
  status: string;
  failure_reason: string | null;
  notes: string | null;
}

interface DeliveryAttemptsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  currentAttempts: DeliveryAttempt[];
  onUpdate: () => void;
}

const FAILURE_REASONS = [
  { id: "receiver_absent", label: "Receiver Not Available" },
  { id: "phone_switched_off", label: "Phone Switched Off / Unreachable" },
  { id: "refused", label: "Refused to Accept" },
  { id: "wrong_address", label: "Wrong Address" },
  { id: "other", label: "Other" },
];

export function DeliveryAttemptsManager({
  open,
  onOpenChange,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  paymentMethod,
  paymentStatus,
  totalAmount,
  currentAttempts,
  onUpdate,
}: DeliveryAttemptsManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [failureReason, setFailureReason] = useState("receiver_absent");
  const [notes, setNotes] = useState("");
  const [showFailedDialog, setShowFailedDialog] = useState(false);

  const attemptCount = currentAttempts.length;
  const failedAttempts = currentAttempts.filter((a) => a.status === "failed").length;
  const latestAttempt = currentAttempts[currentAttempts.length - 1];
  const isMaxAttempts = failedAttempts >= 3;

  const handleScheduleAttempt = async () => {
    if (!scheduledDate) {
      toast.error("Please select a delivery date");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("delivery_attempts").insert({
        order_id: orderId,
        attempt_number: attemptCount + 1,
        scheduled_date: scheduledDate,
        status: "scheduled",
        notes,
      });

      if (error) throw error;

      // Update order with delivery status
      await supabase
        .from("orders")
        .update({
          delivery_status: "attempt_scheduled",
        })
        .eq("id", orderId);

      toast.success(`Delivery attempt ${attemptCount + 1} scheduled for ${format(new Date(scheduledDate), "MMM d, yyyy")}`);
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error scheduling attempt:", error);
      toast.error(error.message || "Failed to schedule delivery attempt");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkFailed = async () => {
    if (!latestAttempt) return;

    setIsLoading(true);
    try {
      // Update the attempt as failed
      const { error } = await supabase
        .from("delivery_attempts")
        .update({
          status: "failed",
          failure_reason: failureReason,
          notes,
          attempted_at: new Date().toISOString(),
        })
        .eq("id", latestAttempt.id);

      if (error) throw error;

      const newFailedCount = failedAttempts + 1;

      if (newFailedCount >= 3) {
        // Mark order as returning to provider
        await supabase
          .from("orders")
          .update({
            order_status: "cancelled",
            delivery_status: "returning_to_provider",
            returning_to_provider: true,
            return_reason: `Multiple failed delivery attempts: ${FAILURE_REASONS.find((r) => r.id === failureReason)?.label}`,
          })
          .eq("id", orderId);

        // If payment was made (not COD), initiate refund flow
        if (paymentMethod?.toLowerCase() !== "cod" && paymentStatus === "paid") {
          // Create refund request with email link
          const linkToken = await generateRefundToken();
          const { error: refundError } = await supabase.from("refund_requests").insert({
            order_id: orderId,
            user_id: (await supabase.from("orders").select("user_id").eq("id", orderId).single()).data?.user_id,
            amount: totalAmount,
            payment_method: paymentMethod,
            refund_method: "pending_selection",
            status: "pending_user_selection",
            link_token: linkToken,
            link_expires_at: addDays(new Date(), 7).toISOString(),
            reason: "Failed delivery attempts",
          });

          if (refundError) console.error("Error creating refund:", refundError);

          // Send email notification
          await supabase.functions.invoke("send-failed-delivery-email", {
            body: {
              orderId,
              customerName,
              customerEmail,
              totalAmount,
              refundToken: linkToken,
              failureReason: FAILURE_REASONS.find((r) => r.id === failureReason)?.label,
            },
          });

          toast.success("Order marked as returning to provider. Refund email sent to customer.");
        } else {
          // COD order - just close it
          await supabase.from("notifications").insert({
            user_id: (await supabase.from("orders").select("user_id").eq("id", orderId).single()).data?.user_id,
            title: "Order Cancelled - Delivery Failed",
            message: `Your order couldn't be delivered after 3 attempts. Reason: ${FAILURE_REASONS.find((r) => r.id === failureReason)?.label}`,
            type: "order",
            link: `/track-order`,
          });

          toast.success("COD order marked as failed. Customer notified.");
        }
      } else {
        // Update order delivery status
        await supabase
          .from("orders")
          .update({
            delivery_status: `attempt_${newFailedCount}_failed`,
          })
          .eq("id", orderId);

        toast.info(`Attempt ${newFailedCount} marked as failed. ${3 - newFailedCount} attempt(s) remaining.`);
      }

      onUpdate();
      setShowFailedDialog(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!latestAttempt) return;

    setIsLoading(true);
    try {
      await supabase
        .from("delivery_attempts")
        .update({
          status: "success",
          attempted_at: new Date().toISOString(),
        })
        .eq("id", latestAttempt.id);

      await supabase
        .from("orders")
        .update({
          order_status: "delivered",
          delivery_status: "delivered",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      toast.success("Order marked as delivered!");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRefundToken = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              Delivery Attempts Manager
            </DialogTitle>
            <DialogDescription>
              Manage delivery attempts for {customerName}'s order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Status */}
            <div className={`p-4 rounded-lg border-2 ${
              isMaxAttempts
                ? "bg-red-500/10 border-red-500/30"
                : failedAttempts > 0
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-muted/50 border-border"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Delivery Status</span>
                {isMaxAttempts ? (
                  <Badge variant="destructive" className="gap-1">
                    <X className="w-3 h-3" /> Returning to Provider
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Truck className="w-3 h-3" /> Attempt {attemptCount}/3
                  </Badge>
                )}
              </div>
              
              {failedAttempts > 0 && !isMaxAttempts && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {failedAttempts} failed attempt(s). {3 - failedAttempts} remaining.
                </p>
              )}

              {isMaxAttempts && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <RotateCcw className="w-4 h-4" />
                  Order is being returned after 3 failed attempts.
                  {paymentMethod?.toLowerCase() !== "cod" && paymentStatus === "paid" && (
                    <span className="font-medium ml-1">Refund link sent to customer.</span>
                  )}
                </p>
              )}
            </div>

            {/* Attempt History */}
            {currentAttempts.length > 0 && (
              <div className="space-y-2">
                <Label>Attempt History</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className={`p-3 rounded-lg border ${
                        attempt.status === "success"
                          ? "bg-green-500/10 border-green-500/30"
                          : attempt.status === "failed"
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-yellow-500/10 border-yellow-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Attempt {attempt.attempt_number}</span>
                        <Badge
                          variant={
                            attempt.status === "success"
                              ? "default"
                              : attempt.status === "failed"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {attempt.status === "success" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {attempt.status === "failed" && <X className="w-3 h-3 mr-1" />}
                          {attempt.status === "scheduled" && <Calendar className="w-3 h-3 mr-1" />}
                          {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Scheduled: {format(new Date(attempt.scheduled_date), "MMM d, yyyy")}
                      </p>
                      {attempt.failure_reason && (
                        <p className="text-sm text-red-500">
                          Reason: {FAILURE_REASONS.find((r) => r.id === attempt.failure_reason)?.label}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule New Attempt */}
            {!isMaxAttempts && (
              <>
                {latestAttempt?.status === "scheduled" ? (
                  // Show action buttons for scheduled attempt
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Current Scheduled Attempt</h4>
                      <p className="text-sm text-muted-foreground">
                        Attempt {latestAttempt.attempt_number} scheduled for{" "}
                        <span className="font-medium text-foreground">
                          {format(new Date(latestAttempt.scheduled_date), "MMMM d, yyyy")}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleMarkDelivered}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Delivered Successfully
                      </Button>
                      <Button
                        onClick={() => setShowFailedDialog(true)}
                        disabled={isLoading}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Failed
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Schedule new attempt
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Schedule Delivery Date</Label>
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={format(new Date(), "yyyy-MM-dd")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special delivery instructions..."
                        rows={2}
                      />
                    </div>

                    <Button
                      onClick={handleScheduleAttempt}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Calendar className="w-4 h-4 mr-2" />
                      )}
                      Schedule Attempt {attemptCount + 1}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Customer Contact */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Customer Contact
              </h4>
              <p className="text-sm">{customerName}</p>
              <p className="text-sm text-muted-foreground">{customerEmail}</p>
              {customerPhone && (
                <p className="text-sm text-primary font-mono">{customerPhone}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Failed Attempt Dialog */}
      <Dialog open={showFailedDialog} onOpenChange={setShowFailedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Mark Delivery as Failed
            </DialogTitle>
            <DialogDescription>
              {failedAttempts + 1 >= 3 ? (
                <span className="text-red-500 font-medium">
                  This is the final attempt. The order will be marked as returning to provider.
                </span>
              ) : (
                `This will count as failed attempt ${failedAttempts + 1} of 3.`
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Failure Reason</Label>
              <Select value={failureReason} onValueChange={setFailureReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FAILURE_REASONS.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFailedDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleMarkFailed} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Failed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
