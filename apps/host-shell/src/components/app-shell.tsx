'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Navbar, Sidebar, Avatar, Button } from '@platform/ui';
import { useEventBus } from '@platform/event-bus';
import { useCartStore } from '@platform/shared-state';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Cart', href: '/cart' },
  { label: 'Dashboard', href: '/dashboard' },
];

/**
 * Application shell — persistent layout wrapping all MFE pages.
 * Contains the nav, sidebar, and listens for cross-MFE notifications.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const cartItemCount = useCartStore((s) => s.cart?.itemCount ?? 0);

  // Check auth status once on mount — subsequent changes (login/logout) do full navigations
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Listen for cross-MFE notifications (demonstrates event bus)
  useEventBus('notification:show', (payload) => {
    console.log('[Host] Notification:', payload);
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={navItems.map((item) => ({
          label: item.label,
          href: item.href,
          isActive: pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)),
        }))}
      />

      <div className="flex flex-1 flex-col">
        <Navbar
          logo={
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
              <svg className="h-8 w-8" viewBox="0 0 32 32" fill="currentColor">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <rect x="18" y="2" width="12" height="12" rx="2" opacity="0.7" />
                <rect x="2" y="18" width="12" height="12" rx="2" opacity="0.7" />
                <rect x="18" y="18" width="12" height="12" rx="2" opacity="0.4" />
              </svg>
              Platform
            </Link>
          }
          onMenuClick={() => setSidebarOpen(true)}
          actions={
            <div className="flex items-center gap-3 min-w-[120px] justify-end">
              {isLoggedIn === null ? (
                <div className="h-8 w-8" />
              ) : isLoggedIn ? (
                <>
                  <Link href="/cart" className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {cartItemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/dashboard">
                    <Avatar name="Alex Johnson" size="sm" />
                  </Link>
                </>
              ) : (
                <Link href="/login"><Button size="sm">Sign In</Button></Link>
              )}
            </div>
          }
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
