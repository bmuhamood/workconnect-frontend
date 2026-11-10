"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { call, toast } from "@/lib/client";
import { Avatar } from "@/components/ui";

const MAX = 5 * 1024 * 1024;
export function AvatarUpload({ name, src }: { name: string; src?: string | null }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return toast("Choose a JPG, PNG or WebP image", "error");
    if (file.size > MAX) return toast("Image must be under 5 MB", "error");
    setBusy(true);
    try {
      const s = await call<{ cloudName: string; apiKey: string; timestamp: number; folder: string; allowed_formats: string; signature: string }>("/api/uploads/sign", "POST");
      const fd = new FormData();
      fd.append("file", file); fd.append("api_key", s.apiKey); fd.append("timestamp", String(s.timestamp));
      fd.append("folder", s.folder); fd.append("allowed_formats", s.allowed_formats); fd.append("signature", s.signature);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? "Upload failed");
      await call("/api/profile/avatar", "PATCH", { url: json.secure_url });
      toast("Photo updated"); router.refresh();
    } catch (err) { toast((err as Error).message, "error"); } finally { setBusy(false); }
  }
  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} src={src} size={72} />
      <div>
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60">{busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}{src ? "Change photo" : "Upload photo"}</button>
        <p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP, up to 5 MB</p>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} />
      </div>
    </div>
  );
}
