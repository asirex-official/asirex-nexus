import { useState } from "react";
import { motion } from "framer-motion";
import { Package, User, Calendar, CreditCard, Truck, MapPin, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useOrders, useUpdateOrderStatus } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];
const trackingProviders = ["Delhivery", "BlueDart", "DTDC", "India Post", "FedEx", "Other"];

export default function OrdersManager() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingProvider, setTrackingProvider] = useState("Delhivery");

  const handleUpdateStatus = async (id: string, updates: Record<string, any>) => {
    try {
      await updateStatus.mutateAsync({ id, ...updates });
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, ...updates });
      }
      toast({ title: "Order updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    }
  };

  const handleMarkAsShipped = async () => {
    if (!selectedOrder) return;
    
    const updates: Record<string, any> = {
      order_status: "shipped",
      shipped_at: new Date().toISOString()
    };
    
    if (trackingNumber.trim()) {
      updates.tracking_number = trackingNumber.trim();
      updates.tracking_provider = trackingProvider;
    }
    
    await handleUpdateStatus(selectedOrder.id, updates);
    setTrackingNumber("");
  };

  const handleAddTracking = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return;
    
    await handleUpdateStatus(selectedOrder.id, {
      tracking_number: trackingNumber.trim(),
      tracking_provider: trackingProvider
    });
    setTrackingNumber("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500 bg-yellow-500/10";
      case "confirmed":
      case "paid": return "text-blue-500 bg-blue-500/10";
      case "processing": return "text-purple-500 bg-purple-500/10";
      case "shipped": return "text-cyan-500 bg-cyan-500/10";
      case "delivered": return "text-green-500 bg-green-500/10";
      case "cancelled":
      case "failed": return "text-red-500 bg-red-500/10";
      case "refunded": return "text-orange-500 bg-orange-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">
          Manage customer orders • {orders?.length || 0} total
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : orders?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
          <p className="text-muted-foreground">
            Orders will appear here when customers make purchases.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders?.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => {
                setSelectedOrder(order);
                setTrackingNumber((order as any).tracking_number || "");
                setTrackingProvider((order as any).tracking_provider || "Delhivery");
              }}
              className="glass-card p-4 cursor-pointer transition-all hover:bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{order.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    {(order as any).tracking_number && (
                      <p className="text-xs text-cyan-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {(order as any).tracking_provider}: {(order as any).tracking_number}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">₹{order.total_amount?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status || '')}`}>
                      {order.order_status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status || '')}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                <div className="glass-card p-4 bg-muted/30">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.customer_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{selectedOrder.payment_method || 'Not specified'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground">Shipping Address</p>
                      <p className="font-medium">{selectedOrder.shipping_address || 'Not provided'}</p>
                    </div>
                    {selectedOrder.notes && (
                      <div className="sm:col-span-2">
                        <p className="text-muted-foreground">Order Notes</p>
                        <p className="font-medium">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {(selectedOrder.items as any[])?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                      <p className="font-semibold">Total</p>
                      <p className="font-bold text-lg">₹{selectedOrder.total_amount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking & Shipping */}
                <div className="glass-card p-4 bg-cyan-500/5 border border-cyan-500/20">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-cyan-400">
                    <Truck className="w-4 h-4" />
                    Shipping & Tracking
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Tracking Provider</label>
                        <Select value={trackingProvider} onValueChange={setTrackingProvider}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {trackingProviders.map((provider) => (
                              <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Tracking Number</label>
                        <Input
                          placeholder="Enter tracking number..."
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.order_status !== "shipped" && selectedOrder.order_status !== "delivered" && (
                        <Button 
                          onClick={handleMarkAsShipped}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Mark as Shipped
                        </Button>
                      )}
                      
                      {trackingNumber.trim() && trackingNumber !== selectedOrder.tracking_number && (
                        <Button variant="outline" onClick={handleAddTracking}>
                          <MapPin className="w-4 h-4 mr-2" />
                          Update Tracking
                        </Button>
                      )}
                      
                      {selectedOrder.order_status === "shipped" && (
                        <Button 
                          onClick={() => handleUpdateStatus(selectedOrder.id, { order_status: "delivered" })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                    
                    {selectedOrder.shipped_at && (
                      <p className="text-sm text-muted-foreground">
                        Shipped on: {format(new Date(selectedOrder.shipped_at), 'MMMM d, yyyy • h:mm a')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Management */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Order Status
                    </label>
                    <Select
                      value={selectedOrder.order_status}
                      onValueChange={(v) => handleUpdateStatus(selectedOrder.id, { order_status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Status
                    </label>
                    <Select
                      value={selectedOrder.payment_status}
                      onValueChange={(v) => handleUpdateStatus(selectedOrder.id, { payment_status: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created: {format(new Date(selectedOrder.created_at), 'MMMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
