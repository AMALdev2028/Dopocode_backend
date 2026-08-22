import { FlameIcon, LayoutDashboardIcon } from 'lucide-react';

type HeaderProps = {
  studentName?: string;
  streak?: number;
  mastery?: number;
  onOpenDashboard?: () => void;
  showDashboardLink?: boolean;
};

export function Header({ studentName, streak, mastery, onOpenDashboard, showDashboardLink }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-ink/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-lime">
            P
          </span>
          The Primer
          {studentName ? <span className="ml-1 font-sans text-sm font-normal text-ink-muted">· {studentName}</span> : null}
        </div>

        <div className="flex items-center gap-4">
          {typeof streak === 'number' && streak > 0 ? (
            <div className="flex items-center gap-1.5 rounded-full bg-coral-soft px-3 py-1.5 text-sm font-semibold text-ink">
              <FlameIcon className="h-4 w-4 text-coral" aria-hidden="true" />
              {streak}
            </div>
          ) : null}
          {typeof mastery === 'number' ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">Mastery</span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-lime" style={{ width: `${Math.round(mastery * 100)}%` }} />
              </div>
            </div>
          ) : null}
          {showDashboardLink ? (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-cream-soft"
            >
              <LayoutDashboardIcon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Parent view</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
