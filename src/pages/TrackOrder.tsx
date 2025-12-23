import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Calendar, ArrowLeft, Loader2, Search, XCircle, AlertTriangle, Ban, RotateCcw, MessageSquare, Shield, Star, Edit2, FileText, Headphones, Download } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OrderCancellationDialog } from "@/components/orders/OrderCancellationDialog";
import { PostDeliveryActionModal } from "@/components/orders/PostDeliveryActionModal";
import { RefundSelectionDialog } from "@/components/orders/RefundSelectionDialog";
import { ProductReviewForm } from "@/components/orders/ProductReviewForm";
import { DamageReportForm } from "@/components/orders/DamageReportForm";
import { ReturnReplaceForm } from "@/components/orders/ReturnReplaceForm";
import { toast } from "sonner";
import { useLiveChat } from "@/hooks/useLiveChat";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generateInvoicePDF } from "@/utils/invoiceGenerator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface DeliveryAttempt {
  id: string;
  attempt_number: number;
  scheduled_date: string;
  status: string;
  failure_reason?: string;
  notes?: string;
}

interface Order {
  id: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  items: OrderItem[];
  shipping_address: string;
  tracking_number: string | null;
  tracking_provider: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  delivery_status: string | null;
  returning_to_provider: boolean;
  customer_phone: string | null;
  notes: string | null;
}

const ORDER_STATUSES = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function TrackOrder() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { openChat } = useLiveChat();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryAttempts, setDeliveryAttempts] = useState<DeliveryAttempt[]>([]);
  
  // Dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPostDeliveryModal, setShowPostDeliveryModal] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [showUpdatePhoneDialog, setShowUpdatePhoneDialog] = useState(false);
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false);
  
  // Form states
  const [newPhone, setNewPhone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/track-order");
      return;
    }

    if (user) {
      fetchUserOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchUserOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedOrders: Order[] = (data || []).map((order) => {
        let parsedItems: OrderItem[] = [];
        if (Array.isArray(order.items)) {
          parsedItems = order.items as unknown as OrderItem[];
        }
        
        return {
          id: order.id,
          created_at: order.created_at,
          order_status: order.order_status || "pending",
          payment_status: order.payment_status || "pending",
          payment_method: order.payment_method || "cod",
          total_amount: order.total_amount,
          items: parsedItems,
          shipping_address: order.shipping_address || "",
          tracking_number: order.tracking_number,
          tracking_provider: order.tracking_provider,
          shipped_at: order.shipped_at,
          delivered_at: order.delivered_at,
          delivery_status: order.delivery_status,
          returning_to_provider: order.returning_to_provider || false,
          customer_phone: order.customer_phone,
          notes: order.notes,
        };
      });

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveryAttempts = async (orderId: string) => {
    const { data, error } = await supabase
      .from("delivery_attempts")
      .select("*")
      .eq("order_id", orderId)
      .order("attempt_number", { ascending: true });

    if (!error && data) {
      setDeliveryAttempts(data as DeliveryAttempt[]);
    }
  };

  useEffect(() => {
    if (selectedOrder) {
      fetchDeliveryAttempts(selectedOrder.id);
    } else {
      setDeliveryAttempts([]);
    }
  }, [selectedOrder?.id]);

  const getStatusIndex = (status: string) => {
    if (status === "cancelled") return -1;
    const index = ORDER_STATUSES.findIndex((s) => s.key === status);
    return index >= 0 ? index : 0;
  };

  const getEstimatedDelivery = (order: Order) => {
    const createdDate = new Date(order.created_at);
    
    if (order.order_status === "delivered") {
      return "Delivered";
    }

    if (order.order_status === "cancelled") {
      return "Cancelled";
    }
    
    if (order.shipped_at) {
      const shippedDate = new Date(order.shipped_at);
      const deliveryDate = new Date(shippedDate);
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      return `Expected by ${deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
    }
    
    const minDate = new Date(createdDate);
    minDate.setDate(minDate.getDate() + 7);
    const maxDate = new Date(createdDate);
    maxDate.setDate(maxDate.getDate() + 10);
    
    return `Expected ${minDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${maxDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
  };

  const getOrderStatusDisplay = (order: Order) => {
    // Check for delivery failures
    if (order.returning_to_provider) {
      if (order.payment_method === "cod") {
        return {
          text: "Order Failed – COD",
          color: "bg-red-500/20 text-red-500",
          icon: Ban,
          isError: true,
        };
      }
      return {
        text: "Delivery Failed – Returning to Provider",
        color: "bg-red-500/20 text-red-500",
        icon: AlertTriangle,
        isError: true,
        showRefund: order.payment_status === "paid",
      };
    }

    // Check for failed delivery attempts
    const failedAttempts = deliveryAttempts.filter(a => a.status === "failed");
    const scheduledAttempt = deliveryAttempts.find(a => a.status === "scheduled");
    
    if (failedAttempts.length > 0 && scheduledAttempt) {
      return {
        text: `Delivery attempt failed – next delivery scheduled on ${new Date(scheduledAttempt.scheduled_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        color: "bg-yellow-500/20 text-yellow-500",
        icon: AlertTriangle,
        isWarning: true,
      };
    }

    // Regular statuses
    if (order.order_status === "cancelled") {
      return {
        text: "Order Cancelled",
        color: "bg-red-500/20 text-red-500",
        icon: XCircle,
        isCancelled: true,
      };
    }

    if (order.order_status === "delivered") {
      return {
        text: "Delivered",
        color: "bg-green-500/20 text-green-500",
        icon: CheckCircle,
      };
    }

    if (order.order_status === "shipped") {
      return {
        text: "Shipped",
        color: "bg-blue-500/20 text-blue-500",
        icon: Truck,
      };
    }

    if (order.order_status === "processing") {
      return {
        text: "Processing",
        color: "bg-yellow-500/20 text-yellow-500",
        icon: Package,
      };
    }

    return {
      text: "Order Placed",
      color: "bg-muted text-muted-foreground",
      icon: Clock,
    };
  };

  const canCancelOrder = (order: Order) => {
    // Can only cancel if order status is "pending" (Order Placed)
    // Once order moves to "processing", "shipped", or "delivered" - cancellation is NOT available
    const cancellableStatuses = ["pending", "placed"];
    return cancellableStatuses.includes(order.order_status?.toLowerCase() || "") && !order.returning_to_provider;
  };

  const isOrderActive = (order: Order) => {
    return ["pending", "processing", "shipped"].includes(order.order_status) && !order.returning_to_provider;
  };

  const handleUpdatePhone = async () => {
    if (!selectedOrder || !newPhone.trim()) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ customer_phone: newPhone.trim() })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      setSelectedOrder({ ...selectedOrder, customer_phone: newPhone.trim() });
      setShowUpdatePhoneDialog(false);
      toast.success("Phone number updated");
      fetchUserOrders();
    } catch (error) {
      toast.error("Failed to update phone number");
    }
  };

  const handleUpdateInstructions = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ notes: deliveryInstructions.trim() })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      setSelectedOrder({ ...selectedOrder, notes: deliveryInstructions.trim() });
      setShowInstructionsDialog(false);
      toast.success("Delivery instructions updated");
      fetchUserOrders();
    } catch (error) {
      toast.error("Failed to update instructions");
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    // Get user details
    const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Valued Customer";
    const userEmail = user?.email;
    
    // Generate professional PDF invoice with hidden verification
    generateInvoicePDF(order, userName, userEmail);
    
    toast.success("Invoice downloaded as PDF");
  };

  const handlePostDeliveryAction = (action: string) => {
    setShowPostDeliveryModal(false);
    
    switch (action) {
      case "review":
        setShowReviewForm(true);
        break;
      case "not_received":
      case "damaged":
        setShowDamageForm(true);
        break;
      case "return":
        setShowReturnForm(true);
        break;
      case "warranty":
        navigate("/warranty-claims");
        break;
    }
  };

  const handleOrderCancelled = () => {
    fetchUserOrders();
    setSelectedOrder(null);
    toast.success("Order cancelled successfully");
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Loading your orders...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-4xl font-bold mb-2">
              Track <span className="gradient-text">Orders</span>
            </h1>
            <p className="text-muted-foreground">View and track all your orders</p>
          </motion.div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Package className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h2 className="font-display text-2xl font-bold mb-4">No Orders Yet</h2>
              <p className="text-muted-foreground mb-8">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <Button variant="hero" onClick={() => navigate("/shop")}>
                Browse Products
              </Button>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Orders List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="font-semibold text-lg mb-4">Your Orders ({orders.length})</h2>
                {orders.map((order, index) => {
                  const statusDisplay = getOrderStatusDisplay(order);
                  const StatusIcon = statusDisplay.icon;
                  
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedOrder(order)}
                      className={`glass-card p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        selectedOrder?.id === order.id ? "border-primary ring-2 ring-primary/20" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${statusDisplay.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusDisplay.text.split("–")[0].trim()}
                        </span>
                      </div>
                      <p className="font-medium">
                        {order.items.length} item{order.items.length > 1 ? "s" : ""}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ₹{order.total_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {getEstimatedDelivery(order)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {/* Order Details */}
              <div className="lg:col-span-2">
                {selectedOrder ? (
                  <motion.div
                    key={selectedOrder.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-display text-xl font-bold">Order Details</h2>
                        <p className="text-sm text-muted-foreground">
                          Order ID: {selectedOrder.id.slice(0, 8)}...
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                    </div>

                    {/* Status Alert */}
                    {(() => {
                      const statusDisplay = getOrderStatusDisplay(selectedOrder);
                      if (statusDisplay.isError || statusDisplay.isWarning) {
                        const StatusIcon = statusDisplay.icon;
                        return (
                          <div className={`mb-6 p-4 rounded-lg ${statusDisplay.isError ? "bg-red-500/10 border border-red-500/30" : "bg-yellow-500/10 border border-yellow-500/30"}`}>
                            <div className="flex items-center gap-3">
                              <StatusIcon className={`w-6 h-6 ${statusDisplay.isError ? "text-red-500" : "text-yellow-500"}`} />
                              <div className="flex-1">
                                <p className={`font-semibold ${statusDisplay.isError ? "text-red-500" : "text-yellow-500"}`}>
                                  {statusDisplay.text}
                                </p>
                                {statusDisplay.showRefund && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Your payment is being processed for refund.
                                  </p>
                                )}
                              </div>
                              {statusDisplay.showRefund && (
                                <Button 
                                  size="sm" 
                                  onClick={() => setShowRefundDialog(true)}
                                  className="bg-primary"
                                >
                                  Select Refund Method
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Progress Timeline */}
                    {selectedOrder.order_status !== "cancelled" && !selectedOrder.returning_to_provider && (
                      <div className="mb-8">
                        <h3 className="font-semibold mb-4">Order Progress</h3>
                        <div className="flex items-center justify-between relative">
                          <div className="absolute top-5 left-0 right-0 h-1 bg-muted" />
                          <div
                            className="absolute top-5 left-0 h-1 bg-primary transition-all"
                            style={{
                              width: `${(getStatusIndex(selectedOrder.order_status) / (ORDER_STATUSES.length - 1)) * 100}%`,
                            }}
                          />
                          {ORDER_STATUSES.map((status, index) => {
                            const Icon = status.icon;
                            const isActive = getStatusIndex(selectedOrder.order_status) >= index;
                            const isCurrent = selectedOrder.order_status === status.key;
                            return (
                              <div key={status.key} className="relative z-10 flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isActive
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  } ${isCurrent ? "ring-4 ring-primary/30" : ""}`}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <span
                                  className={`text-xs mt-2 ${
                                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                                  }`}
                                >
                                  {status.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Delivery Attempts */}
                    {deliveryAttempts.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Delivery Attempts</h3>
                        <div className="space-y-2">
                          {deliveryAttempts.map((attempt) => (
                            <div 
                              key={attempt.id} 
                              className={`p-3 rounded-lg ${
                                attempt.status === "failed" 
                                  ? "bg-red-500/10 border border-red-500/30" 
                                  : attempt.status === "scheduled"
                                  ? "bg-yellow-500/10 border border-yellow-500/30"
                                  : attempt.status === "delivered"
                                  ? "bg-green-500/10 border border-green-500/30"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Attempt #{attempt.attempt_number}</span>
                                <span className={`text-sm capitalize ${
                                  attempt.status === "failed" ? "text-red-500" 
                                  : attempt.status === "scheduled" ? "text-yellow-500"
                                  : attempt.status === "delivered" ? "text-green-500"
                                  : "text-muted-foreground"
                                }`}>
                                  {attempt.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(attempt.scheduled_date).toLocaleDateString("en-IN", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                              {attempt.failure_reason && (
                                <p className="text-sm text-red-400 mt-1">{attempt.failure_reason}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tracking Info */}
                    {selectedOrder.tracking_number && (
                      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Truck className="w-4 h-4" /> Tracking Information
                        </h3>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Provider:</span>{" "}
                          {selectedOrder.tracking_provider || "Delhivery"}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Tracking Number:</span>{" "}
                          <span className="font-mono">{selectedOrder.tracking_number}</span>
                        </p>
                        {selectedOrder.shipped_at && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Shipped On:</span>{" "}
                            {new Date(selectedOrder.shipped_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Delivery Estimate */}
                    <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold">{getEstimatedDelivery(selectedOrder)}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.order_status === "delivered"
                              ? "Your order has been delivered"
                              : selectedOrder.order_status === "cancelled"
                              ? "This order was cancelled"
                              : "Estimated delivery date"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Active Order Actions */}
                    {isOrderActive(selectedOrder) && (
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                        <h3 className="font-semibold mb-3">Order Actions</h3>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setNewPhone(selectedOrder.customer_phone || "");
                              setShowUpdatePhoneDialog(true);
                            }}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Update Phone
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setDeliveryInstructions(selectedOrder.notes || "");
                              setShowInstructionsDialog(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Delivery Instructions
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Generate invoice and download
                              handleDownloadInvoice(selectedOrder);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Download Invoice
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const message = `Order Query - Order ID: ${selectedOrder.id.slice(0, 8).toUpperCase()}\n\nI have a question about my order. Please help me with this.`;
                              openChat(message);
                            }}
                          >
                            <Headphones className="w-4 h-4 mr-1" />
                            Contact Support
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Shipping Address
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.shipping_address}
                      </p>
                      {selectedOrder.customer_phone && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {selectedOrder.customer_phone}
                        </p>
                      )}
                      {selectedOrder.notes && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          Instructions: {selectedOrder.notes}
                        </p>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-4">Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="capitalize">{selectedOrder.payment_method}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Payment Status</span>
                        <span
                          className={
                            selectedOrder.payment_status === "paid"
                              ? "text-green-500"
                              : selectedOrder.payment_status === "refunded"
                              ? "text-orange-500"
                              : "text-yellow-500"
                          }
                        >
                          {selectedOrder.payment_status.charAt(0).toUpperCase() +
                            selectedOrder.payment_status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold mt-4">
                        <span>Total</span>
                        <span>₹{selectedOrder.total_amount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex flex-wrap gap-3">
                        {/* Cancel Order - Only for "pending" status */}
                        {canCancelOrder(selectedOrder) && (
                          <Button 
                            variant="destructive"
                            onClick={() => setShowCancelDialog(true)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Order
                          </Button>
                        )}

                        {/* Post-Delivery Actions - Only for delivered orders */}
                        {selectedOrder.order_status === "delivered" && (
                          <>
                            <Button 
                              variant="outline"
                              onClick={() => setShowPostDeliveryModal(true)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Report Issue / Review
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setShowReviewForm(true)}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Rate & Review
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setShowReturnForm(true)}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Return/Replace
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => navigate("/warranty-claims")}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Warranty Claim
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-12 text-center"
                  >
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select an order from the list to view details
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Dialogs */}
      {selectedOrder && (
        <>
          <OrderCancellationDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            orderId={selectedOrder.id}
            userId={user.id}
            onCancelled={handleOrderCancelled}
          />

          <PostDeliveryActionModal
            open={showPostDeliveryModal}
            onOpenChange={setShowPostDeliveryModal}
            orderId={selectedOrder.id}
            userId={user.id}
            onActionSelected={handlePostDeliveryAction}
          />

          <RefundSelectionDialog
            open={showRefundDialog}
            onOpenChange={setShowRefundDialog}
            orderId={selectedOrder.id}
            userId={user.id}
            amount={selectedOrder.total_amount}
            paymentMethod={selectedOrder.payment_method}
            onSubmitted={() => {
              setShowRefundDialog(false);
              fetchUserOrders();
            }}
          />

          <ProductReviewForm
            open={showReviewForm}
            onOpenChange={setShowReviewForm}
            orderId={selectedOrder.id}
            userId={user.id}
            orderItems={selectedOrder.items.map(item => ({ id: item.id, name: item.name, product_id: item.id }))}
            onSubmitted={() => {
              setShowReviewForm(false);
              toast.success("Review submitted successfully!");
            }}
          />

          <DamageReportForm
            open={showDamageForm}
            onOpenChange={setShowDamageForm}
            orderId={selectedOrder.id}
            userId={user.id}
            onSubmitted={() => {
              setShowDamageForm(false);
              toast.success("Report submitted successfully!");
            }}
          />

          <ReturnReplaceForm
            open={showReturnForm}
            onOpenChange={setShowReturnForm}
            orderId={selectedOrder.id}
            userId={user.id}
            orderItems={selectedOrder.items.map(item => ({ id: item.id, name: item.name, product_id: item.id }))}
            onSubmitted={() => {
              setShowReturnForm(false);
              toast.success("Return request submitted!");
            }}
          />

          {/* Update Phone Dialog */}
          <Dialog open={showUpdatePhoneDialog} onOpenChange={setShowUpdatePhoneDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Phone Number</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter new phone number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowUpdatePhoneDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePhone}>Update</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delivery Instructions Dialog */}
          <Dialog open={showInstructionsDialog} onOpenChange={setShowInstructionsDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delivery Instructions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add delivery instructions (e.g., leave at door, call before delivery)"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowInstructionsDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateInstructions}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Layout>
  );
}
