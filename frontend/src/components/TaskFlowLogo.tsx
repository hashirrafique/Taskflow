'use client';

/**
 * TaskFlow brand logo — Kanban columns mark
 * Three vertical bars (short / tall / medium) in a violet→pink gradient.
 * The `size` prop controls the icon square dimensions (default 36px).
 * The gradient ID is randomised so multiple instances on a page don't clash.
 */
export default function TaskFlowLogo({ size = 36 }: { size?: number }) {
  const id = `tfg-${size}`;
  const r = Math.round(size * 0.28); // border-radius scales with size

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TaskFlow logo"
      style={{ borderRadius: r, flexShrink: 0 }}
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </linearGradient>
        {/* Column gradient — violet → pink */}
        <linearGradient id={`${id}-cols`} x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="60%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        {/* Glow filter */}
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Icon background */}
      <rect width="36" height="36" rx={r} fill={`url(#${id}-bg)`} />

      {/* Subtle inner border */}
      <rect width="36" height="36" rx={r} stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />

      {/* Three Kanban columns — left short, middle tall, right medium */}
      <g filter={`url(#${id}-glow)`} fill={`url(#${id}-cols)`}>
        {/* Left column: x=7, bottom-aligned, height 11 */}
        <rect x="7" y="18" width="5" height="11" rx="1.5" />
        {/* Middle column: x=15.5, tallest, height 18 */}
        <rect x="15.5" y="11" width="5" height="18" rx="1.5" />
        {/* Right column: x=24, medium, height 14 */}
        <rect x="24" y="15" width="5" height="14" rx="1.5" />
      </g>

      {/* Tiny top shine */}
      <rect width="36" height="18" rx={r} fill="url(#shine)" opacity="0.04" />
      <defs>
        <linearGradient id="shine" x1="18" y1="0" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
