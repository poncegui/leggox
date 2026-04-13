import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('leggox_cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('leggox_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  function addToCart(product, qty = 1) {
    setCart(prev => {
      const idx = prev.findIndex(it => it.reference === product.reference);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [
        ...prev,
        {
          reference: product.reference,
          title: product.title,
          price: product.price || product.priceEUR || 0,
          qty,
          buyUrl: product.buyUrl,
        },
      ];
    });
  }

  function removeFromCart(reference) {
    setCart(prev => prev.filter(it => it.reference !== reference));
  }

  function updateQty(reference, qty) {
    setCart(prev =>
      prev.map(it => (it.reference === reference ? { ...it, qty } : it))
    );
  }

  function clearCart() {
    setCart([]);
  }

  const total = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export default CartContext;
