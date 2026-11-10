"use client";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-x grid min-h-[50vh] place-items-center py-16">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">We couldn't load this page. Please try again. If it keeps happening, contact the site administrator.</p>
        {error.digest && <p className="mt-3 text-xs text-slate-400">Reference: {error.digest}</p>}
        <button onClick={reset} className="mt-5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">Try again</button>
      </div>
    </div>
  );
}
