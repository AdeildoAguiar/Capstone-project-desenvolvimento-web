import { CSSProperties } from 'react';

/**
 * Line-icon set (stroke = currentColor). Replaces emoji across the UI so the
 * product has a consistent, professional visual language. 24×24 grid.
 */
export type IconName =
  | 'search' | 'book-open' | 'grid' | 'upload' | 'download' | 'return'
  | 'star' | 'star-fill' | 'chart' | 'logout' | 'sun' | 'moon'
  | 'mail' | 'lock' | 'user' | 'users' | 'phone' | 'eye' | 'eye-off'
  | 'check' | 'check-circle' | 'alert' | 'x' | 'arrow-right' | 'arrow-left'
  | 'inbox' | 'calendar' | 'edit' | 'trash' | 'badge' | 'clock'
  | 'shield' | 'database' | 'sparkle' | 'book'
  | 'map-pin' | 'home' | 'save';

const PATHS: Record<IconName, JSX.Element> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  'book-open': <><path d="M12 7c-1.8-1.2-4.5-1.6-7-1.5-.6 0-1 .5-1 1V18c0 .6.5 1 1 1 2.5-.1 5.2.3 7 1.5" /><path d="M12 7c1.8-1.2 4.5-1.6 7-1.5.6 0 1 .5 1 1V18c0 .6-.5 1-1 1-2.5-.1-5.2.3-7 1.5" /><path d="M12 7v13.5" /></>,
  book: <><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v18H6.5A1.5 1.5 0 0 1 5 19.5Z" /><path d="M5 17.5A1.5 1.5 0 0 1 6.5 16H19" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  upload: <><path d="M12 15V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /></>,
  download: <><path d="M12 4v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" /></>,
  return: <><path d="M9 10 4 15l5 5" /><path d="M4 15h11a5 5 0 0 0 5-5 5 5 0 0 0-5-5H8" /></>,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9Z" />,
  'star-fill': <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9Z" fill="currentColor" stroke="none" />,
  chart: <><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7" y="12" width="3" height="5" rx="0.5" fill="currentColor" stroke="none" /><rect x="12" y="8" width="3" height="9" rx="0.5" fill="currentColor" stroke="none" /><rect x="17" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" /></>,
  logout: <><path d="M15 5V4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" /><path d="M9 12h11" /><path d="m16.5 8.5 3.5 3.5-3.5 3.5" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 5.5a3 3 0 0 1 0 5.8" /><path d="M17 14.2a5.5 5.5 0 0 1 3.5 4.8" /></>,
  phone: <path d="M6 3h3l1.5 5-2 1.5a11 11 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <><path d="M4 4l16 16" /><path d="M9.5 9.6A3 3 0 0 0 14.4 14M6.5 6.7C3.9 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.6 0 3-.4 4.2-1M11 5.6c.3 0 .7-.1 1-.1 6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2 2.7" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  'check-circle': <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></>,
  alert: <><path d="M12 4 2.5 20h19Z" /><path d="M12 10v4" /><circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  'arrow-right': <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
  'arrow-left': <><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></>,
  inbox: <><path d="M4 13l2.5-7.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L20 13" /><path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-5a3 3 0 0 1-6 0Z" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M8 3v4M16 3v4" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16Z" /><path d="M14 6l4 4" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></>,
  badge: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  shield: <><path d="M12 3l7 2.5V11c0 5-3.5 8-7 10-3.5-2-7-5-7-10V5.5Z" /><path d="m9 12 2 2 4-4" /></>,
  database: <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" /><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
  sparkle: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6Z" />,
  'map-pin': <><path d="M12 21c4.5-4.2 7-7.8 7-11a7 7 0 1 0-14 0c0 3.2 2.5 6.8 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  home: <><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" /><path d="M10 20v-5h4v5" /></>,
  save: <><path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" /><path d="M8 4v5h7" /><path d="M8 20v-5h8v5" /></>,
};

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Icon({ name, size = 20, strokeWidth = 1.75, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
