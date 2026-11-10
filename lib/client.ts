export async function call<T = unknown>(url: string, method: string, data?: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: data ? { "Content-Type": "application/json" } : undefined, body: data ? JSON.stringify(data) : undefined });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong");
  return json as T;
}
export const toast = (message: string, type: "ok" | "error" = "ok") =>
  window.dispatchEvent(new CustomEvent("wc-toast", { detail: { message, type } }));
