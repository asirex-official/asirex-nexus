import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface CouponInfo {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  savings_text: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  appliedCoupon: string | null;
  couponInfo: CouponInfo | null;
  discount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  validatingCoupon: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('asirex-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [discount, setDiscount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    localStorage.setItem('asirex-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponInfo(null);
    setDiscount(0);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const totalPrice = Math.max(0, subtotal - discount);

  const applyCoupon = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!code.trim()) return { success: false, error: "Please enter a coupon code" };

    setValidatingCoupon(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: { code: code.trim(), order_amount: subtotal },
      });

      if (error) throw error;

      if (data?.valid) {
        setAppliedCoupon(data.coupon.code);
        setCouponInfo(data.coupon);
        setDiscount(data.discount_amount);
        return { success: true };
      } else {
        return { success: false, error: data?.error || "Invalid coupon" };
      }
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      return { success: false, error: "Failed to validate coupon" };
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInfo(null);
    setDiscount(0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      totalPrice,
      appliedCoupon,
      couponInfo,
      discount,
      applyCoupon,
      removeCoupon,
      validatingCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
