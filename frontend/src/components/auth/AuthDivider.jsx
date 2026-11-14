export default function AuthDivider({ children }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1 bg-[var(--nexus-border)]" />
      <span className="text-xs text-[var(--nexus-text-muted)]">{children}</span>
      <div className="h-px flex-1 bg-[var(--nexus-border)]" />
    </div>
  );
}
