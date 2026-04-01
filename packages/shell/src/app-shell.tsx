'use client';

import { useEventBus } from '@platform/event-bus';
import { useCartStore } from '@platform/shared-state';
import { Navbar, Sidebar, Avatar, Button } from '@platform/ui';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * Shared application shell — rendered by every zone (host-shell, mfe-products,
 * mfe-cart, mfe-user) so the nav / sidebar appear consistently regardless of
 * which Next.js app is currently serving the page.
 *
 * Multi-zone navigation rules
 * ───────────────────────────
 * In Next.js Multi-Zone every top-level route belongs to a different deployed
 * app.  Navigating between them causes a full-page reload (the browser leaves
 * one zone and enters another).  All nav items therefore use plain <a> tags —
 * Next.js <Link> only does client-side transitions *within* the same zone.
 *
 * The Sidebar component in @platform/ui already renders plain <a> tags, so
 * cross-zone navigation works out of the box.
 *
 * Cross-zone auth check
 * ─────────────────────
 * `fetch('/api/auth/me')` always hits the host-shell zone because the browser
 * sees the canonical domain (e.g. yourapp.vercel.app) regardless of which zone
 * served the page HTML.  Set NEXT_PUBLIC_HOST_URL for isolated local MFE dev.
 *
 * Cart badge
 * ──────────
 * Zustand's persist middleware writes cart state to localStorage under the key
 * "platform-cart".  On zone entry (full-page load) Zustand re-hydrates from
 * localStorage automatically, so the badge count is always correct.  Same-page
 * mutations also update the badge instantly via the EventBus.  Cross-tab /
 * cross-zone live sync is handled by CrossZoneBridge.
 */

const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL ?? '';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Cart', href: '/cart' },
  { label: 'Dashboard', href: '/dashboard' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Active-path detection: usePathname() returns a path relative to the
  // zone's basePath, so we read window.location.pathname for the real URL.
  const [pathname, setPathname] = useState('/');
  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  // Cart count — always start at 0 to match server render (no localStorage on server).
  // useEffect syncs from Zustand after hydration; EventBus keeps it live for
  // same-page mutations; CrossZoneBridge handles cross-tab updates.
  const storeCount = useCartStore((s) => s.cart?.itemCount ?? 0);
  const [cartItemCount, setCartItemCount] = useState(0);
  useEventBus('cart:count-changed', ({ count }) => setCartItemCount(count));

  // Sync badge once Zustand finishes re-hydrating from localStorage on the client.
  useEffect(() => {
    setCartItemCount(storeCount);
  }, [storeCount]);

  useEffect(() => {
    fetch(`${HOST_URL}/api/auth/me`, { credentials: 'include' })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEventBus('notification:show', (payload) => {
    console.log('[Shell] Notification:', payload);
  });

  return (
    <div className="flex min-h-screen">
      {isLoggedIn && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          items={NAV_ITEMS.map((item) => ({
            label: item.label,
            href: item.href,
            isActive:
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)),
          }))}
        />
      )}

      <div className="flex flex-1 flex-col">
        <Navbar
          logo={
            <a href="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
              <svg className="h-8 w-8" viewBox="0 0 32 32" fill="currentColor">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <rect x="18" y="2" width="12" height="12" rx="2" opacity="0.7" />
                <rect x="2" y="18" width="12" height="12" rx="2" opacity="0.7" />
                <rect x="18" y="18" width="12" height="12" rx="2" opacity="0.4" />
              </svg>
              Platform
            </a>
          }
          onMenuClick={isLoggedIn ? () => setSidebarOpen(true) : undefined}
          actions={
            <div className="flex items-center gap-3 min-w-[120px] justify-end">
              {isLoggedIn === null ? (
                <div className="h-8 w-8" />
              ) : isLoggedIn ? (
                <>
                  <a
                    href="/cart"
                    className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                      />
                    </svg>
                    {cartItemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </a>
                  <a href="/dashboard">
                    <Avatar name="Alex Johnson" size="sm" />
                  </a>
                </>
              ) : (
                <a href="/login">
                  <Button size="sm">Sign In</Button>
                </a>
              )}
            </div>
          }
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
