import "server-only";
import { createHash } from "node:crypto";

export type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string };

/** Reads CLOUDINARY_URL (cloudinary://key:secret@cloud) or the three separate variables. */
export function cloudinaryConfig(): CloudinaryConfig | null {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m && !m[1].startsWith("<")) return { apiKey: m[1], apiSecret: m[2], cloudName: m[3] };
  }
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

/** Cloudinary signature: sha1 of sorted `k=v` pairs joined by & followed by the API secret. */
export function signParams(params: Record<string, string | number>, secret: string) {
  const str = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  return createHash("sha1").update(str + secret).digest("hex");
}

/** Uploads are namespaced per tenant so assets of different organisations never share a folder. */
export const tenantFolder = (tenantId: string, kind: "avatars" | "documents") => `workconnect/${tenantId}/${kind}`;

export function isTenantImageUrl(url: string, cloudName: string, tenantId: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname === "res.cloudinary.com" && u.pathname.startsWith(`/${cloudName}/image/upload/`) && u.pathname.includes(`/workconnect/${tenantId}/avatars/`);
  } catch { return false; }
}
