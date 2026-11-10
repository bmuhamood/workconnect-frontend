export const ugx = (n: number) => `UGX ${n.toLocaleString("en-UG")}`;
export const ugxRange = (a: number, b: number) => `UGX ${a.toLocaleString("en-UG")} – ${b.toLocaleString("en-UG")}`;
export function timeAgo(d: Date | string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  const u: [number, string][] = [[31536000, "y"], [2592000, "mo"], [86400, "d"], [3600, "h"], [60, "m"]];
  for (const [n, l] of u) if (s >= n) return `${Math.floor(s / n)}${l} ago`;
  return "just now";
}
export const initials = (n: string) => n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
export const label = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
export const rating = (x100: number) => (x100 / 100).toFixed(1);
