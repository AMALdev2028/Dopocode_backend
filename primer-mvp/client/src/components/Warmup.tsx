import { useEffect, useRef, useState } from 'react';
import { api, Question } from '../api';

type WarmupProps = {
  studentName: string;
  onDone: (startingDifficulty: number) => void;
  studentId: string;
  skill: string;
  language: string;
};

export function Warmup({ studentName, onDone, studentId, skill, language }: WarmupProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ id: string; answer: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [translatedChoices, setTranslatedChoices] = useState<string[] | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const tokenRef = useRef(0);

  useEffect(() => {
    api.getWarmup(skill).then((res) => {
      setQuestions(res.questions);
      setLoading(false);
    });
  }, [skill]);

  const current = questions[index];

  useEffect(() => {
    if (!current) return;
    const token = ++tokenRef.current;
    setTranslatedText(null);
    setTranslatedChoices(null);
    if (language !== 'en') {
      api.translateBatch([current.text, ...current.choices], language).then((r) => {
        if (token !== tokenRef.current) return;
        const [text, ...choices] = r.translated;
        setTranslatedText(text);
        setTranslatedChoices(choices);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, language]);

  if (loading) return <CenteredMessage text="Getting a quick warm-up ready..." />;
  if (!current) return <CenteredMessage text="All set!" />;

  const handlePick = (originalChoice: string) => {
    setSelected(originalChoice);
    const nextAnswers = [...answers, { id: current.id, answer: originalChoice }];
    setTimeout(() => {
      setAnswers(nextAnswers);
      setSelected(null);
      if (index + 1 < questions.length) {
        setIndex(index + 1);
      } else {
        api.finishWarmup(skill, studentId, nextAnswers).then((res) => onDone(res.startingDifficulty));
      }
    }, 350);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-lg flex-col items-center justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">Warm-up · {index + 1} of {questions.length}</p>
      <h1 className="mt-3 text-center font-display text-2xl font-semibold text-ink">
        Hey {studentName}, let's play a quick game first
      </h1>
      <p className="mt-2 text-center text-ink-muted">No score, no timer — just answer however feels right.</p>

      <div className="mt-10 w-full rounded-[24px] bg-white p-8 shadow-card">
        <p className="font-display text-xl font-semibold text-ink">{translatedText || current.text}</p>
        <div className="mt-6 flex flex-col gap-3">
          {current.choices.map((originalChoice, i) => {
            const label = translatedChoices?.[i] ?? originalChoice;
            return (
              <button
                key={originalChoice}
                type="button"
                onClick={() => handlePick(originalChoice)}
                className={[
                  'rounded-2xl border px-5 py-3.5 text-left font-medium transition-colors',
                  selected === originalChoice ? 'border-ink bg-ink text-lime' : 'border-ink/15 text-ink hover:bg-cream-soft'
                ].join(' ')}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CenteredMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6 text-center text-ink-muted">
      {text}
    </div>
  );
}
