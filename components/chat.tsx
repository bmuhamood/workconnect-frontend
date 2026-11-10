"use client";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { call, toast } from "@/lib/client";
import { cn } from "@/components/ui";

type Msg = { id: string; senderId: string; body: string; createdAt: string };
export function Chat({ conversationId, me }: { conversationId: string; me: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const load = async () => { try { setMsgs((await call<{ messages: Msg[] }>(`/api/conversations/${conversationId}`, "GET")).messages); } catch {} };
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [conversationId]); // eslint-disable-line
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try { await call(`/api/conversations/${conversationId}`, "POST", { message: text }); setText(""); await load(); }
    catch (err) { toast((err as Error).message, "error"); } finally { setBusy(false); }
  }
  return (
    <div className="flex h-[60vh] flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No messages yet. Say hello 👋</p>}
        {msgs.map((m) => <div key={m.id} className={cn("flex", m.senderId === me ? "justify-end" : "justify-start")}><div className={cn("max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm", m.senderId === me ? "bg-brand-600 text-onbrand" : "bg-slate-100 text-slate-800")}>{m.body}</div></div>)}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-100 p-3"><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" className="input" maxLength={4000} /><button disabled={busy} className="grid w-11 place-items-center rounded-xl bg-brand-600 text-onbrand hover:bg-brand-700 disabled:opacity-60" aria-label="Send"><Send className="size-4" /></button></form>
    </div>
  );
}
