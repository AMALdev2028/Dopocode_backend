const db = require('./db');
const { getQuestionsForDifficulty, findQuestion } = require('./questionBank');
const stats = require('./stats');

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;
const WHY_FOLLOWUP_MIN_DIFFICULTY = 3; // only probe understanding once questions are non-trivial

function getOrCreateProgress(studentId, skill) {
  const existing = db
    .prepare('SELECT * FROM progress WHERE student_id = ? AND skill = ?')
    .get(studentId, skill);
  if (existing) return existing;

  db.prepare(
    `INSERT INTO progress (student_id, skill, difficulty, mastery, streak, questions_seen)
     VALUES (?, ?, 1, 0, 0, 0)`
  ).run(studentId, skill);
  return db.prepare('SELECT * FROM progress WHERE student_id = ? AND skill = ?').get(studentId, skill);
}

function setStartingDifficulty(studentId, skill, difficulty) {
  const clamped = Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, difficulty));
  getOrCreateProgress(studentId, skill);
  db.prepare(
    `UPDATE progress SET difficulty = ?, updated_at = datetime('now')
     WHERE student_id = ? AND skill = ?`
  ).run(clamped, studentId, skill);
}

function recentQuestionIds(studentId, skill, limit = 3) {
  const rows = db
    .prepare(
      `SELECT question_id FROM attempts
       WHERE student_id = ? AND skill = ?
       ORDER BY id DESC LIMIT ?`
    )
    .all(studentId, skill, limit);
  return rows.map((r) => r.question_id);
}

function nextQuestion(studentId, skill) {
  const progress = getOrCreateProgress(studentId, skill);
  const pool = getQuestionsForDifficulty(skill, progress.difficulty);
  const avoid = new Set(recentQuestionIds(studentId, skill));
  const fresh = pool.filter((q) => !avoid.has(q.id));
  const chosenFrom = fresh.length ? fresh : pool;
  const question = chosenFrom[Math.floor(Math.random() * chosenFrom.length)];
  return { question, progress };
}

function recordAnswer(studentId, skill, questionId, isCorrect) {
  const progress = getOrCreateProgress(studentId, skill);
  const question = findQuestion(skill, questionId);

  let { difficulty, mastery, streak, questions_seen: questionsSeen } = progress;

  streak = isCorrect ? streak + 1 : 0;
  difficulty = isCorrect
    ? Math.min(MAX_DIFFICULTY, difficulty + 1)
    : Math.max(MIN_DIFFICULTY, difficulty - 1);
  // exponential moving average - recent performance weighted more heavily
  mastery = mastery * 0.75 + (isCorrect ? 1 : 0) * 0.25;
  questionsSeen += 1;

  db.prepare(
    `UPDATE progress
     SET difficulty = ?, mastery = ?, streak = ?, questions_seen = ?, updated_at = datetime('now')
     WHERE student_id = ? AND skill = ?`
  ).run(difficulty, mastery, streak, questionsSeen, studentId, skill);

  const attemptResult = db
    .prepare(
      `INSERT INTO attempts (student_id, skill, question_id, difficulty, is_correct)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(studentId, skill, questionId, progress.difficulty, isCorrect ? 1 : 0);

  const shouldAskWhy = isCorrect && progress.difficulty >= WHY_FOLLOWUP_MIN_DIFFICULTY;

  const pointsEarned = stats.pointsForAnswer(isCorrect);
  const { dayStreak } = stats.awardPoints(studentId, pointsEarned, 1);

  return {
    attemptId: attemptResult.lastInsertRowid,
    isCorrect,
    explanationText: question ? question.explanation : null,
    correctAnswer: question ? question.answer : null,
    shouldAskWhy,
    pointsEarned,
    dayStreak,
    progress: { difficulty, mastery, streak, questionsSeen }
  };
}

function recordUnderstanding(attemptId, verdict) {
  db.prepare('UPDATE attempts SET understanding = ? WHERE id = ?').run(verdict, attemptId);

  const attempt = db.prepare('SELECT * FROM attempts WHERE id = ?').get(attemptId);
  if (!attempt) return null;

  const progress = getOrCreateProgress(attempt.student_id, attempt.skill);
  // Rote-correct answers get a small mastery haircut - they got it right without
  // showing real understanding, so we don't want the mastery score to over-trust it.
  let masteryAdjust = 0;
  if (verdict === 'understood') masteryAdjust = 0.05;
  if (verdict === 'rote') masteryAdjust = -0.1;

  const mastery = Math.max(0, Math.min(1, progress.mastery + masteryAdjust));
  db.prepare(
    `UPDATE progress SET mastery = ?, updated_at = datetime('now')
     WHERE student_id = ? AND skill = ?`
  ).run(mastery, attempt.student_id, attempt.skill);

  const bonusPoints = stats.pointsForUnderstanding(verdict);
  stats.awardPoints(attempt.student_id, bonusPoints, 0);

  return { mastery, bonusPoints };
}

function getDashboard(studentId) {
  const progressRows = db.prepare('SELECT * FROM progress WHERE student_id = ?').all(studentId);
  const recentAttempts = db
    .prepare(
      `SELECT * FROM attempts WHERE student_id = ? ORDER BY id DESC LIMIT 20`
    )
    .all(studentId);

  const summaries = progressRows.map((p) => {
    const skillAttempts = recentAttempts.filter((a) => a.skill === p.skill);
    const roteCount = skillAttempts.filter((a) => a.understanding === 'rote').length;
    return {
      skill: p.skill,
      difficulty: p.difficulty,
      mastery: Math.round(p.mastery * 100),
      streak: p.streak,
      questionsSeen: p.questions_seen,
      recentRoteAnswers: roteCount,
      strength: p.mastery >= 0.7,
      needsHelp: p.mastery < 0.4 || roteCount >= 2
    };
  });

  return { skills: summaries, recentAttempts };
}

module.exports = {
  MIN_DIFFICULTY,
  MAX_DIFFICULTY,
  getOrCreateProgress,
  setStartingDifficulty,
  nextQuestion,
  recordAnswer,
  recordUnderstanding,
  getDashboard
};
