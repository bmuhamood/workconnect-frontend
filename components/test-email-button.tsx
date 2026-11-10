"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";

export function TestEmailButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} className={btn("secondary", "md")} onClick={async () => {
      setBusy(true);
      try {
        const r = await call<{ to: string }>("/api/admin/test-email", "POST");
        toast(`Test email queued for ${r.to}`);
        setTimeout(() => { router.refresh(); setBusy(false); }, 3500); // let the send finish, then show its status below
      } catch (e) { toast((e as Error).message, "error"); setBusy(false); }
    }}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}Send a test email to me</button>
  );
}
