interface LogoProps {
  size?: number;
  /** Show the "BiblioJala" wordmark next to the mark. */
  withText?: boolean;
  /** Color of the wordmark text (defaults to currentColor). */
  textColor?: string;
  className?: string;
}

/**
 * BiblioJala brand mark — an open book inside a rounded, gradient badge.
 * Pure inline SVG so it scales crisply and needs no external asset.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  const id = 'bj-grad';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="BiblioJala"
    >
      <defs>
        <linearGradient id={id} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6A94F" />
          <stop offset="0.55" stopColor="#C8893A" />
          <stop offset="1" stopColor="#8A5418" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill={`url(#${id})`} />
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" stroke="#000" strokeOpacity="0.06" />
      {/* Open book — two pages */}
      <path
        d="M23 16.4c-3-2-7.6-2.6-11.4-2.3-.9.1-1.6.9-1.6 1.8v15.9c0 1 .9 1.8 1.9 1.7 3.4-.3 7.6.3 11.1 2.3V16.4Z"
        fill="#FDF6EA"
      />
      <path
        d="M25 16.4c3-2 7.6-2.6 11.4-2.3.9.1 1.6.9 1.6 1.8v15.9c0 1-.9 1.8-1.9 1.7-3.4-.3-7.6.3-11.1 2.3V16.4Z"
        fill="#FBEFD9"
      />
      {/* page lines */}
      <g stroke="#C8893A" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round">
        <path d="M14 20.5c2.2-.2 4.4 0 6.2.7" />
        <path d="M14 24.5c2.2-.2 4.4 0 6.2.7" />
        <path d="M33.9 20.5c-2.2-.2-4.4 0-6.2.7" />
        <path d="M33.9 24.5c-2.2-.2-4.4 0-6.2.7" />
      </g>
      {/* spine */}
      <path d="M24 16.4V38" stroke="#8A5418" strokeOpacity="0.35" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ size = 40, withText = true, textColor, className }: LogoProps) {
  return (
    <span className={`brand-logo${className ? ` ${className}` : ''}`}>
      <LogoMark size={size} />
      {withText && (
        <span className="brand-logo__word" style={textColor ? { color: textColor } : undefined}>
          BiblioJala
        </span>
      )}
    </span>
  );
}
