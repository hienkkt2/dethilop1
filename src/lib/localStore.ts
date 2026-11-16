import { Exam, ExamAttempt, LeaderboardEntry } from '../types/exam';

const KEYS = {
  CUSTOM_EXAMS: 'bangvang_custom_exams_v1',
  ATTEMPTS: 'bangvang_attempts_v1',
  LEADERBOARD: 'bangvang_leaderboard_v1',
  STUDENT_NAME: 'bangvang_student_name_v1',
} as const;

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Lỗi lưu localStorage:', err);
  }
}

export function loadStudentName(): string {
  try {
    return window.localStorage.getItem(KEYS.STUDENT_NAME) || '';
  } catch {
    return '';
  }
}

export function saveStudentName(name: string): void {
  try {
    window.localStorage.setItem(KEYS.STUDENT_NAME, name.trim().slice(0, 80));
  } catch {
    // ignore storage errors
  }
}

export function loadCustomExams(): Exam[] {
  const list = safeReadJson<Exam[]>(KEYS.CUSTOM_EXAMS, []);
  return Array.isArray(list)
    ? list.filter((e) => e.subject === 'toan' || e.subject === 'tieng-viet')
    : [];
}

export function saveCustomExam(exam: Exam): Exam[] {
  const current = loadCustomExams();
  const next = [exam, ...current.filter((e) => e.id !== exam.id)];
  safeWriteJson(KEYS.CUSTOM_EXAMS, next);
  return next;
}

export function deleteCustomExam(examId: string): Exam[] {
  const next = loadCustomExams().filter((e) => e.id !== examId);
  safeWriteJson(KEYS.CUSTOM_EXAMS, next);
  return next;
}

export function loadAttempts(): ExamAttempt[] {
  const list = safeReadJson<ExamAttempt[]>(KEYS.ATTEMPTS, []);
  return Array.isArray(list)
    ? list.filter((a) => a.subject === 'toan' || a.subject === 'tieng-viet')
    : [];
}

export function loadLeaderboard(): LeaderboardEntry[] {
  const list = safeReadJson<LeaderboardEntry[]>(KEYS.LEADERBOARD, []);
  return Array.isArray(list)
    ? list.filter((l) => l.subject === 'toan' || l.subject === 'tieng-viet')
    : [];
}

export function recordExamSubmission(params: {
  exam: Exam;
  studentName: string;
  selectedAnswers: number[];
  score: number;
  correctCount: number;
  durationSecondsUsed: number;
  weekId: string;
}): {
  attempt: ExamAttempt;
  attempts: ExamAttempt[];
  leaderboard: LeaderboardEntry[];
  leaderboardUpdated: boolean;
} {
  const now = Date.now();
  const cleanName = params.studentName.trim().slice(0, 80) || 'Học sinh Lớp 1';
  saveStudentName(cleanName);

  const attemptId = `att_${now}`;
  const attempt: ExamAttempt = {
    id: attemptId,
    userId: cleanName.toLowerCase(),
    studentName: cleanName,
    examId: params.exam.id,
    examTitle: params.exam.title,
    subject: params.exam.subject,
    textbookSeries: params.exam.textbookSeries,
    score: params.score,
    correctCount: params.correctCount,
    totalQuestions: params.exam.questions.length,
    durationSecondsUsed: params.durationSecondsUsed,
    weekId: params.weekId,
    selectedAnswers: params.selectedAnswers,
    submittedAt: now,
  };

  const attempts = [attempt, ...loadAttempts()].slice(0, 100);
  safeWriteJson(KEYS.ATTEMPTS, attempts);

  // Weekly leaderboard entry keyed by weekId + normalized studentName + examId (or random pool)
  const entryKey = `${params.weekId}_${cleanName.toLowerCase()}_${params.exam.id}`;
  const existingLeaderboard = loadLeaderboard();
  const existingIdx = existingLeaderboard.findIndex((e) => e.id === entryKey);
  let leaderboardUpdated = false;

  const newEntry: LeaderboardEntry = {
    id: entryKey,
    attemptId,
    userId: cleanName.toLowerCase(),
    studentName: cleanName,
    examId: params.exam.id,
    examTitle: params.exam.title,
    subject: params.exam.subject,
    score: params.score,
    correctCount: params.correctCount,
    totalQuestions: params.exam.questions.length,
    durationSecondsUsed: params.durationSecondsUsed,
    weekId: params.weekId,
    submittedAt: now,
  };

  let nextLeaderboard = [...existingLeaderboard];
  if (existingIdx === -1) {
    nextLeaderboard.push(newEntry);
    leaderboardUpdated = true;
  } else {
    const prev = existingLeaderboard[existingIdx];
    const isBetter =
      params.score > prev.score ||
      (params.score === prev.score && params.durationSecondsUsed < prev.durationSecondsUsed);
    if (isBetter) {
      nextLeaderboard[existingIdx] = newEntry;
      leaderboardUpdated = true;
    }
  }

  nextLeaderboard.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.durationSecondsUsed - b.durationSecondsUsed;
  });

  safeWriteJson(KEYS.LEADERBOARD, nextLeaderboard);

  return {
    attempt,
    attempts,
    leaderboard: nextLeaderboard,
    leaderboardUpdated,
  };
}
