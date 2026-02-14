// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import Header from '@/components/layout/navbar';
import Footer from '@/components/ui/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WorkConnect - Uganda\'s #1 Job Matching Platform',
  description: 'Connecting verified skilled workers with trusted employers across Uganda',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ClientLayout>
          <Header />
          <main className="min-h-screen pt-18"> {/* Add pt-16 (64px) for standard header height */}
            {children}
          </main>
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}