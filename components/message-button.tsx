"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";
import { call, toast } from "@/lib/client";
import { btn } from "@/components/ui";

export function MessageButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button disabled={busy} className={btn("primary", "md") + " w-full"} onClick={async () => {
      setBusy(true);
      try { const r = await call<{ id: string }>("/api/conversations", "POST", { userId }); router.push(`/messages?c=${r.id}`); }
      catch (e) { toast((e as Error).message, "error"); setBusy(false); }
    }}>{busy ? <Loader2 className="size-4 animate-spin" /> : <MessageSquare className="size-4" />}Message</button>
  );
}
