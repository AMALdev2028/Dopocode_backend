const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export type Student = { id: string; name: string; language: string };

export type Skill = { id: string; label: string; description: string };

export type Question = { id: string; text: string; prompt?: string; choices: string[] };

export type AnswerResult = {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string | null;
  shouldAskWhy: boolean;
  attemptId: number;
  progress: { difficulty: number; mastery: number; streak: number; questionsSeen: number };
};

export type ExplainResult = { verdict: 'understood' | 'partial' | 'rote'; reason: string; mastery: number | null };

export type DashboardSkill = {
  skill: string;
  difficulty: number;
  mastery: number;
  streak: number;
  questionsSeen: number;
  recentRoteAnswers: number;
  strength: boolean;
  needsHelp: boolean;
};

export type Dashboard = { skills: DashboardSkill[]; recentAttempts: unknown[] };

export type StreakSummary = {
  totalPoints: number;
  dayStreak: number;
  longestDayStreak: number;
  lastActiveDate: string | null;
  activityByDate: Record<string, { questions: number; points: number }>;
};

export const api = {
  getSkills: () => request<{ skills: Skill[] }>('/skills'),

  createStudent: (name: string, language: string) =>
    request<Student>('/students', { method: 'POST', body: JSON.stringify({ name, language }) }),

  setLanguage: (studentId: string, language: string) =>
    request<{ ok: boolean }>(`/students/${studentId}/language`, {
      method: 'PATCH',
      body: JSON.stringify({ language })
    }),

  getWarmup: (skill: string) =>
    request<{ questions: Question[] }>(`/warmup/${skill}`),

  finishWarmup: (skill: string, studentId: string, answers: { id: string; answer: string }[]) =>
    request<{ startingDifficulty: number; correctCount: number }>(`/warmup/${skill}/finish`, {
      method: 'POST',
      body: JSON.stringify({ studentId, answers })
    }),

  nextQuestion: (skill: string, studentId: string) =>
    request<{ question: Question; difficulty: number }>(`/next-question/${skill}?studentId=${studentId}`),

  submitAnswer: (studentId: string, skill: string, questionId: string, answer: string) =>
    request<AnswerResult>('/answers', {
      method: 'POST',
      body: JSON.stringify({ studentId, skill, questionId, answer })
    }),

  submitExplanation: (
    attemptId: number,
    question: string,
    correctAnswer: string,
    studentAnswer: string,
    explanation: string,
    language: string
  ) =>
    request<ExplainResult>('/explain', {
      method: 'POST',
      body: JSON.stringify({ attemptId, question, correctAnswer, studentAnswer, explanation, language })
    }),

  getDashboard: (studentId: string) => request<Dashboard>(`/dashboard/${studentId}`),

  getStreak: (studentId: string) => request<StreakSummary>(`/streak/${studentId}`),

  translate: (text: string, targetLang: string) =>
    request<{ translated: string }>('/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLang })
    }),

  translateBatch: (texts: string[], targetLang: string) =>
    request<{ translated: string[] }>('/translate-batch', {
      method: 'POST',
      body: JSON.stringify({ texts, targetLang })
    }),

  status: () => request<{ ok: boolean; liveApi: boolean }>('/status')
};
