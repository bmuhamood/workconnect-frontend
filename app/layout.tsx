import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastHost } from "@/components/toast-host";

export const metadata: Metadata = {
  title: { default: "Work Connect UG Ltd — Recruitment, HR Outsourcing & Payroll in Uganda", template: "%s · Work Connect UG" },
  description: "Connecting businesses with the right talent. Professional recruitment, HR outsourcing, payroll management and workforce solutions in Uganda.",
};
// Every page depends on the signed-in user / tenant, so render per request.
export const dynamic = "force-dynamic";
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#060913" }] };

// Applies the saved display settings before first paint so there is no flash of the wrong theme.
const DISPLAY_BOOT = `(function(){var d=document.documentElement;try{var s=JSON.parse(localStorage.getItem("wc-display")||"{}");var t=s.theme||(matchMedia("(prefers-contrast: more)").matches?"contrast":matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");d.dataset.theme=t;if(s.text&&s.text!=="md")d.dataset.text=s.text;if(s.font==="readable")d.dataset.font="readable";if(s.motion==="reduce")d.dataset.motion="reduce"}catch(e){d.dataset.theme="light"}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: DISPLAY_BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Sora:wght@500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap" />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">Skip to main content</a>
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">{children}</main>
        <Footer />
        <ToastHost />
      </body>
    </html>
  );
}
