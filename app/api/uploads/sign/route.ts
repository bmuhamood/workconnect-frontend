import { route, fail } from "@/lib/http";
import { cloudinaryConfig, signParams, tenantFolder } from "@/lib/cloudinary";

/** Returns a short-lived signed payload so the browser uploads straight to Cloudinary (the API secret never leaves the server). */
export const POST = route({}, async (_req, { session }) => {
  const cfg = cloudinaryConfig();
  if (!cfg) throw fail(503, "Image uploads are not configured yet");
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { allowed_formats: "jpg,jpeg,png,webp", folder: tenantFolder(session.tenantId, "avatars"), timestamp };
  return { cloudName: cfg.cloudName, apiKey: cfg.apiKey, ...params, signature: signParams(params, cfg.apiSecret) };
});
