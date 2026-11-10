import { signParams, isTenantImageUrl } from "../lib/cloudinary";
// Example from Cloudinary's documentation for signed uploads.
const sig = signParams({ eager: "w_400,h_300,c_pad|w_260,h_200,c_crop", public_id: "sample_image", timestamp: 1315060510 }, "abcd");
const ok = sig === "bfd09f95f331f558cbd1320e67aa8d488770583e";
console.log(ok ? "PASS" : "FAIL", "signature matches Cloudinary's documented example", sig);
const t = "11111111-1111-1111-1111-111111111111", o = "22222222-2222-2222-2222-222222222222";
const base = (id: string) => `https://res.cloudinary.com/demo/image/upload/v1/workconnect/${id}/avatars/a.jpg`;
const checks = [isTenantImageUrl(base(t), "demo", t), !isTenantImageUrl(base(o), "demo", t), !isTenantImageUrl("https://evil.com/demo/image/upload/workconnect/" + t + "/avatars/a.jpg", "demo", t), !isTenantImageUrl(base(t).replace("res.cloudinary.com/demo", "res.cloudinary.com/other"), "demo", t)];
console.log(checks.every(Boolean) ? "PASS" : "FAIL", "avatar URL must be on our cloud, in our tenant's folder");
process.exit(ok && checks.every(Boolean) ? 0 : 1);
