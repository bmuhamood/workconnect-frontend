import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastHost } from "@/components/toast-host";

export const metadata: Metadata = {
  title: { default: "WorkConnect — HR Consulting & Workforce Management", template: "%s · WorkConnect" },
  description: "HR consulting and workforce management: recruitment, employment contracts, payroll, leave, attendance and HR support.",
};
// Every page depends on the signed-in user / tenant, so render per request.
export const dynamic = "force-dynamic";
export const viewport: Viewport = { themeColor: "#060913" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Sora:wght@500;600;700&display=swap" />
      </head>
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastHost />
      </body>
    </html>
  );
}
