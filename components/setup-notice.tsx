export function SetupNotice({ what = "This page" }: { what?: string }) {
  return (
    <div className="container-x grid min-h-[50vh] place-items-center py-16">
      <div className="card max-w-lg p-8">
        <h1 className="text-xl font-bold">{what} isn't ready yet</h1>
        <p className="mt-2 text-sm text-slate-500">The site can't read its data. This usually means the database tables haven't been created, or no organisation exists yet.</p>
        <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
          <li>Run <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run db:migrate</code> against the production database.</li>
          <li>Open <a className="text-accent underline" href="/api/health">/api/health</a> and fix anything marked false.</li>
          <li>Create the first organisation from <a className="text-accent underline" href="/register">Create account</a>.</li>
        </ol>
      </div>
    </div>
  );
}
