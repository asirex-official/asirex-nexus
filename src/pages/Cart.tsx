import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Loader2, Percent, BadgeIndianRupee } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, appliedCoupon, couponInfo, discount, applyCoupon, removeCoupon, validatingCoupon } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({ title: "Enter a code", description: "Please enter a coupon code", variant: "destructive" });
      return;
    }
    
    const result = await applyCoupon(couponCode);
    if (result.success) {
      toast({ 
        title: "Coupon Applied!", 
        description: `You saved ₹${discount.toLocaleString() || 'some amount'}` 
      });
      setCouponCode("");
    } else {
      toast({ 
        title: "Invalid Coupon", 
        description: result.error || "This coupon code is not valid", 
        variant: "destructive" 
      });
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast({ 
        title: "Login Required", 
        description: "Please sign in to place an order",
        variant: "destructive" 
      });
      navigate("/auth?redirect=/checkout");
      return;
    }
    navigate("/checkout");
  };

  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  if (items.length === 0) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md mx-auto"
            >
              <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
              </p>
              <Button variant="hero" asChild>
                <Link to="/shop">Browse Products</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
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
              Shopping <span className="gradient-text">Cart</span>
            </h1>
            <p className="text-muted-foreground">{totalItems} items in your cart</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-3 sm:p-4"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{item.name}</h3>
                        <p className="font-bold text-sm sm:text-lg flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-primary mt-1">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions - Below on mobile */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive text-xs sm:text-sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 sm:p-6 sticky top-24"
              >
                <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  {appliedCoupon ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary" />
                          <span className="font-bold text-primary">{appliedCoupon}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-destructive hover:text-destructive">
                          Remove
                        </Button>
                      </div>
                      {couponInfo && (
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            {couponInfo.discount_type === 'percentage' ? (
                              <Percent className="w-4 h-4 text-green-500" />
                            ) : (
                              <BadgeIndianRupee className="w-4 h-4 text-green-500" />
                            )}
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {couponInfo.discount_type === 'percentage' 
                                ? `${couponInfo.discount_value}% OFF` 
                                : `₹${couponInfo.discount_value.toLocaleString()} OFF`}
                            </span>
                          </div>
                          {couponInfo.description && (
                            <p className="text-xs text-muted-foreground">{couponInfo.description}</p>
                          )}
                          <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2">
                            You're saving ₹{discount.toLocaleString()}!
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        disabled={validatingCoupon}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon}
                      >
                        {validatingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Coupon Savings ({appliedCoupon})
                      </span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-500">FREE</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full mt-6"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure checkout • Free shipping on all orders
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
