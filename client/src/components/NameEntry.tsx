import { useEffect, useState } from 'react';
import { SparklesIcon } from 'lucide-react';
import { api, Skill } from '../api';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' }
];

const STATIC_STRINGS = {
  title: 'What should we call you?',
  subtitle: "No signup, no email — just your first name so your tutor remembers you next time.",
  namePlaceholder: 'Your name',
  practiceLabel: 'What should we practice today?',
  begin: "Let's begin"
};

type NameEntryProps = {
  onStart: (name: string, language: string, skill: string) => void;
};

export function NameEntry({ onStart }: NameEntryProps) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skill, setSkill] = useState('');
  const [t, setT] = useState(STATIC_STRINGS);
  const [translatedSkills, setTranslatedSkills] = useState<Skill[] | null>(null);

  useEffect(() => {
    api.getSkills().then((res) => {
      setSkills(res.skills);
      if (res.skills[0]) setSkill(res.skills[0].id);
    });
  }, []);

  useEffect(() => {
    if (language === 'en' || skills.length === 0) {
      setT(STATIC_STRINGS);
      setTranslatedSkills(null);
      return;
    }
    const staticValues = Object.values(STATIC_STRINGS);
    const skillTexts = skills.flatMap((s) => [s.label, s.description]);
    api.translateBatch([...staticValues, ...skillTexts], language).then((res) => {
      const keys = Object.keys(STATIC_STRINGS) as (keyof typeof STATIC_STRINGS)[];
      const translatedStatic = { ...STATIC_STRINGS };
      keys.forEach((key, i) => {
        translatedStatic[key] = res.translated[i];
      });
      setT(translatedStatic);

      const rest = res.translated.slice(keys.length);
      setTranslatedSkills(
        skills.map((s, i) => ({ ...s, label: rest[i * 2], description: rest[i * 2 + 1] }))
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, skills]);

  const displaySkills = translatedSkills || skills;
  const canStart = Boolean(name.trim() && skill);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime text-ink">
        <SparklesIcon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{t.title}</h1>
      <p className="mt-3 text-ink-muted">{t.subtitle}</p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.namePlaceholder}
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

      {displaySkills.length > 0 ? (
        <div className="mt-8 w-full text-left">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">{t.practiceLabel}</p>
          <div className="mt-3 flex flex-col gap-2">
            {displaySkills.map((s, i) => (
              <button
                key={skills[i]?.id || s.id}
                type="button"
                onClick={() => setSkill(skills[i]?.id || s.id)}
                className={[
                  'rounded-2xl border px-4 py-3 text-left transition-colors',
                  skill === (skills[i]?.id || s.id) ? 'border-ink bg-ink text-lime' : 'border-ink/15 text-ink hover:bg-cream-soft'
                ].join(' ')}
              >
                <p className="font-semibold">{s.label}</p>
                <p className={`mt-0.5 text-xs ${skill === (skills[i]?.id || s.id) ? 'text-lime/80' : 'text-ink-muted'}`}>{s.description}</p>
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
        {t.begin}
      </button>
    </div>
  );
}
