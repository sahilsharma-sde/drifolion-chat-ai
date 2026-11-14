import NexusGraphArt from "./NexusGraphArt";
import Logo from "../branding/Logo";

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-[var(--nexus-bg)] text-[var(--nexus-text)]">
      {/* Brand / signature panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[var(--nexus-bg-elevated)] border-r border-[var(--nexus-border)]">
        <Logo size={30} wordmarkClassName="text-lg" />

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <NexusGraphArt />
          </div>
        </div>

        <div className="max-w-sm">
          <p className="font-display text-2xl leading-snug mb-2">
            One question in. The right agent answers.
          </p>
          <p className="text-sm text-[var(--nexus-text-muted)] mb-6">
            Nexus routes every message to a supervisor, then hands it off to
            a RAG, coding, or general-purpose agent — with memory carried
            across the conversation.
          </p>
          <p className="text-xs text-[var(--nexus-text-muted)] opacity-60">
            Created by Sahil Sharma · Powered by ADMEC Multimedia
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-10">
            <Logo size={26} wordmarkClassName="text-lg" />
          </div>

          {eyebrow && (
            <p className="text-xs uppercase tracking-widest text-[var(--nexus-violet)] mb-2 font-medium">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-semibold mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--nexus-text-muted)] mb-8">
              {subtitle}
            </p>
          )}

          {children}

          <p className="lg:hidden text-center text-xs text-[var(--nexus-text-muted)] opacity-60 mt-10">
            Created by Sahil Sharma · Powered by ADMEC Multimedia
          </p>
        </div>
      </div>
    </div>
  );
}
