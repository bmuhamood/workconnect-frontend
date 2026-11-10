"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";

export function ActionButton({ url, method = "PATCH", data, children, variant = "primary", size = "sm", confirm, success, redirect, className }: {
  url: string; method?: string; data?: unknown; children: React.ReactNode; variant?: Parameters<typeof btn>[0]; size?: "sm" | "md" | "lg";
  confirm?: string; success?: string; redirect?: string; className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    try {
      await call(url, method, data);
      if (success) toast(success);
      if (redirect) router.push(redirect);
      router.refresh();
    } catch (e) { toast((e as Error).message, "error"); }
    finally { setBusy(false); }
  }
  return <button onClick={run} disabled={busy} className={btn(variant, size) + (className ? " " + className : "")}>{busy && <Loader2 className="size-4 animate-spin" />}{children}</button>;
}
