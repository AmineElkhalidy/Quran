import * as SQLite from 'expo-sqlite';
import type { UserProgress, ChallengeResult, Recording } from '../types';

// ─── expo-sqlite v14 (SDK 56) API ────────────────────────────────────────────
// Uses openDatabaseSync + withTransactionSync pattern

let db: SQLite.SQLiteDatabase | null = null;

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('warsh_quran.db');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = getDB();

  database.withTransactionSync(() => {
    // User progress
    database.runSync(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        surah_id INTEGER NOT NULL,
        thumn_number INTEGER NOT NULL,
        completed INTEGER DEFAULT 0,
        read_count INTEGER DEFAULT 0,
        last_read_at TEXT,
        xp_earned INTEGER DEFAULT 0,
        UNIQUE(surah_id, thumn_number)
      )
    `);

    // Challenge results
    database.runSync(`
      CREATE TABLE IF NOT EXISTS challenge_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER NOT NULL,
        challenge_type TEXT NOT NULL,
        surah_id INTEGER,
        score INTEGER DEFAULT 0,
        accuracy REAL DEFAULT 0,
        time_taken_seconds INTEGER DEFAULT 0,
        completed_at TEXT NOT NULL,
        xp_earned INTEGER DEFAULT 0
      )
    `);

    // Recordings
    database.runSync(`
      CREATE TABLE IF NOT EXISTS recordings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ayah_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        duration_ms INTEGER DEFAULT 0,
        feedback_score REAL,
        recorded_at TEXT NOT NULL
      )
    `);

    // User stats
    database.runSync(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        total_xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_active_date TEXT,
        total_days_active INTEGER DEFAULT 0
      )
    `);

    // Initialize stats row if not exists
    database.runSync(`
      INSERT OR IGNORE INTO user_stats (id, total_xp, level) VALUES (1, 0, 1)
    `);

    // Badges
    database.runSync(`
      CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        badge_key TEXT UNIQUE NOT NULL,
        unlocked INTEGER DEFAULT 0,
        unlocked_at TEXT
      )
    `);
  });
}

// ─── Progress ────────────────────────────────────────────────────────────────

export function getProgress(surahId: number, thumnNumber: number): UserProgress | null {
  const db = getDB();
  const row = db.getFirstSync<{
    id: number; surah_id: number; thumn_number: number;
    completed: number; read_count: number; last_read_at: string; xp_earned: number;
  }>(
    'SELECT * FROM user_progress WHERE surah_id = ? AND thumn_number = ?',
    [surahId, thumnNumber]
  );
  if (!row) return null;
  return {
    id: row.id,
    surahId: row.surah_id,
    thumnNumber: row.thumn_number,
    completed: row.completed === 1,
    readCount: row.read_count,
    lastReadAt: row.last_read_at,
    xpEarned: row.xp_earned,
  };
}

export function getAllProgressForSurah(surahId: number): UserProgress[] {
  const db = getDB();
  const rows = db.getAllSync<{
    id: number; surah_id: number; thumn_number: number;
    completed: number; read_count: number; last_read_at: string; xp_earned: number;
  }>('SELECT * FROM user_progress WHERE surah_id = ?', [surahId]);
  return rows.map(row => ({
    id: row.id,
    surahId: row.surah_id,
    thumnNumber: row.thumn_number,
    completed: row.completed === 1,
    readCount: row.read_count,
    lastReadAt: row.last_read_at,
    xpEarned: row.xp_earned,
  }));
}

export function markThumnRead(surahId: number, thumnNumber: number, xp: number = 50): void {
  const db = getDB();
  db.runSync(
    `INSERT INTO user_progress (surah_id, thumn_number, completed, read_count, last_read_at, xp_earned)
     VALUES (?, ?, 1, 1, ?, ?)
     ON CONFLICT(surah_id, thumn_number) DO UPDATE SET
       completed = 1,
       read_count = read_count + 1,
       last_read_at = excluded.last_read_at,
       xp_earned = xp_earned + ?`,
    [surahId, thumnNumber, new Date().toISOString(), xp, xp]
  );
  addXP(xp);
}

// ─── XP & Stats ──────────────────────────────────────────────────────────────

export function addXP(amount: number): void {
  const db = getDB();
  db.runSync('UPDATE user_stats SET total_xp = total_xp + ? WHERE id = 1', [amount]);
}

// Level computation: each level requires more XP
// Level 1: 0 XP, Level 2: 500 XP, Level 3: 1200 XP, Level 4: 2100 XP...
// Formula: cumulative XP for level N = sum of (i * 300 + 200) for i = 1..N-1
function computeLevelFromXP(totalXP: number): { level: number; xpToNextLevel: number; xpInCurrentLevel: number } {
  let level = 1;
  let cumulativeXP = 0;

  while (true) {
    const xpForNextLevel = level * 300 + 200;
    if (cumulativeXP + xpForNextLevel > totalXP) {
      return {
        level,
        xpToNextLevel: xpForNextLevel,
        xpInCurrentLevel: totalXP - cumulativeXP,
      };
    }
    cumulativeXP += xpForNextLevel;
    level++;
  }
}

export function getUserStats() {
  const db = getDB();
  const row = db.getFirstSync<{
    total_xp: number; level: number; current_streak: number;
    longest_streak: number; last_active_date: string; total_days_active: number;
  }>('SELECT * FROM user_stats WHERE id = 1');

  if (!row) return null;

  // Compute level from total XP
  const levelInfo = computeLevelFromXP(row.total_xp);

  // Update level in DB if changed
  if (levelInfo.level !== row.level) {
    db.runSync('UPDATE user_stats SET level = ? WHERE id = 1', [levelInfo.level]);
  }

  return {
    total_xp: row.total_xp,
    level: levelInfo.level,
    xp_to_next_level: levelInfo.xpToNextLevel,
    xp_in_current_level: levelInfo.xpInCurrentLevel,
    current_streak: row.current_streak,
    longest_streak: row.longest_streak,
    last_active_date: row.last_active_date,
    total_days_active: row.total_days_active,
  };
}

export function updateStreak(): void {
  const db = getDB();
  const stats = db.getFirstSync<{
    current_streak: number; longest_streak: number;
    last_active_date: string; total_days_active: number;
  }>('SELECT current_streak, longest_streak, last_active_date, total_days_active FROM user_stats WHERE id = 1');
  if (!stats) return;

  const today = new Date().toDateString();
  const lastActive = stats.last_active_date
    ? new Date(stats.last_active_date).toDateString()
    : null;

  if (lastActive === today) return; // Already counted today

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newStreak = lastActive === yesterday ? stats.current_streak + 1 : 1;

  db.runSync(
    `UPDATE user_stats SET
      current_streak = ?,
      longest_streak = MAX(longest_streak, ?),
      last_active_date = ?,
      total_days_active = total_days_active + 1
    WHERE id = 1`,
    [newStreak, newStreak, new Date().toISOString()]
  );
}

// ─── Last Read Progress ──────────────────────────────────────────────────────

export function getLastReadProgress(): { surahId: number; thumnNumber: number; lastReadAt: string } | null {
  const db = getDB();
  const row = db.getFirstSync<{
    surah_id: number; thumn_number: number; last_read_at: string;
  }>('SELECT surah_id, thumn_number, last_read_at FROM user_progress WHERE last_read_at IS NOT NULL ORDER BY last_read_at DESC LIMIT 1');

  if (!row) return null;
  return {
    surahId: row.surah_id,
    thumnNumber: row.thumn_number,
    lastReadAt: row.last_read_at,
  };
}

export function getTotalThumnCompleted(): number {
  const db = getDB();
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_progress WHERE completed = 1'
  );
  return row?.count ?? 0;
}

// ─── Challenge Results ────────────────────────────────────────────────────────

export function saveChallengeResult(result: Omit<ChallengeResult, 'id'>): void {
  const db = getDB();
  db.runSync(
    `INSERT INTO challenge_results
      (challenge_id, challenge_type, surah_id, score, accuracy, time_taken_seconds, completed_at, xp_earned)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      result.challengeId,
      'challenge',
      0,
      result.score,
      result.accuracy,
      result.timeTakenSeconds,
      result.completedAt,
      result.xpEarned,
    ]
  );
  addXP(result.xpEarned);
}

export function getTotalChallengesCompleted(): number {
  const db = getDB();
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM challenge_results'
  );
  return row?.count ?? 0;
}

// ─── Recordings ───────────────────────────────────────────────────────────────

export function saveRecording(recording: Omit<Recording, 'id'>): void {
  const db = getDB();
  db.runSync(
    `INSERT INTO recordings (ayah_id, file_path, duration_ms, feedback_score, recorded_at)
     VALUES (?, ?, ?, ?, ?)`,
    [recording.ayahId, recording.filePath, recording.durationMs, recording.feedbackScore ?? null, recording.recordedAt]
  );
}

export function getRecordingsForAyah(ayahId: number): Recording[] {
  const db = getDB();
  const rows = db.getAllSync<{
    id: number; ayah_id: number; file_path: string;
    duration_ms: number; feedback_score: number; recorded_at: string;
  }>('SELECT * FROM recordings WHERE ayah_id = ? ORDER BY recorded_at DESC', [ayahId]);
  return rows.map(r => ({
    id: r.id,
    ayahId: r.ayah_id,
    filePath: r.file_path,
    durationMs: r.duration_ms,
    feedbackScore: r.feedback_score,
    recordedAt: r.recorded_at,
  }));
}

// ─── Badge Tracking ───────────────────────────────────────────────────────────

export function unlockBadge(badgeKey: string): boolean {
  const db = getDB();
  const existing = db.getFirstSync<{ unlocked: number }>(
    'SELECT unlocked FROM badges WHERE badge_key = ?',
    [badgeKey]
  );
  if (existing?.unlocked === 1) return false; // Already unlocked

  db.runSync(
    `INSERT INTO badges (badge_key, unlocked, unlocked_at)
     VALUES (?, 1, ?)
     ON CONFLICT(badge_key) DO UPDATE SET unlocked = 1, unlocked_at = ?`,
    [badgeKey, new Date().toISOString(), new Date().toISOString()]
  );
  return true;
}

export function getUnlockedBadgeKeys(): string[] {
  const db = getDB();
  const rows = db.getAllSync<{ badge_key: string }>(
    'SELECT badge_key FROM badges WHERE unlocked = 1'
  );
  return rows.map(r => r.badge_key);
}
