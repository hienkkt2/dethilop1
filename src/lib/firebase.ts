import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Exam, ExamAttempt, LeaderboardEntry, Question, SubjectId, TextbookSeriesId } from '../types/exam';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

function sanitizeIdPart(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return cleaned.slice(0, 60) || 'item';
}

export function subscribeToCustomExams(
  onData: (exams: Exam[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'exams';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Exam[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          creatorId: String(d.creatorId || ''),
          creatorName: String(d.creatorName || 'Giáo viên / Phụ huynh'),
          title: String(d.title || ''),
          subject: d.subject as SubjectId,
          textbookSeries: d.textbookSeries as TextbookSeriesId,
          topic: String(d.topic || ''),
          durationMinutes: 25,
          questionCount: Number(d.questionCount || 0),
          questions: Array.isArray(d.questions) ? (d.questions as Question[]) : [],
          isOfficial: false,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    },
  );
}

export interface CreateExamPayload {
  title: string;
  subject: SubjectId;
  textbookSeries: TextbookSeriesId;
  topic: string;
  questions: Question[];
}

export async function createExamInFirestore(
  payload: CreateExamPayload,
  user: User,
): Promise<string> {
  const examId = `exam_${Date.now()}_${sanitizeIdPart(user.uid).slice(0, 12)}`;
  const path = `exams/${examId}`;
  const trimmedTitle = payload.title.trim().slice(0, 140);
  const trimmedTopic = payload.topic.trim().slice(0, 120);
  const creatorName = (user.displayName || user.email?.split('@')[0] || 'Giáo viên').trim().slice(0, 80);
  const boundedQuestions = payload.questions.slice(0, 30).map((q, idx) => ({
    id: sanitizeIdPart(q.id || `q_${idx + 1}`),
    prompt: q.prompt.trim().slice(0, 400),
    options: [
      q.options[0].trim().slice(0, 200),
      q.options[1].trim().slice(0, 200),
      q.options[2].trim().slice(0, 200),
      q.options[3].trim().slice(0, 200),
    ] as [string, string, string, string],
    correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
    explanation: q.explanation.trim().slice(0, 500),
    curriculumTag: (q.curriculumTag || 'Chuẩn SGK Lớp 1').trim().slice(0, 80),
  }));

  if (trimmedTitle.length < 3 || trimmedTopic.length < 2 || boundedQuestions.length < 1) {
    throw new Error('Thông tin đề thi chưa hợp lệ.');
  }

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'exams', examId), {
      creatorId: user.uid,
      creatorName,
      title: trimmedTitle,
      subject: payload.subject,
      textbookSeries: payload.textbookSeries,
      topic: trimmedTopic,
      durationMinutes: 25,
      questionCount: boundedQuestions.length,
      questions: boundedQuestions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return examId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteExamFromFirestore(examId: string): Promise<void> {
  const path = `exams/${examId}`;
  try {
    await deleteDoc(doc(db, 'exams', examId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export interface SubmitExamParams {
  exam: Exam;
  studentName: string;
  selectedAnswers: number[];
  score: number;
  correctCount: number;
  durationSecondsUsed: number;
  weekId: string;
}

export async function submitAttemptAndLeaderboard(
  params: SubmitExamParams,
  user: User,
): Promise<{ attemptId: string; leaderboardUpdated: boolean }> {
  const timestamp = Date.now();
  const safeUid = sanitizeIdPart(user.uid).slice(0, 24);
  const safeExamId = sanitizeIdPart(params.exam.id).slice(0, 48);
  const attemptId = `att_${timestamp}_${safeUid}`;
  const entryId = `${params.weekId}_${safeUid}_${safeExamId}`;

  const cleanStudentName = (params.studentName.trim() || user.displayName || 'Học sinh Lớp 1').slice(0, 80);
  const cleanExamTitle = params.exam.title.trim().slice(0, 140);
  const clampedDuration = Math.min(1500, Math.max(0, Math.round(params.durationSecondsUsed)));
  const clampedScore = Math.min(10, Math.max(0, Number(params.score.toFixed(2))));

  const attemptRef = doc(db, 'attempts', attemptId);
  const leaderboardRef = doc(db, 'leaderboard', entryId);

  let existingEntry: { score: number; durationSecondsUsed: number } | null = null;
  try {
    const existingSnap = await getDoc(leaderboardRef);
    if (existingSnap.exists()) {
      const d = existingSnap.data();
      existingEntry = {
        score: Number(d.score ?? 0),
        durationSecondsUsed: Number(d.durationSecondsUsed ?? 1500),
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `leaderboard/${entryId}`);
  }

  const shouldUpdateLeaderboard =
    !existingEntry ||
    clampedScore > existingEntry.score ||
    (clampedScore === existingEntry.score && clampedDuration < existingEntry.durationSecondsUsed);

  try {
    const batch = writeBatch(db);
    batch.set(attemptRef, {
      userId: user.uid,
      studentName: cleanStudentName,
      examId: safeExamId,
      examTitle: cleanExamTitle,
      subject: params.exam.subject,
      textbookSeries: params.exam.textbookSeries,
      score: clampedScore,
      correctCount: params.correctCount,
      totalQuestions: params.exam.questions.length,
      durationSecondsUsed: clampedDuration,
      weekId: params.weekId,
      selectedAnswers: params.selectedAnswers.slice(0, 30),
      submittedAt: serverTimestamp(),
    });

    if (shouldUpdateLeaderboard) {
      if (existingEntry) {
        batch.update(leaderboardRef, {
          attemptId,
          studentName: cleanStudentName,
          score: clampedScore,
          correctCount: params.correctCount,
          durationSecondsUsed: clampedDuration,
          submittedAt: serverTimestamp(),
        });
      } else {
        batch.set(leaderboardRef, {
          attemptId,
          userId: user.uid,
          studentName: cleanStudentName,
          examId: safeExamId,
          examTitle: cleanExamTitle,
          subject: params.exam.subject,
          score: clampedScore,
          correctCount: params.correctCount,
          totalQuestions: params.exam.questions.length,
          durationSecondsUsed: clampedDuration,
          weekId: params.weekId,
          submittedAt: serverTimestamp(),
        });
      }
    }

    await batch.commit();
    return { attemptId, leaderboardUpdated: shouldUpdateLeaderboard };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `attempts/${attemptId}`);
  }
}

export function subscribeToWeeklyLeaderboard(
  weekId: string,
  onData: (entries: LeaderboardEntry[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'leaderboard';
  const q = query(collection(db, path), where('weekId', '==', weekId), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const entries: LeaderboardEntry[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          attemptId: String(d.attemptId || ''),
          userId: String(d.userId || ''),
          studentName: String(d.studentName || 'Học sinh'),
          examId: String(d.examId || ''),
          examTitle: String(d.examTitle || ''),
          subject: d.subject as SubjectId,
          score: Number(d.score || 0),
          correctCount: Number(d.correctCount || 0),
          totalQuestions: Number(d.totalQuestions || 0),
          durationSecondsUsed: Number(d.durationSecondsUsed || 0),
          weekId: String(d.weekId || weekId),
          submittedAt: d.submittedAt,
        };
      });
      entries.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.durationSecondsUsed - b.durationSecondsUsed;
      });
      onData(entries);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    },
  );
}

export function subscribeToMyAttempts(
  userId: string,
  onData: (attempts: ExamAttempt[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const path = 'attempts';
  const q = query(collection(db, path), where('userId', '==', userId), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: ExamAttempt[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: String(d.userId || ''),
          studentName: String(d.studentName || ''),
          examId: String(d.examId || ''),
          examTitle: String(d.examTitle || ''),
          subject: d.subject as SubjectId,
          textbookSeries: d.textbookSeries as TextbookSeriesId,
          score: Number(d.score || 0),
          correctCount: Number(d.correctCount || 0),
          totalQuestions: Number(d.totalQuestions || 0),
          durationSecondsUsed: Number(d.durationSecondsUsed || 0),
          weekId: String(d.weekId || ''),
          selectedAnswers: Array.isArray(d.selectedAnswers) ? (d.selectedAnswers as number[]) : [],
          submittedAt: d.submittedAt,
        };
      });
      list.sort((a, b) => {
        const ta =
          a.submittedAt && typeof a.submittedAt === 'object' && 'toMillis' in a.submittedAt
            ? (a.submittedAt as { toMillis: () => number }).toMillis()
            : 0;
        const tb =
          b.submittedAt && typeof b.submittedAt === 'object' && 'toMillis' in b.submittedAt
            ? (b.submittedAt as { toMillis: () => number }).toMillis()
            : 0;
        return tb - ta;
      });
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    },
  );
}
