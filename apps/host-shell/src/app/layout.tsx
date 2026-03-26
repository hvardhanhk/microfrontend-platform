import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AppShell } from '@/components/app-shell';
import { Providers } from '@/components/providers';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { template: '%s | Platform', default: 'Platform — Enterprise Microfrontend' },
  description: 'Production-grade enterprise microfrontend platform built with Next.js',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 font-sans antialiased dark:bg-gray-950">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
