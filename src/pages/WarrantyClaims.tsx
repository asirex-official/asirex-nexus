import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Loader2, Clock, CheckCircle, XCircle, MessageSquare, Package, ChevronRight, Gift, ArrowRight, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLiveChat } from "@/hooks/useLiveChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UnifiedComplaintFlow } from "@/components/orders/UnifiedComplaintFlow";
import { format } from "date-fns";

interface DeliveredOrder {
  id: string;
  delivered_at: string;
  items: { id: string; name: string; product_id?: string; price?: number; quantity?: number }[];
  payment_method: string;
  total_amount: number;
}

interface WarrantyClaim {
  id: string;
  order_id: string;
  complaint_type: string;
  investigation_status: string;
  coupon_code: string | null;
  pickup_status: string | null;
  pickup_scheduled_at: string | null;
  replacement_order_id: string | null;
  created_at: string;
}

export default function WarrantyClaims() {
  const { user, loading: authLoading } = useAuth();
  const { openChat } = useLiveChat();
  const navigate = useNavigate();
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveredOrder[]>([]);
  const [existingClaims, setExistingClaims] = useState<WarrantyClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DeliveredOrder | null>(null);
  const [showComplaintFlow, setShowComplaintFlow] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/warranty-claims");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [ordersRes, claimsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .eq("order_status", "delivered"),
        supabase
          .from("order_complaints")
          .select("*")
          .eq("user_id", user.id)
          .eq("complaint_type", "warranty")
          .order("created_at", { ascending: false }),
      ]);

      if (ordersRes.data) {
        setDeliveredOrders(ordersRes.data.map((o) => ({
          id: o.id,
          delivered_at: o.delivered_at || o.updated_at,
          items: Array.isArray(o.items) ? (o.items as any[]) : [],
          payment_method: o.payment_method || "cod",
          total_amount: o.total_amount,
        })));
      }
      if (claimsRes.data) setExistingClaims(claimsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSupport = (claimId: string) => {
    openChat(`Hi, I need help with my warranty claim #${claimId.slice(0, 8)}. Can you assist me?`);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: typeof Clock }> = {
      investigating: { label: "Under Review", color: "bg-orange-500/20 text-orange-500", icon: Clock },
      resolved_true: { label: "Approved", color: "bg-green-500/20 text-green-500", icon: CheckCircle },
      resolved_false: { label: "Rejected", color: "bg-red-500/20 text-red-500", icon: XCircle },
    };
    return configs[status] || configs.investigating;
  };

  const getWarrantyStatus = (deliveredAt: string) => {
    const delivery = new Date(deliveredAt);
    const warrantyEnd = new Date(delivery);
    warrantyEnd.setMonth(warrantyEnd.getMonth() + 12);
    return {
      isValid: warrantyEnd > new Date(),
      endDate: warrantyEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
  };

  const handleStartClaim = (order: DeliveredOrder) => {
    const warranty = getWarrantyStatus(order.delivered_at);
    if (!warranty.isValid) {
      toast.error("This order is out of warranty period");
      return;
    }
    setSelectedOrder(order);
    setShowComplaintFlow(true);
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-4xl font-bold mb-2">
              Warranty <span className="gradient-text">Claims</span>
            </h1>
            <p className="text-muted-foreground">
              File and track warranty claims for your purchased products
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Eligible Orders */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Package className="w-5 h-5" /> Eligible Orders
              </h2>

              {deliveredOrders.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Delivered Orders</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You need delivered orders to file warranty claims.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/shop")}>
                    Browse Products
                  </Button>
                </Card>
              ) : (
                deliveredOrders.map((order, index) => {
                  const warranty = getWarrantyStatus(order.delivered_at);
                  const hasActiveClaim = existingClaims.some(
                    (c) => c.order_id === order.id && c.investigation_status === "investigating"
                  );

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              Delivered: {new Date(order.delivered_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={warranty.isValid ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                            {warranty.isValid ? `Valid till ${warranty.endDate}` : "Expired"}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.items.slice(0, 2).map((item) => (
                            <p key={item.id} className="text-sm text-muted-foreground">
                              • {item.name}
                            </p>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={() => handleStartClaim(order)}
                          disabled={!warranty.isValid || hasActiveClaim}
                          className="w-full"
                          variant={hasActiveClaim ? "outline" : "default"}
                        >
                          {hasActiveClaim ? (
                            <>
                              <Clock className="w-4 h-4 mr-2" /> Claim in Progress
                            </>
                          ) : !warranty.isValid ? (
                            "Out of Warranty"
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" /> File Warranty Claim
                            </>
                          )}
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </motion.div>

            {/* Existing Claims */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" /> Your Claims
              </h2>

              {existingClaims.length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Claims Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't filed any warranty claims yet.
                  </p>
                </Card>
              ) : (
                existingClaims.map((claim, index) => {
                  const status = getStatusConfig(claim.investigation_status);
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={claim.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-500" />
                            <span className="font-medium">Warranty Claim</span>
                          </div>
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          Order #{claim.order_id.slice(0, 8)} •{" "}
                          {format(new Date(claim.created_at), "MMM d, yyyy")}
                        </p>

                        {/* Timeline Steps */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Claim Submitted</span>
                          </div>

                          {claim.investigation_status === "investigating" && (
                            <div className="flex items-center gap-2 text-sm text-orange-500">
                              <Clock className="w-4 h-4" />
                              <span>Under Review</span>
                            </div>
                          )}

                          {claim.investigation_status === "resolved_true" && (
                            <>
                              <div className="flex items-center gap-2 text-sm text-green-500">
                                <CheckCircle className="w-4 h-4" />
                                <span>Claim Approved</span>
                              </div>

                              {claim.pickup_status && (
                                <div className="flex items-center gap-2 text-sm">
                                  {claim.pickup_status === "scheduled" ? (
                                    <>
                                      <Clock className="w-4 h-4 text-blue-500" />
                                      <span className="text-blue-500">
                                        Pickup on {claim.pickup_scheduled_at ? format(new Date(claim.pickup_scheduled_at), "MMM d") : "scheduled"}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      <span className="text-green-500">Item Picked Up</span>
                                    </>
                                  )}
                                </div>
                              )}

                              {claim.replacement_order_id && (
                                <div className="flex items-center gap-2 text-sm text-purple-500">
                                  <Package className="w-4 h-4" />
                                  <span>Replacement Order #{claim.replacement_order_id.slice(0, 8)}</span>
                                </div>
                              )}
                            </>
                          )}

                          {claim.investigation_status === "resolved_false" && (
                            <div className="flex items-center gap-2 text-sm text-red-500">
                              <XCircle className="w-4 h-4" />
                              <span>Claim Could Not Be Verified</span>
                            </div>
                          )}
                        </div>

                        {/* Coupon */}
                        {claim.coupon_code && (
                          <div className="p-3 bg-primary/10 rounded-lg mb-3">
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4 text-primary" />
                              <span className="text-sm">
                                Apology Code:{" "}
                                <code className="font-mono font-bold">{claim.coupon_code}</code>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Replacement Order Link */}
                        {claim.replacement_order_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mb-3"
                            onClick={() => navigate("/track-order")}
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Track Replacement Order
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => handleContactSupport(claim.id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Support
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </div>

          {/* Warranty Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12"
          >
            <Card className="p-6 bg-purple-500/5 border-purple-500/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                Warranty Policy
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-medium text-green-500 mb-2">✓ Covered Under Warranty</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Manufacturing defects</li>
                    <li>• Internal component failures</li>
                    <li>• Software/firmware issues</li>
                    <li>• Quality defects</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-red-500 mb-2">✗ Not Covered</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Water/liquid damage</li>
                    <li>• Physical damage or misuse</li>
                    <li>• Unauthorized repairs</li>
                    <li>• Normal wear and tear</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Unified Complaint Flow */}
      {selectedOrder && (
        <UnifiedComplaintFlow
          open={showComplaintFlow}
          onOpenChange={setShowComplaintFlow}
          orderId={selectedOrder.id}
          userId={user!.id}
          complaintType="warranty"
          orderItems={selectedOrder.items}
          orderPaymentMethod={selectedOrder.payment_method}
          orderAmount={selectedOrder.total_amount}
          deliveredAt={selectedOrder.delivered_at}
          onCompleted={() => {
            setShowComplaintFlow(false);
            setSelectedOrder(null);
            fetchData();
          }}
        />
      )}
    </Layout>
  );
}
