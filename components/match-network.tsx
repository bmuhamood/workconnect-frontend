import { initials } from "@/lib/format";

type Node = { name: string; role: string; verified: boolean };
// Fixed orbit positions (viewBox 560x480, hub at 280,240)
const POS: [number, number][] = [[96, 96], [250, 40], [448, 92], [500, 258], [410, 410], [214, 436], [64, 300]];

/** Hero visual: real workers orbiting a hiring hub, with live "match" pulses flowing in. Decorative (aria-hidden). */
export function MatchNetwork({ people }: { people: Node[] }) {
  const nodes = people.slice(0, POS.length);
  return (
    <div className="relative mx-auto w-full max-w-[560px]" aria-hidden="true">
      <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgb(79_92_245/.35),transparent_65%)] blur-2xl" />
      <svg viewBox="0 0 560 480" className="h-auto w-full overflow-visible">
        <defs>
          <radialGradient id="hub" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#8794ff" /><stop offset="1" stopColor="#4f5cf5" /></radialGradient>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6e80ff" stopOpacity=".15" /><stop offset="1" stopColor="#3de0ff" stopOpacity=".9" /></linearGradient>
        </defs>
        {[70, 130, 195].map((r) => <circle key={r} cx="280" cy="240" r={r} fill="none" stroke="rgb(148 163 255)" strokeOpacity=".1" strokeDasharray="2 7" />)}
        {nodes.map((_, i) => <line key={`e${i}`} x1={POS[i][0]} y1={POS[i][1]} x2="280" y2="240" stroke="url(#edge)" strokeWidth="1.4" strokeDasharray="6 6" className="animate-flow" style={{ animationDelay: `${i * -0.7}s` }} />)}
        <circle cx="280" cy="240" r="46" fill="url(#hub)" opacity=".18" className="animate-pulse-node" style={{ transformOrigin: "280px 240px" }} />
        <circle cx="280" cy="240" r="30" fill="url(#hub)" />
        <path d="M268 250l12-22 12 22M272 246h16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {nodes.map((n, i) => {
          const [x, y] = POS[i];
          return (
            <g key={n.name} transform={`translate(${x} ${y})`}>
              {n.verified && <circle r="27" fill="none" stroke="#3de0ff" strokeOpacity=".7" strokeWidth="1.5" className="animate-pulse-node" style={{ animationDelay: `${i * 0.4}s`, transformOrigin: "center" }} />}
              <circle r="21" fill="#0d1326" stroke="rgb(148 163 255)" strokeOpacity=".5" />
              <text textAnchor="middle" dy=".35em" fontSize="12" fontWeight="600" fill="#e3e8ff" style={{ fontFamily: "var(--font-display)" }}>{initials(n.name)}</text>
            </g>
          );
        })}
      </svg>
      {nodes.slice(0, 2).map((n, i) => (
        <div key={n.name} className="card absolute hidden px-3 py-2 text-xs sm:block" style={i === 0 ? { left: "-2%", top: "2%" } : { right: "-2%", bottom: "6%" }}>
          <div className="font-semibold text-slate-900">{n.name}</div>
          <div className="text-slate-500">{n.role}{n.verified ? " · verified" : ""}</div>
        </div>
      ))}
    </div>
  );
}
