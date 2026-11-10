import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastHost } from "@/components/toast-host";

export const metadata: Metadata = {
  title: { default: "WorkConnect — Hire trusted workers in Uganda", template: "%s · WorkConnect" },
  description: "Find verified house help, nannies, drivers, cooks and more — with contracts, payments and reviews built in.",
};
export const viewport: Viewport = { themeColor: "#4f46e5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastHost />
      </body>
    </html>
  );
}
