// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/ui/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WorkConnect Uganda - Find & Hire Skilled Workers',
  description: 'Uganda\'s premier platform connecting verified workers with trusted employers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <ClientLayout>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-16 md:pt-20"> {/* Add padding for fixed navbar */}
              {children}
            </main>
            <Footer />
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}