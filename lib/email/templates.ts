export type Brand = { name: string; color: string };
export type Rendered = { subject: string; html: string; text: string };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const paragraphs = (s: string) => s.split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px;line-height:1.6">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");

function layout(b: Brand, title: string, inner: string, o: { cta?: { label: string; url: string }; footer?: string } = {}) {
  const cta = o.cta ? `<p style="margin:24px 0"><a href="${esc(o.cta.url)}" style="background:${esc(b.color)};color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;display:inline-block">${esc(o.cta.label)}</a></p>` : "";
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:${esc(b.color)};color:#fff;padding:18px 28px;font-size:18px;font-weight:700">${esc(b.name)}</td></tr>
<tr><td style="padding:28px"><h1 style="margin:0 0 16px;font-size:22px">${esc(title)}</h1>${inner}${cta}</td></tr>
<tr><td style="padding:16px 28px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.5">${o.footer ?? `You received this email because you have an account with ${esc(b.name)}.`}</td></tr>
</table></td></tr></table></body></html>`;
}
const strip = (t: string, cta?: { label: string; url: string }) => t + (cta ? `\n\n${cta.label}: ${cta.url}` : "");

export const templates = {
  welcome(b: Brand, d: { name: string; role: string; url: string }): Rendered {
    const next = d.role === "worker" ? "Complete your profile so employers can find and trust you." : d.role === "employer" ? "Post your first job or browse verified workers." : "Invite your team and set up your workspace.";
    const body = `Hi ${d.name},\n\nWelcome to ${b.name}! ${next}`;
    const cta = { label: "Open your dashboard", url: d.url };
    return { subject: `Welcome to ${b.name}`, html: layout(b, `Welcome, ${d.name}`, paragraphs(body), { cta }), text: strip(body, cta) };
  },
  notice(b: Brand, d: { title: string; body: string; cta?: { label: string; url: string }; followUp?: boolean }): Rendered {
    const subject = d.followUp ? `Reminder: ${d.title}` : d.title;
    return { subject, html: layout(b, d.title, paragraphs(d.body), { cta: d.cta }), text: strip(d.body, d.cta) };
  },
  invoice(b: Brand, d: { name: string; number: string; total: string; due: string; url: string; reminder?: boolean }): Rendered {
    const body = `Hi ${d.name},\n\n${d.reminder ? "A friendly reminder that" : "Your"} invoice ${d.number} for ${d.total} is due on ${d.due}.`;
    const cta = { label: "View and pay invoice", url: d.url };
    return { subject: `${d.reminder ? "Reminder: " : ""}Invoice ${d.number} · ${d.total}`, html: layout(b, `Invoice ${d.number}`, paragraphs(body), { cta }), text: strip(body, cta) };
  },
  receipt(b: Brand, d: { name: string; number: string; total: string; method: string }): Rendered {
    const body = `Hi ${d.name},\n\nThank you. We received your payment of ${d.total} for invoice ${d.number} (${d.method.replace(/_/g, " ")}).`;
    return { subject: `Payment received · ${d.number}`, html: layout(b, "Payment received", paragraphs(body)), text: body };
  },
  campaign(b: Brand, d: { subject: string; body: string; unsubscribeUrl: string; cta?: { label: string; url: string } }): Rendered {
    const footer = `You are receiving this because you opted in to updates from ${esc(b.name)}. <a href="${esc(d.unsubscribeUrl)}" style="color:#64748b">Unsubscribe</a>`;
    return { subject: d.subject, html: layout(b, d.subject, paragraphs(d.body), { cta: d.cta, footer }), text: strip(d.body, d.cta) + `\n\nUnsubscribe: ${d.unsubscribeUrl}` };
  },
};
