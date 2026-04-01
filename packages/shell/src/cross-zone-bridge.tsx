'use client';

import { useCartStore } from '@platform/shared-state';
import { useEffect } from 'react';

const CART_STORAGE_KEY = 'platform-cart';

/**
 * CrossZoneBridge — mounts once per zone layout, keeps Zustand stores in sync
 * across browser tabs and zones via the Web Storage API.
 *
 * Why this is needed
 * ──────────────────
 * The EventBus is an in-memory singleton — it only propagates events within
 * the same JavaScript context (same tab, same zone).  In Multi-Zone, each
 * zone runs in its own JS context after a full-page navigation.
 *
 * localStorage IS shared across all zones (same origin).  Zustand's persist
 * middleware already writes cart state there on every mutation.  The browser
 * fires a `storage` event on all OTHER tabs/windows when any tab writes to
 * localStorage.  This bridge listens for that event and updates the local
 * Zustand store so the cart badge stays accurate in all open tabs.
 *
 * Example flow
 * ────────────
 * Tab A (/products) → user adds item → cart-store writes to localStorage
 *   → browser fires `storage` event on Tab B (/cart)
 *   → CrossZoneBridge reads the new cart state → updates Zustand in Tab B
 *   → cart badge in Tab B's AppShell updates immediately
 */
export function CrossZoneBridge() {
  const setCart = useCartStore((s) => s.setCart);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== CART_STORAGE_KEY || !event.newValue) return;

      try {
        // Zustand persist format: { state: { cart: {...} }, version: 0 }
        const parsed = JSON.parse(event.newValue) as {
          state?: { cart?: Parameters<typeof setCart>[0] };
        };
        const cart = parsed?.state?.cart;
        if (cart) setCart(cart);
      } catch {
        // Malformed storage value — ignore silently
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [setCart]);

  return null;
}
