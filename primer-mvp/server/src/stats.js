const db = require('./db');

// Point values - deliberately simple and transparent, not hidden ML scoring.
const POINTS = {
  CORRECT_ANSWER: 10,
  WRONG_ANSWER: 3, // participation credit - trying never earns zero
  UNDERSTOOD_BONUS: 5,
  PARTIAL_BONUS: 2,
  ROTE_PENALTY: -2
};

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, server-local UTC date
}

function yesterdayStr() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getOrCreateStats(studentId) {
  const existing = db.prepare('SELECT * FROM student_stats WHERE student_id = ?').get(studentId);
  if (existing) return existing;
  db.prepare(
    `INSERT INTO student_stats (student_id, total_points, day_streak, longest_day_streak, last_active_date)
     VALUES (?, 0, 0, 0, NULL)`
  ).run(studentId);
  return db.prepare('SELECT * FROM student_stats WHERE student_id = ?').get(studentId);
}

function awardPoints(studentId, points, questionsDelta = 0) {
  const today = todayStr();
  const stats = getOrCreateStats(studentId);

  // Update (or create) today's daily_activity row.
  const existingDay = db
    .prepare('SELECT * FROM daily_activity WHERE student_id = ? AND activity_date = ?')
    .get(studentId, today);
  if (existingDay) {
    db.prepare(
      `UPDATE daily_activity SET questions_answered = questions_answered + ?, points_earned = points_earned + ?
       WHERE student_id = ? AND activity_date = ?`
    ).run(questionsDelta, points, studentId, today);
  } else {
    db.prepare(
      `INSERT INTO daily_activity (student_id, activity_date, questions_answered, points_earned)
       VALUES (?, ?, ?, ?)`
    ).run(studentId, today, questionsDelta, points);
  }

  // Update the day-streak: consecutive calendar days with any activity.
  let { day_streak: dayStreak, longest_day_streak: longestDayStreak, last_active_date: lastActiveDate } = stats;
  if (lastActiveDate === today) {
    // already counted today, streak unchanged
  } else if (lastActiveDate === yesterdayStr()) {
    dayStreak += 1;
  } else {
    dayStreak = 1; // gap of more than a day, or first ever session
  }
  longestDayStreak = Math.max(longestDayStreak, dayStreak);

  db.prepare(
    `UPDATE student_stats
     SET total_points = total_points + ?, day_streak = ?, longest_day_streak = ?, last_active_date = ?
     WHERE student_id = ?`
  ).run(points, dayStreak, longestDayStreak, today, studentId);

  return { dayStreak, longestDayStreak };
}

function pointsForAnswer(isCorrect) {
  return isCorrect ? POINTS.CORRECT_ANSWER : POINTS.WRONG_ANSWER;
}

function pointsForUnderstanding(verdict) {
  if (verdict === 'understood') return POINTS.UNDERSTOOD_BONUS;
  if (verdict === 'partial') return POINTS.PARTIAL_BONUS;
  if (verdict === 'rote') return POINTS.ROTE_PENALTY;
  return 0;
}

function getStreakSummary(studentId, days = 35) {
  const stats = getOrCreateStats(studentId);
  const rows = db
    .prepare(
      `SELECT activity_date, questions_answered, points_earned FROM daily_activity
       WHERE student_id = ? ORDER BY activity_date DESC LIMIT ?`
    )
    .all(studentId, days);

  const activityByDate = {};
  rows.forEach((r) => {
    activityByDate[r.activity_date] = { questions: r.questions_answered, points: r.points_earned };
  });

  return {
    totalPoints: stats.total_points,
    dayStreak: stats.day_streak,
    longestDayStreak: stats.longest_day_streak,
    lastActiveDate: stats.last_active_date,
    activityByDate
  };
}

module.exports = { awardPoints, pointsForAnswer, pointsForUnderstanding, getStreakSummary, POINTS };
