import { useId } from "react";

/**
 * Labelled text field shared by the login and register forms.
 * Shows an inline error (or a hint) under the input and wires both to the
 * input for screen readers. `trailing` renders inside the right edge
 * (used for the show/hide password button).
 */
export default function AuthField({ label, error, hint, trailing, ...inputProps }) {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error || hint ? messageId : undefined}
          className={`w-full rounded-xl bg-[var(--nexus-bg-elevated)] border px-4 py-3 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--nexus-text-muted)]/60 focus:ring-4 ${
            trailing ? "pr-12" : ""
          } ${
            error
              ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/10"
              : "border-[var(--nexus-border)] focus:border-[var(--nexus-violet)] focus:ring-[rgba(107,90,249,0.15)]"
          }`}
          {...inputProps}
        />

        {trailing && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {trailing}
          </div>
        )}
      </div>

      {error ? (
        <p id={messageId} role="alert" className="mt-1.5 text-[13px] text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-[13px] text-[var(--nexus-text-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
