import { useEffect, useState } from 'react';
import { FlameIcon, StarIcon, TrophyIcon } from 'lucide-react';
import { api, StreakSummary } from '../api';

type StreakCalendarProps = {
  studentId: string;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function StreakCalendar({ studentId }: StreakCalendarProps) {
  const [data, setData] = useState<StreakSummary | null>(null);

  useEffect(() => {
    api.getStreak(studentId).then(setData);
  }, [studentId]);

  if (!data) return null;

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-indexed
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startWeekday = firstOfMonth.getUTCDay(); // 0 = Sunday
  const today = todayStr();

  const cells: { day: number | null; dateStr: string | null }[] = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr });
  }

  const monthLabel = firstOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const daysActiveThisMonth = cells.filter((c) => c.dateStr && data.activityByDate[c.dateStr]).length;

  return (
    <div className="rounded-[24px] bg-white p-6 shadow-card">
      <div className="grid grid-cols-3 gap-3">
        <StatBlock icon={<TrophyIcon className="h-4 w-4" />} label="Total points" value={data.totalPoints} />
        <StatBlock icon={<FlameIcon className="h-4 w-4" />} label="Day streak" value={data.dayStreak} highlight />
        <StatBlock icon={<StarIcon className="h-4 w-4" />} label="Best streak" value={data.longestDayStreak} />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-semibold text-ink">{monthLabel}</p>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">
            {daysActiveThisMonth} day{daysActiveThisMonth === 1 ? '' : 's'} active
          </p>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center font-mono text-[10px] text-ink-muted">
              {d}
            </div>
          ))}
          {cells.map((cell, i) => {
            if (!cell.day) return <div key={`empty-${i}`} />;
            const activity = cell.dateStr ? data.activityByDate[cell.dateStr] : undefined;
            const isToday = cell.dateStr === today;
            return (
              <div
                key={cell.dateStr}
                title={activity ? `${activity.questions} question${activity.questions === 1 ? '' : 's'} · +${activity.points} pts` : 'No activity'}
                className={[
                  'flex aspect-square items-center justify-center rounded-lg text-xs font-medium',
                  activity ? 'bg-lime text-ink' : 'bg-cream-soft text-ink-muted',
                  isToday ? 'ring-2 ring-ink' : ''
                ].join(' ')}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBlock({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${highlight ? 'bg-coral-soft' : 'bg-cream-soft'}`}>
      <div className="flex items-center justify-center gap-1.5 text-ink">
        {icon}
        <span className="font-display text-xl font-semibold">{value}</span>
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}
