export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs><linearGradient id="lg" x1="2" y1="2" x2="30" y2="30"><stop stopColor="#6e80ff" /><stop offset="1" stopColor="#3de0ff" /></linearGradient></defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#0d1326" stroke="url(#lg)" strokeWidth="1.5" />
      <path d="M8.5 21.5 16 9.5l7.5 12" stroke="url(#lg)" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8.5" cy="21.5" r="2.4" fill="#6e80ff" /><circle cx="23.5" cy="21.5" r="2.4" fill="#3de0ff" /><circle cx="16" cy="9.5" r="2.4" fill="#fff" />
    </svg>
  );
}
