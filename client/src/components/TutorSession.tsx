import { useEffect, useRef, useState } from 'react';
import { CheckIcon, LightbulbIcon, MessageCircleQuestionIcon, Volume2Icon, MicIcon, Loader2Icon } from 'lucide-react';
import { api, Question, AnswerResult } from '../api';
import { speak, startListening, isSpeechSynthesisSupported, isSpeechRecognitionSupported, langToSpeechCode } from '../speech';

const DISTRESS_KEYWORDS = ['hurt', 'scared', 'sad', 'hate myself', 'want to die', 'nobody cares', 'give up'];

type TutorSessionProps = {
  studentId: string;
  studentName: string;
  language: string;
  skill: string;
  onProgressUpdate: (streak: number, mastery: number) => void;
};

type Phase = 'loading' | 'question' | 'feedback' | 'explain-prompt' | 'explain-feedback';

type Translated = { text: string; prompt: string; choices: string[] };

export function TutorSession({ studentId, studentName, language, skill, onProgressUpdate }: TutorSessionProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [translated, setTranslated] = useState<Translated | null>(null);
  const [translatedExplanation, setTranslatedExplanation] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [phase, setPhase] = useState<Phase>('loading');
  const [selected, setSelected] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [explanationText, setExplanationText] = useState('');
  const [explainVerdict, setExplainVerdict] = useState<{ verdict: string; reason: string } | null>(null);
  const [distressFlag, setDistressFlag] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof startListening>>(null);
  const loadTokenRef = useRef(0);
  const speechLang = langToSpeechCode[language] || 'en-US';

  const loadNext = () => {
    const token = ++loadTokenRef.current;
    setPhase('loading');
    setSelected(null);
    setAnswerResult(null);
    setExplanationText('');
    setExplainVerdict(null);
    setDistressFlag(false);
    setTranslated(null);
    setTranslatedExplanation(null);
    api.nextQuestion(skill, studentId).then((res) => {
      if (token !== loadTokenRef.current) return; // a newer question was requested meanwhile
      setQuestion(res.question);
      setDifficulty(res.difficulty);
      setPhase('question');

      if (language !== 'en') {
        const toTranslate = [res.question.text, res.question.prompt || '', ...res.question.choices];
        api.translateBatch(toTranslate, language).then((r) => {
          if (token !== loadTokenRef.current) return;
          const [text, prompt, ...choices] = r.translated;
          setTranslated({ text, prompt, choices });
        });
      }
    });
  };

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const displayText = translated?.text || question?.text || '';
  const displayPrompt = translated?.prompt || question?.prompt || '';
  const displayChoices = translated?.choices || question?.choices || [];

  const handleAnswer = async (originalChoice: string) => {
    if (!question) return;
    setSelected(originalChoice);
    const result = await api.submitAnswer(studentId, skill, question.id, originalChoice);
    setAnswerResult(result);
    onProgressUpdate(result.progress.streak, result.progress.mastery);
    setPhase(result.shouldAskWhy ? 'explain-prompt' : 'feedback');

    if (language !== 'en' && result.explanation) {
      api.translateBatch([result.explanation], language).then((r) => setTranslatedExplanation(r.translated[0]));
    }
  };

  const handleExplainSubmit = async () => {
    if (!question || !answerResult) return;

    const looksLikeDistress = DISTRESS_KEYWORDS.some((word) => explanationText.toLowerCase().includes(word));
    if (looksLikeDistress) {
      setDistressFlag(true);
      setPhase('explain-feedback');
      return;
    }

    const verdict = await api.submitExplanation(
      answerResult.attemptId,
      question.text,
      answerResult.correctAnswer,
      selected || '',
      explanationText,
      language
    );
    setExplainVerdict(verdict);
    if (verdict.mastery !== null) onProgressUpdate(answerResult.progress.streak, verdict.mastery);
    setPhase('explain-feedback');
  };

  const handleReadAloud = () => {
    speak(`${displayText}. ${displayPrompt}`, speechLang);
  };

  const handleMicToggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = startListening(
      (transcript) => setExplanationText((prev) => (prev ? `${prev} ${transcript}` : transcript)),
      () => setListening(false),
      speechLang
    );
    if (recognition) {
      recognitionRef.current = recognition;
      setListening(true);
    }
  };

  if (phase === 'loading' || !question) {
    return <CenteredMessage text="Picking the right next question..." />;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <p className="text-center font-mono text-xs uppercase tracking-wide text-ink-muted">
        Level {difficulty} of 5
      </p>

      <div className="mt-6 rounded-[24px] bg-white p-8 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-xl font-semibold text-ink">{displayText}</p>
          {isSpeechSynthesisSupported() ? (
            <button
              type="button"
              onClick={handleReadAloud}
              aria-label="Read question aloud"
              className="shrink-0 rounded-full border border-ink/15 p-2 text-ink transition-colors hover:bg-cream-soft"
            >
              <Volume2Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {displayPrompt ? <p className="mt-2 text-sm text-ink-muted">{displayPrompt}</p> : null}

        <div className="mt-6 flex flex-col gap-3">
          {question.choices.map((originalChoice, i) => {
            const label = displayChoices[i] ?? originalChoice;
            const isSelected = selected === originalChoice;
            const showResult = phase !== 'question';
            const isCorrectChoice = showResult && answerResult && originalChoice === answerResult.correctAnswer;
            return (
              <button
                key={originalChoice}
                type="button"
                disabled={phase !== 'question'}
                onClick={() => handleAnswer(originalChoice)}
                className={[
                  'rounded-2xl border px-5 py-3.5 text-left font-medium transition-colors',
                  isCorrectChoice
                    ? 'border-lime-dark bg-lime/40 text-ink'
                    : isSelected
                    ? 'border-ink bg-ink text-lime'
                    : 'border-ink/15 text-ink hover:bg-cream-soft disabled:hover:bg-transparent'
                ].join(' ')}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {phase === 'feedback' && answerResult ? (
        <FeedbackCard result={answerResult} translatedExplanation={translatedExplanation} onNext={loadNext} />
      ) : null}

      {phase === 'explain-prompt' ? (
        <div className="mt-6 rounded-[24px] bg-teal p-6">
          <div className="flex items-center gap-2 text-ink">
            <MessageCircleQuestionIcon className="h-5 w-5" aria-hidden="true" />
            <p className="font-semibold">Nice! Now tell me why.</p>
          </div>
          <p className="mt-1 text-sm text-ink/70">
            Type it, or tap the mic and just say it out loud — there's no wrong way to explain it.
          </p>
          <div className="relative mt-3">
            <textarea
              value={explanationText}
              onChange={(e) => setExplanationText(e.target.value)}
              rows={3}
              placeholder={`I got ${answerResult?.correctAnswer} because...`}
              className="w-full rounded-xl border border-ink/15 bg-white p-3 pr-12 text-ink focus:border-ink/40 focus:outline-none"
            />
            {isSpeechRecognitionSupported() ? (
              <button
                type="button"
                onClick={handleMicToggle}
                aria-label={listening ? 'Stop recording' : 'Speak your answer'}
                aria-pressed={listening}
                className={[
                  'absolute right-2.5 top-2.5 rounded-full p-2 transition-colors',
                  listening ? 'bg-coral text-ink' : 'border border-ink/15 text-ink hover:bg-cream-soft'
                ].join(' ')}
              >
                {listening ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MicIcon className="h-4 w-4" aria-hidden="true" />}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            disabled={!explanationText.trim()}
            onClick={handleExplainSubmit}
            className="mt-3 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-lime disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tell the tutor
          </button>
        </div>
      ) : null}

      {phase === 'explain-feedback' ? (
        <div className="mt-6">
          {distressFlag ? (
            <DistressCard studentName={studentName} onNext={loadNext} />
          ) : explainVerdict ? (
            <ExplainFeedbackCard verdict={explainVerdict} onNext={loadNext} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FeedbackCard({
  result,
  translatedExplanation,
  onNext
}: {
  result: AnswerResult;
  translatedExplanation: string | null;
  onNext: () => void;
}) {
  return (
    <div className={`mt-6 rounded-[24px] p-6 ${result.isCorrect ? 'bg-lime/30' : 'bg-coral-soft'}`}>
      <p className="flex items-center gap-2 font-semibold text-ink">
        {result.isCorrect ? (
          <>
            <CheckIcon className="h-5 w-5" aria-hidden="true" /> Correct!
          </>
        ) : (
          <>
            <LightbulbIcon className="h-5 w-5" aria-hidden="true" /> Close! Let's look at that together.
          </>
        )}
      </p>
      {result.explanation ? (
        <p className="mt-2 text-sm leading-relaxed text-ink/80">{translatedExplanation || result.explanation}</p>
      ) : null}
      <button
        type="button"
        onClick={onNext}
        className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-lime"
      >
        Next question
      </button>
    </div>
  );
}

function ExplainFeedbackCard({ verdict, onNext }: { verdict: { verdict: string; reason: string }; onNext: () => void }) {
  const copy: Record<string, { title: string; bg: string }> = {
    understood: { title: 'Great thinking! That shows real understanding.', bg: 'bg-lime/30' },
    partial: { title: "You're on the right track — a little more detail next time.", bg: 'bg-teal' },
    rote: { title: "Good try! Let's dig a bit deeper into why, next time.", bg: 'bg-coral-soft' }
  };
  const { title, bg } = copy[verdict.verdict] || copy.partial;

  return (
    <div className={`rounded-[24px] p-6 ${bg}`}>
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink/70">{verdict.reason}</p>
      <button
        type="button"
        onClick={onNext}
        className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-lime"
      >
        Next question
      </button>
    </div>
  );
}

function DistressCard({ studentName, onNext }: { studentName: string; onNext: () => void }) {
  return (
    <div className="rounded-[24px] bg-coral-soft p-6">
      <p className="font-semibold text-ink">It's brave to share that, {studentName}.</p>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        Please talk to a teacher or a grown-up you trust about this — they can help in ways I can't.
        We can keep learning together whenever you're ready.
      </p>
      <button
        type="button"
        onClick={onNext}
        className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-lime"
      >
        Continue when ready
      </button>
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
