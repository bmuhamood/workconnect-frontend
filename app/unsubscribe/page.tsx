import type { Metadata } from "next";
import { readUnsubscribeToken } from "@/lib/email";
import { ActionButton } from "@/components/action-button";

export const metadata: Metadata = { title: "Unsubscribe" };
export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const ok = token ? await readUnsubscribeToken(token) : null;
  return (
    <div className="container-x grid min-h-[50vh] place-items-center py-16"><div className="card max-w-md p-8 text-center">
      {ok ? <><h1 className="text-xl font-bold">Unsubscribe from marketing emails?</h1><p className="mb-5 mt-2 text-sm text-slate-500">You'll still get important account emails such as contracts and invoices.</p><ActionButton url="/api/unsubscribe" method="POST" data={{ token }} size="md" success="You've been unsubscribed">Unsubscribe</ActionButton></>
        : <><h1 className="text-xl font-bold">Link not valid</h1><p className="mt-2 text-sm text-slate-500">This unsubscribe link is invalid or expired.</p></>}
    </div></div>
  );
}
