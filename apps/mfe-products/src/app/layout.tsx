import { AppShell, CrossZoneBridge } from '@platform/shell';
import { ThemeProvider, ToastProvider } from '@platform/ui';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = { title: 'Products — Platform' };

/**
 * mfe-products zone layout.
 *
 * Renders the shared AppShell (nav + sidebar) so the user sees a consistent
 * chrome regardless of which zone they are on.  ThemeProvider and ToastProvider
 * are zone-local — they are not shared across zone boundaries (full-page
 * navigations reset JS context), so each zone initialises them independently.
 *
 * CrossZoneBridge listens to `storage` events so the cart badge updates in
 * real time when another tab (in any zone) mutates the cart.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased dark:bg-gray-950">
        <ThemeProvider defaultTheme="light">
          <ToastProvider>
            <CrossZoneBridge />
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
