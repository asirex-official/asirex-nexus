import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  appliedCoupon: string | null;
  discount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const COUPONS: Record<string, number> = {
  'ASIREX10': 10,
  'ASIREX20': 20,
  'FIRSTORDER': 15,
  'TECH25': 25,
  'SAVE50': 50,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('asirex-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    return localStorage.getItem('asirex-coupon');
  });

  useEffect(() => {
    localStorage.setItem('asirex-cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('asirex-coupon', appliedCoupon);
    } else {
      localStorage.removeItem('asirex-coupon');
    }
  }, [appliedCoupon]);

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
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const discount = appliedCoupon ? (subtotal * (COUPONS[appliedCoupon] || 0)) / 100 : 0;
  const totalPrice = subtotal - discount;

  const applyCoupon = (code: string): boolean => {
    const upperCode = code.toUpperCase();
    if (COUPONS[upperCode]) {
      setAppliedCoupon(upperCode);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      appliedCoupon,
      discount,
      applyCoupon,
      removeCoupon,
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
