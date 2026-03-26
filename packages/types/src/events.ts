import type { CartItem, AddToCartPayload } from './cart';
import type { User } from './user';

/**
 * Central registry of all cross-MFE events.
 *
 * Each key is an event name; its value is the payload type.
 * Using a type map ensures compile-time safety for publish/subscribe —
 * if mfe-products publishes 'cart:item-added' with the wrong shape,
 * TypeScript catches it at build time, not at runtime.
 */
export interface EventMap {
  // Auth events
  'auth:login': { user: User };
  'auth:logout': undefined;
  'auth:token-refreshed': { expiresAt: number };

  // Cart events
  'cart:item-added': { item: CartItem };
  'cart:item-removed': { itemId: string };
  'cart:item-updated': { itemId: string; quantity: number };
  'cart:cleared': undefined;
  'cart:count-changed': { count: number };

  // Product events
  'product:add-to-cart': AddToCartPayload;
  'product:viewed': { productId: string };
  'product:wishlisted': { productId: string };

  // Navigation events
  'nav:route-changed': { path: string; mfe: string };

  // Theme events
  'theme:changed': { theme: 'light' | 'dark' | 'system' };

  // Feature flag events
  'feature:flag-updated': { name: string; enabled: boolean };

  // Notification events
  'notification:show': {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  };
}

export type EventName = keyof EventMap;
export type EventPayload<E extends EventName> = EventMap[E];
