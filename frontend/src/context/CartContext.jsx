import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await cartApi.get();
      setCart(res.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await cartApi.addItem({ productId, quantity });
      setCart(res.data);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await cartApi.removeItem(cartItemId);
      setCart(res.data);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove from cart');
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await cartApi.updateQuantity(cartItemId, quantity);
      setCart(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clear();
      setCart(null);
      toast.success('Cart cleared');
    } catch (err) {
      toast.error('Failed to clear cart');
    }
  };

  const itemCount = cart?.totalQuantity || 0;

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
