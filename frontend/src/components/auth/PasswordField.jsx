import { useState } from "react";
import AuthField from "./AuthField";

const EyeIcon = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    {off && (
      <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    )}
  </svg>
);

/** Password input with a show/hide toggle and a Caps Lock warning. */
export default function PasswordField({ error, hint, ...props }) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  return (
    <AuthField
      {...props}
      type={visible ? "text" : "password"}
      error={error}
      hint={!error && capsLock ? "Caps Lock is on" : hint}
      onKeyUp={(e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false)}
      onBlur={(e) => {
        setCapsLock(false);
        props.onBlur?.(e);
      }}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="p-2 rounded-lg text-[var(--nexus-text-muted)] hover:text-[var(--nexus-text)] hover:bg-white/5 transition-colors"
        >
          <EyeIcon off={visible} />
        </button>
      }
    />
  );
}
