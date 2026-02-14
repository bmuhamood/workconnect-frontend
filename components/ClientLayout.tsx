// components/ClientLayout.tsx
'use client';

import { ReactNode } from 'react';
import { Toaster } from 'sonner'; // Changed from react-hot-toast to sonner
import { AuthProvider } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Add debug logging
  if (typeof window !== 'undefined') {
    console.log('ClientLayout - Current path:', pathname);
    console.log('ClientLayout - Cookies:', document.cookie);
  }
  
  return (
    <AuthProvider>
      {children}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </AuthProvider>
  );
}