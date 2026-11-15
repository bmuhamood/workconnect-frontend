import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { appUrl } from "@/lib/email";

export const INVITE_DAYS = 7;
export const ROLE_LABEL: Record<string, string> = { admin: "Client administrator", employer: "Manager", worker: "Employee" };
export const newToken = () => randomBytes(32).toString("base64url");
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
export const inviteUrl = (token: string) => `${appUrl()}/invite/${token}`;
export const inviteExpiry = () => new Date(Date.now() + INVITE_DAYS * 86_400_000);
export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
