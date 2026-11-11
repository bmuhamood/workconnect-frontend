const ROWS: string[][] = [
  ["Nannies", "Maids", "Caregivers", "Chefs", "Waiters", "Housekeepers", "Security guards", "Drivers", "Gardeners", "Cleaners"],
  ["Cashiers", "Teachers", "Electricians", "Welders", "Machine operators", "Photographers", "Beauty therapists", "IT professionals", "Sales executives", "And more"],
];
/** Two opposing, pausable tickers of the roles we recruit for. The duplicate set is hidden from assistive tech. */
export function RolesMarquee() {
  return (
    <div className="space-y-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      {ROWS.map((row, r) => (
        <div key={r} className="group flex w-max gap-3 hover:[animation-play-state:paused]" style={{ animation: `marquee ${r ? 38 : 46}s linear infinite ${r ? "reverse" : "normal"}` }}>
          {[0, 1].map((dup) => (
            <ul key={dup} className="flex shrink-0 gap-3" aria-hidden={dup === 1}>
              {row.map((t) => <li key={t} className="rounded-full border border-slate-300/50 bg-slate-100/50 px-5 py-2.5 font-display text-sm font-medium text-slate-700">{t}</li>)}
            </ul>
          ))}
        </div>
      ))}
    </div>
  );
}
