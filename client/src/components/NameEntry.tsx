import { useEffect, useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import { api, Skill } from '../api';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' }
];

type NameEntryProps = {
  onStart: (name: string, language: string, skill: string) => void;
};

export function NameEntry({ onStart }: NameEntryProps) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skill, setSkill] = useState('');

  useEffect(() => {
    api.getSkills().then((res) => {
      setSkills(res.skills);
      if (res.skills[0]) setSkill(res.skills[0].id);
    });
  }, []);

  const canStart = Boolean(name.trim() && skill);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime text-ink">
        <SparklesIcon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">What should we call you?</h1>
      <p className="mt-3 text-ink-muted">No signup, no email — just your first name so your tutor remembers you next time.</p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="mt-8 w-full rounded-2xl border border-ink/15 bg-white px-5 py-3.5 text-center font-display text-xl text-ink placeholder:text-ink-muted/50 focus:border-ink/40 focus:outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && canStart) onStart(name.trim(), language, skill);
        }}
      />

      <div className="mt-5 flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              language === lang.code ? 'bg-ink text-lime' : 'border border-ink/15 text-ink hover:bg-cream-soft'
            ].join(' ')}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {skills.length > 0 ? (
        <div className="mt-8 w-full text-left">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">What should we practice today?</p>
          <div className="mt-3 flex flex-col gap-2">
            {skills.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSkill(s.id)}
                className={[
                  'rounded-2xl border px-4 py-3 text-left transition-colors',
                  skill === s.id ? 'border-ink bg-ink text-lime' : 'border-ink/15 text-ink hover:bg-cream-soft'
                ].join(' ')}
              >
                <p className="font-semibold">{s.label}</p>
                <p className={`mt-0.5 text-xs ${skill === s.id ? 'text-lime/80' : 'text-ink-muted'}`}>{s.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!canStart}
        onClick={() => onStart(name.trim(), language, skill)}
        className="mt-8 w-full rounded-full bg-ink px-7 py-3.5 text-base font-semibold text-lime transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Let's begin
      </button>
    </div>
  );
}
