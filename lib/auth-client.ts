"use client";
// Browser-side identity calls. Neon Auth in production, local dev auth otherwise.
export type Mode = "neon" | "local";
async function neon() {
  const { createAuthClient } = await import("@neon/auth/next");
  return createAuthClient();
}
async function post(url: string, data: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong");
}

export async function signIn(mode: Mode, email: string, password: string, demo = false) {
  if (mode === "local") return post("/api/local-auth/login", { email, password });
  // Demo accounts (seeded, password only) are tried first when the demo switch is on; everyone else goes to Neon Auth.
  if (demo) { try { await post("/api/local-auth/login", { email, password }); return; } catch { /* not a demo account */ } }
  const { error } = await (await neon()).signIn.email({ email, password });
  if (error) throw new Error(error.message || "Incorrect email or password");
}
export async function signUp(mode: Mode, d: { email: string; password: string; firstName: string; lastName: string; phone: string }) {
  if (mode === "local") return post("/api/local-auth/register", d);
  const { error } = await (await neon()).signUp.email({ email: d.email, password: d.password, name: `${d.firstName} ${d.lastName}` });
  if (error) throw new Error(error.message || "Could not create your account");
}
export async function signOut(mode: Mode) {
  await post("/api/local-auth/logout", {}).catch(() => {});
  if (mode === "local") return;
  await (await neon()).signOut().catch(() => {});
}
