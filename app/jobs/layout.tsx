// app/jobs/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jobs - Find Work Opportunities | WorkConnect',
  description: 'Browse and apply for job opportunities across Uganda. Find work that matches your skills and experience.',
};

export default function JobsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}