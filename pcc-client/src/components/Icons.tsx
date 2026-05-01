import type { FC, ReactNode, SVGProps } from "react";

// Stroke-based icons. Pass any standard SVG props (className, etc.).
// All icons share the same viewBox/stroke style so they line up visually.
const make = (children: ReactNode): FC<SVGProps<SVGSVGElement>> => {
  const Icon: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
  return Icon;
};

// ── Top icon-rail ──────────────────────────────────────────────────────
export const Home = make(<path d="M3 11.5L12 4l9 7.5M5 10v10h14V10" />);

export const Newspaper = make(
  <>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="M7 9h10M7 13h10M7 17h6" />
  </>,
);

export const Bars = make(
  <>
    <path d="M3 21h18" />
    <path d="M6 21V13M12 21V8M18 21V5" />
  </>,
);

export const Cog = make(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>,
);

// ── Settings sidebar ──────────────────────────────────────────────────
export const Phone = make(
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
);

export const NoEntry = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.6 5.6l12.8 12.8" />
  </>,
);

export const Sitemap = make(
  <>
    <rect x="9" y="2" width="6" height="4" rx="1" />
    <rect x="2" y="18" width="6" height="4" rx="1" />
    <rect x="9" y="18" width="6" height="4" rx="1" />
    <rect x="16" y="18" width="6" height="4" rx="1" />
    <path d="M12 6v6M5 18v-3h14v3M12 12v6" />
  </>,
);

export const UserPlus = make(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M22 11h-6" />
  </>,
);

export const IdCard = make(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="11" r="2.5" />
    <path d="M3.5 18.5c.8-2 2.5-3 5-3s4.2 1 5 3M14 9h5M14 12h5M14 15h3" />
  </>,
);

export const Layers = make(
  <>
    <path d="M12 2L2 7l10 5 10-5z" />
    <path d="M2 12l10 5 10-5" />
    <path d="M2 17l10 5 10-5" />
  </>,
);

export const Music = make(
  <>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </>,
);

export const AlarmClock = make(
  <>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2M5 5l-2 2M19 5l2 2" />
  </>,
);

export const Briefcase = make(
  <>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </>,
);

// ── Misc ──────────────────────────────────────────────────────────────
export const ChevronRight = make(<path d="M9 18l6-6-6-6" />);

export const SignOut = make(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </>,
);
