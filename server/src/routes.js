const express = require('express');
const { nanoid } = require('nanoid');
const db = require('./db');
const engine = require('./adaptiveEngine');
const { getWarmup, findQuestion, getSkills } = require('./questionBank');
const claude = require('./claude');
const stats = require('./stats');

const router = express.Router();

// ---- Skills ----

router.get('/skills', (req, res) => {
  res.json({ skills: getSkills() });
});

// ---- Students ----

router.post('/students', (req, res) => {
  const { name, language } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });

  const id = nanoid(10);
  db.prepare('INSERT INTO students (id, name, language) VALUES (?, ?, ?)').run(
    id,
    name.trim(),
    language || 'en'
  );
  res.json({ id, name: name.trim(), language: language || 'en' });
});

router.get('/students/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'not found' });
  res.json(student);
});

router.patch('/students/:id/language', (req, res) => {
  const { language } = req.body || {};
  if (!language) return res.status(400).json({ error: 'language is required' });
  db.prepare('UPDATE students SET language = ? WHERE id = ?').run(language, req.params.id);
  res.json({ ok: true });
});

// ---- Warm-up placement (no visible test feel) ----

router.get('/warmup/:skill', (req, res) => {
  const questions = getWarmup(req.params.skill).map(({ id, text, choices }) => ({ id, text, choices }));
  res.json({ questions });
});

router.post('/warmup/:skill/finish', (req, res) => {
  const { studentId, answers } = req.body || {};
  if (!studentId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'studentId and answers[] are required' });
  }
  const correctCount = answers.filter(({ id, answer }) => {
    const q = findQuestion(req.params.skill, id);
    return q && answer === q.answer;
  }).length;
  // 0 correct -> start at 1, scaling up to 3 correct -> start at 4
  const startingDifficulty = Math.min(4, Math.max(1, correctCount + 1));
  engine.setStartingDifficulty(studentId, req.params.skill, startingDifficulty);
  res.json({ startingDifficulty, correctCount });
});

// ---- Adaptive question flow ----

router.get('/next-question/:skill', (req, res) => {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ error: 'studentId is required' });

  const { question, progress } = engine.nextQuestion(studentId, req.params.skill);

  if (!question) return res.status(404).json({ error: 'no question available' });
  res.json({
    question: { id: question.id, text: question.text, prompt: question.prompt, choices: question.choices },
    difficulty: progress.difficulty
  });
});

router.post('/answers', (req, res) => {
  const { studentId, skill, questionId, answer } = req.body || {};
  if (!studentId || !skill || !questionId || typeof answer !== 'string') {
    return res.status(400).json({ error: 'studentId, skill, questionId, answer are required' });
  }
  const question = findQuestion(skill, questionId);
  if (!question) return res.status(404).json({ error: 'question not found' });

  const isCorrect = answer.trim() === question.answer;
  const result = engine.recordAnswer(studentId, skill, questionId, isCorrect);

  res.json({
    isCorrect,
    correctAnswer: result.correctAnswer,
    explanation: result.explanationText,
    shouldAskWhy: result.shouldAskWhy,
    attemptId: result.attemptId,
    pointsEarned: result.pointsEarned,
    dayStreak: result.dayStreak,
    progress: result.progress
  });
});

router.post('/explain', async (req, res) => {
  const { attemptId, question, correctAnswer, studentAnswer, explanation, language } = req.body || {};
  if (!attemptId || !explanation) {
    return res.status(400).json({ error: 'attemptId and explanation are required' });
  }
  const verdict = await claude.gradeExplanation({
    question,
    correctAnswer,
    studentAnswer,
    explanation,
    language: language || 'en'
  });
  const updated = engine.recordUnderstanding(attemptId, verdict.verdict);
  res.json({
    verdict: verdict.verdict,
    reason: verdict.reason,
    mastery: updated ? updated.mastery : null,
    bonusPoints: updated ? updated.bonusPoints : 0
  });
});

// ---- Streak & points ----

router.get('/streak/:studentId', (req, res) => {
  res.json(stats.getStreakSummary(req.params.studentId));
});

// ---- Dashboard (parent / teacher view) ----

router.get('/dashboard/:studentId', (req, res) => {
  res.json(engine.getDashboard(req.params.studentId));
});

// ---- Translation (best-effort, used for on-screen strings) ----

router.post('/translate', async (req, res) => {
  const { text, targetLang } = req.body || {};
  if (!text || !targetLang) return res.status(400).json({ error: 'text and targetLang are required' });
  const translated = await claude.translateText(text, targetLang);
  res.json({ translated });
});

router.post('/translate-batch', async (req, res) => {
  const { texts, targetLang } = req.body || {};
  if (!Array.isArray(texts) || !targetLang) {
    return res.status(400).json({ error: 'texts[] and targetLang are required' });
  }
  const translated = await claude.translateBatch(texts, targetLang);
  res.json({ translated });
});

router.get('/status', (req, res) => {
  res.json({ ok: true, liveApi: claude.hasLiveApi() });
});

module.exports = router;
