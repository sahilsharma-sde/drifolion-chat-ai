export default function SubmitButton({ loading, loadingText, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-medium text-white transition-[opacity,transform] hover:opacity-95 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nexus-cyan)]"
      style={{ background: "var(--nexus-gradient)" }}
    >
      {loading && (
        <span
          className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
          aria-hidden="true"
        />
      )}
      {loading ? loadingText : children}
    </button>
  );
}
