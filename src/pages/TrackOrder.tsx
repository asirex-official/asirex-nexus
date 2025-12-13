import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Calendar, ArrowLeft, Loader2, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        };
      });

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const index = ORDER_STATUSES.findIndex((s) => s.key === status);
    return index >= 0 ? index : 0;
  };

  const getEstimatedDelivery = (order: Order) => {
    const createdDate = new Date(order.created_at);
    
    if (order.order_status === "delivered") {
      return "Delivered";
    }
    
    if (order.shipped_at) {
      const shippedDate = new Date(order.shipped_at);
      const deliveryDate = new Date(shippedDate);
      deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days after shipping
      return `Expected by ${deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
    }
    
    // Default 7-10 days from order date
    const minDate = new Date(createdDate);
    minDate.setDate(minDate.getDate() + 7);
    const maxDate = new Date(createdDate);
    maxDate.setDate(maxDate.getDate() + 10);
    
    return `Expected ${minDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${maxDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
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
                {orders.map((order, index) => (
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
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.order_status === "delivered"
                            ? "bg-green-500/20 text-green-500"
                            : order.order_status === "shipped"
                            ? "bg-blue-500/20 text-blue-500"
                            : order.order_status === "processing"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
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
                ))}
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

                    {/* Progress Timeline */}
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
                              : "Estimated delivery date"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Shipping Address
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.shipping_address}
                      </p>
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
    </Layout>
  );
}
