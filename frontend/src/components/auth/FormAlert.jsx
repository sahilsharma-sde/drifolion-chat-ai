/** Form-level message: an error (red) or a neutral notice. */
export default function FormAlert({ children, tone = "error" }) {
  if (!children) return null;

  const styles =
    tone === "error"
      ? "text-red-300 bg-red-500/10 border-red-500/25"
      : "text-[var(--nexus-text-muted)] bg-white/5 border-[var(--nexus-border)]";

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`text-sm rounded-xl border px-3.5 py-2.5 ${styles}`}
    >
      {children}
    </p>
  );
}
