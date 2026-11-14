import { useId } from "react";

// Original mark for Nexus AI: three orbiting nodes converging on a central
// hub, echoing the app's actual architecture (supervisor routing a query to
// one of several specialist agents). Pure SVG - scales crisply at any size,
// no external asset, nothing borrowed.
export function LogoMark({ size = 28 }) {
  // Unique per instance: with a shared id, a copy inside a display:none
  // container (e.g. the desktop-only login panel) steals the gradient and
  // the visible copy loses its stroke.
  const gradId = `nx-grad-${useId().replace(/:/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b7bff" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>

      <circle cx="16" cy="16" r="15" fill="#0b0e1f" stroke={`url(#${gradId})`} strokeWidth="1.2" />

      <g stroke={`url(#${gradId})`} strokeWidth="1.4" strokeLinecap="round">
        <line x1="16" y1="16" x2="16" y2="7" />
        <line x1="16" y1="16" x2="23.2" y2="20.5" />
        <line x1="16" y1="16" x2="8.8" y2="20.5" />
      </g>

      <circle cx="16" cy="16" r="4" fill={`url(#${gradId})`} />
      <circle cx="16" cy="7" r="2.3" fill="#0b0e1f" stroke={`url(#${gradId})`} strokeWidth="1.4" />
      <circle cx="23.2" cy="20.5" r="2.3" fill="#0b0e1f" stroke={`url(#${gradId})`} strokeWidth="1.4" />
      <circle cx="8.8" cy="20.5" r="2.3" fill="#0b0e1f" stroke={`url(#${gradId})`} strokeWidth="1.4" />
    </svg>
  );
}

export default function Logo({ size = 28, showWordmark = true, wordmarkClassName = "" }) {
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={size} />
      {showWordmark && (
        <span className={`font-display font-semibold tracking-tight ${wordmarkClassName}`}>
          Drifolion AI
        </span>
      )}
    </div>
  );
}
