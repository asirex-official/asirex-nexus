import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, CreditCard, Truck, CheckCircle, Loader2, Sparkles, Tag } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActiveSalesCampaigns, calculateSaleDiscount } from "@/hooks/useSalesCampaigns";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", description: "Pay when you receive" },
  { id: "online", label: "Pay Online", description: "UPI, Card, Net Banking" },
];

export default function Checkout() {
  const { items, totalPrice, appliedCoupon, couponInfo, discount: couponDiscount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const payuFormRef = useRef<HTMLFormElement>(null);
  const [payuData, setPayuData] = useState<any>(null);

  // Fetch active sales campaigns
  const { data: salesCampaigns = [] } = useActiveSalesCampaigns();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: user?.email || "",
    houseNumber: "",
    colony: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
    paymentMethod: "cod",
  });

  // Handle PayU callback
  useEffect(() => {
    const status = searchParams.get("status");
    const orderId = searchParams.get("order_id");
    const message = searchParams.get("message");
    const paymentStatus = searchParams.get("payment_status");

    if (status === "success" && orderId) {
      clearCart();
      setOrderSuccess(true);
      toast({ title: "Payment Successful! Order Placed." });
    } else if (status === "failed") {
      toast({ 
        title: "Payment Failed", 
        description: message || "Please try again or use Cash on Delivery.",
        variant: "destructive" 
      });
    } else if (paymentStatus === "pending" && orderId) {
      // Payment pending status
      toast({ 
        title: "Payment Pending", 
        description: "Your payment is being processed. We'll notify you once confirmed.",
      });
    }
  }, [searchParams, clearCart, toast]);

  // Submit PayU form when data is ready
  useEffect(() => {
    if (payuData && payuFormRef.current) {
      payuFormRef.current.submit();
    }
  }, [payuData]);

  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  // Calculate sale discount automatically
  const saleDiscountInfo = useMemo(() => {
    return calculateSaleDiscount(salesCampaigns, subtotal);
  }, [salesCampaigns, subtotal]);

  const saleDiscount = saleDiscountInfo.discount;
  const activeSale = saleDiscountInfo.campaign;

  // Total discount = coupon discount + sale discount
  const totalDiscount = couponDiscount + saleDiscount;
  const finalPrice = Math.max(0, subtotal - totalDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Please login to continue", variant: "destructive" });
      navigate("/auth?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      toast({ title: "Your cart is empty", variant: "destructive" });
      navigate("/shop");
      return;
    }

    // Validate form
    if (!form.fullName || !form.phone || !form.houseNumber || !form.city || !form.state || !form.pincode) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      toast({ title: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pincode)) {
      toast({ title: "Please enter a valid 6-digit pincode", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddress = `${form.houseNumber}, ${form.colony}${form.landmark ? ', Near ' + form.landmark : ''}, ${form.city}, ${form.state} - ${form.pincode}`;

      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
      }));

      // Create order first
      const { data: orderData, error } = await supabase.from('orders').insert({
        user_id: user.id,
        customer_name: form.fullName,
        customer_email: form.email || user.email,
        customer_phone: form.phone,
        shipping_address: shippingAddress,
        items: orderItems,
        total_amount: finalPrice,
        payment_method: form.paymentMethod,
        payment_status: form.paymentMethod === 'cod' ? 'pending' : 'awaiting',
        order_status: 'pending',
        notes: form.notes || null,
      }).select('id').single();

      if (error) throw error;

      // Increment sale campaign order count if a sale was applied
      if (activeSale) {
        await supabase
          .from('sales_campaigns')
          .update({ current_orders: activeSale.current_orders + 1 })
          .eq('id', activeSale.id);
      }

      // For online payment, initiate PayU (skip if amount is 0 - fully discounted order)
      if (form.paymentMethod === 'online' && finalPrice > 0) {
        const productInfo = items.map(i => i.name).join(', ').substring(0, 100);
        
        const { data: payuResponse, error: payuError } = await supabase.functions.invoke('initiate-payu-payment', {
          body: {
            order_id: orderData.id,
            amount: finalPrice,
            product_info: productInfo || 'ASIREX Products',
            customer_name: form.fullName,
            customer_email: form.email || user.email,
            customer_phone: form.phone,
          }
        });

        if (payuError || !payuResponse) {
          throw new Error(payuError?.message || 'Failed to initiate payment');
        }

        // Set PayU data to trigger form submission
        setPayuData(payuResponse);
        return; // Don't continue, form will submit automatically
      }

      // If order is fully discounted (finalPrice = 0), mark as paid and skip payment gateway
      if (finalPrice === 0) {
        await supabase.from('orders').update({ 
          payment_status: 'paid',
          order_status: 'confirmed'
        }).eq('id', orderData.id);
      }

      // For COD, send notification and complete
      try {
        await supabase.functions.invoke('send-order-notification', {
          body: {
            orderId: orderData.id,
            customerName: form.fullName,
            customerEmail: form.email || user.email,
            customerPhone: form.phone,
            shippingAddress: shippingAddress,
            items: orderItems,
            totalAmount: finalPrice,
            paymentMethod: form.paymentMethod,
          }
        });
      } catch (emailError) {
        console.log('Email notification skipped:', emailError);
      }

      // Auto-create ShipRocket shipment with full automation (AWB + Pickup)
      try {
        await supabase.functions.invoke('shiprocket-full-automation', {
          body: { orderId: orderData.id }
        });
        console.log('ShipRocket full automation triggered');
      } catch (shipError) {
        console.log('ShipRocket automation skipped:', shipError);
      }

      clearCart();
      setOrderSuccess(true);
      toast({ title: "Order Placed Successfully!" });
    } catch (error) {
      console.error('Order error:', error);
      toast({ 
        title: "Order Failed", 
        description: "Something went wrong. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check for payment pending from URL
  const paymentPending = searchParams.get("payment_status") === "pending";
  const pendingOrderId = searchParams.get("order_id");

  if (paymentPending && pendingOrderId) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">Payment Pending</h1>
              <p className="text-muted-foreground mb-8">
                Your payment is being processed. We'll notify you via email once the payment is confirmed.
                Please do not place another order.
              </p>
              <div className="glass-card p-4 mb-6 bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Order ID: {pendingOrderId.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate("/track-order")}>
                  Track Order
                </Button>
                <Button variant="hero" onClick={() => navigate("/")}>
                  Go Home
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  if (orderSuccess) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">Order Placed!</h1>
              <p className="text-muted-foreground mb-4">
                Thank you for your order. We'll send you a confirmation email shortly.
                {form.paymentMethod === 'cod' && ' Please keep cash ready for delivery.'}
              </p>
              <div className="glass-card p-4 mb-6 bg-accent/10 border border-accent/20">
                <p className="text-sm text-accent">
                  Estimated Delivery: 5-7 business days
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate("/shop")}>
                  Continue Shopping
                </Button>
                <Button variant="hero" onClick={() => navigate("/")}>
                  Go Home
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0) {
    navigate("/cart");
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
              <span className="gradient-text">Checkout</span>
            </h1>
            <p className="text-muted-foreground">Complete your order</p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping Address */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Shipping Address
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="houseNumber">House/Flat No. *</Label>
                      <Input
                        id="houseNumber"
                        value={form.houseNumber}
                        onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                        placeholder="House/Flat number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="colony">Colony/Street *</Label>
                      <Input
                        id="colony"
                        value={form.colony}
                        onChange={(e) => setForm({ ...form, colony: e.target.value })}
                        placeholder="Colony or street name"
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="landmark">Landmark (Optional)</Label>
                      <Input
                        id="landmark"
                        value={form.landmark}
                        onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                        placeholder="Near school, mall, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="City name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Select
                        value={form.state}
                        onValueChange={(v) => setForm({ ...form, state: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        placeholder="6-digit pincode"
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Any special instructions for delivery"
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </h2>

                  <RadioGroup
                    value={form.paymentMethod}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, paymentMethod: value }))}
                    className="space-y-3"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <Label
                        key={method.id}
                        htmlFor={method.id}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                          form.paymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="flex-1">
                          <span className="font-medium block">
                            {method.label}
                          </span>
                          <span className="text-sm text-muted-foreground">{method.description}</span>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  {form.paymentMethod === 'online' && (
                    <p className="text-sm text-muted-foreground mt-4 p-3 bg-primary/10 rounded-lg">
                      You will be redirected to PayU secure payment gateway to complete your payment.
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 sticky top-24"
                >
                  <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 text-sm border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    {/* Sale Discount - Auto Applied */}
                    {activeSale && saleDiscount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {activeSale.name}
                        </span>
                        <span>-₹{saleDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Coupon Discount */}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Coupon ({appliedCoupon})
                        </span>
                        <span>-₹{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-500">FREE</span>
                    </div>
                    
                    {/* Total Savings Banner */}
                    {totalDiscount > 0 && (
                      <div className="p-2 bg-green-500/10 rounded-lg text-center border border-green-500/20">
                        <span className="text-green-600 dark:text-green-400 font-medium text-xs">
                          🎉 You're saving ₹{totalDiscount.toLocaleString()} on this order!
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{finalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full mt-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By placing this order, you agree to our Terms & Conditions
                  </p>
                </motion.div>
              </div>
            </div>
          </form>

          {/* PayU Hidden Form - Outside main form to avoid nesting */}
          {payuData && (
            <form
              ref={payuFormRef}
              action="https://test.payu.in/_payment"
              method="POST"
              style={{ display: 'none' }}
            >
              <input type="hidden" name="key" value={payuData.key} />
              <input type="hidden" name="txnid" value={payuData.txnid} />
              <input type="hidden" name="amount" value={payuData.amount} />
              <input type="hidden" name="productinfo" value={payuData.productinfo} />
              <input type="hidden" name="firstname" value={payuData.firstname} />
              <input type="hidden" name="email" value={payuData.email} />
              <input type="hidden" name="phone" value={payuData.phone} />
              <input type="hidden" name="surl" value={payuData.surl} />
              <input type="hidden" name="furl" value={payuData.furl} />
              <input type="hidden" name="hash" value={payuData.hash} />
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
