import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Products — Platform' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans antialiased dark:bg-gray-950">
        <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</main>
      </body>
    </html>
  );
}
