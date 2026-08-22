import { useEffect, useState } from 'react';
import { XIcon } from 'lucide-react';
import { api, Dashboard as DashboardData } from '../api';
import { StreakCalendar } from './StreakCalendar';

type DashboardProps = {
  studentId: string;
  studentName: string;
  onClose: () => void;
};

export function Dashboard({ studentId, studentName, onClose }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.getDashboard(studentId).then(setData);
  }, [studentId]);

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-cream">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold text-ink">{studentName}'s progress</h1>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/15 p-2 text-ink hover:bg-cream-soft"
            aria-label="Close parent view"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {!data ? (
          <p className="mt-8 text-ink-muted">Loading...</p>
        ) : (
          <div className="mt-8 flex flex-col gap-5">
            <StreakCalendar studentId={studentId} />

            {data.skills.length === 0 ? (
              <p className="text-ink-muted">No sessions yet — come back after a bit of practice.</p>
            ) : (
              data.skills.map((skill) => (
              <div key={skill.skill} className="rounded-[24px] bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold capitalize text-ink">{skill.skill}</h2>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      skill.strength ? 'bg-lime/40 text-ink' : skill.needsHelp ? 'bg-coral-soft text-ink' : 'bg-ink/10 text-ink'
                    ].join(' ')}
                  >
                    {skill.strength ? 'Strength' : skill.needsHelp ? 'Needs help' : 'Building'}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">Mastery</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                    <div className="h-full rounded-full bg-lime" style={{ width: `${skill.mastery}%` }} />
                  </div>
                  <span className="font-display text-sm font-semibold text-ink">{skill.mastery}%</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <Stat label="Level" value={String(skill.difficulty)} />
                  <Stat label="Streak" value={String(skill.streak)} />
                  <Stat label="Questions" value={String(skill.questionsSeen)} />
                </div>

                {skill.recentRoteAnswers > 0 ? (
                  <p className="mt-4 rounded-xl bg-coral-soft p-3 text-sm text-ink/80">
                    {skill.recentRoteAnswers} recent correct answer{skill.recentRoteAnswers > 1 ? 's' : ''} came
                    without a clear explanation — worth a quick chat about the "why" together.
                  </p>
                ) : null}
              </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream-soft py-3">
      <p className="font-display text-lg font-semibold text-ink">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}
