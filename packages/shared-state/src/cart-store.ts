import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { Cart, CartItem, CartState } from '@platform/types';
import { EventBus } from '@platform/event-bus';

interface CartActions {
  setCart: (cart: Cart) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setLoading: (isLoading: boolean) => void;
  setUpdating: (isUpdating: boolean) => void;
}

function recalculateTotals(
  items: CartItem[],
): Pick<Cart, 'subtotal' | 'tax' | 'shipping' | 'total' | 'itemCount'> {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.variant?.price ?? item.product.price) * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
  const shipping = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
  return {
    subtotal,
    tax,
    shipping,
    total: Math.round((subtotal + tax + shipping) * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

const EMPTY_CART: Cart = {
  id: 'cart_default',
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  currency: 'USD',
  itemCount: 0,
  updatedAt: new Date().toISOString(),
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      cart: EMPTY_CART,
      isLoading: false,
      isUpdating: false,

      setCart: (cart) => {
        set({ cart, isLoading: false });
        EventBus.publish('cart:count-changed', { count: cart.itemCount });
      },

      addItem: (item) => {
        const cart = get().cart ?? EMPTY_CART;
        const existingIndex = cart.items.findIndex((i) => i.id === item.id);
        let newItems: CartItem[];

        if (existingIndex >= 0) {
          newItems = cart.items.map((i, idx) =>
            idx === existingIndex ? { ...i, quantity: i.quantity + item.quantity } : i,
          );
        } else {
          newItems = [...cart.items, item];
        }

        const totals = recalculateTotals(newItems);
        const updatedCart: Cart = {
          ...cart,
          items: newItems,
          ...totals,
          updatedAt: new Date().toISOString(),
        };

        set({ cart: updatedCart });
        EventBus.publish('cart:item-added', { item });
        EventBus.publish('cart:count-changed', { count: totals.itemCount });
      },

      removeItem: (itemId) => {
        const cart = get().cart;
        if (!cart) return;

        const newItems = cart.items.filter((i) => i.id !== itemId);
        const totals = recalculateTotals(newItems);
        const updatedCart: Cart = {
          ...cart,
          items: newItems,
          ...totals,
          updatedAt: new Date().toISOString(),
        };

        set({ cart: updatedCart });
        EventBus.publish('cart:item-removed', { itemId });
        EventBus.publish('cart:count-changed', { count: totals.itemCount });
      },

      updateItemQuantity: (itemId, quantity) => {
        const cart = get().cart;
        if (!cart) return;

        const newItems =
          quantity <= 0
            ? cart.items.filter((i) => i.id !== itemId)
            : cart.items.map((i) => (i.id === itemId ? { ...i, quantity } : i));

        const totals = recalculateTotals(newItems);
        const updatedCart: Cart = {
          ...cart,
          items: newItems,
          ...totals,
          updatedAt: new Date().toISOString(),
        };

        set({ cart: updatedCart });
        EventBus.publish('cart:item-updated', { itemId, quantity });
        EventBus.publish('cart:count-changed', { count: totals.itemCount });
      },

      clearCart: () => {
        set({ cart: EMPTY_CART });
        EventBus.publish('cart:cleared', undefined);
        EventBus.publish('cart:count-changed', { count: 0 });
      },

      setLoading: (isLoading) => set({ isLoading }),
      setUpdating: (isUpdating) => set({ isUpdating }),
    }),
    {
      name: 'platform-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
    },
  ),
);
