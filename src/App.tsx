/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import CurriculumGuide from './components/CurriculumGuide';
import ExamBuilder from './components/ExamBuilder';
import ExamCatalog from './components/ExamCatalog';
import ExamResultView, { GradedExamResult } from './components/ExamResultView';
import ExamRunner, { CompletedExamPayload } from './components/ExamRunner';
import HeroSection from './components/HeroSection';
import Navbar, { ActiveView } from './components/Navbar';
import WeeklyLeaderboard from './components/WeeklyLeaderboard';
import {
  OFFICIAL_EXAMS,
  pickRandomExamFromBank,
  prepareRandomizedExam,
} from './data/curriculumGrade1';
import { playCelebrationApplause, unlockCelebrationAudio } from './lib/applauseAudio';
import {
  deleteCustomExam,
  loadAttempts,
  loadCustomExams,
  loadLeaderboard,
  loadStudentName,
  recordExamSubmission,
  saveCustomExam,
} from './lib/localStore';
import {
  Exam,
  ExamAttempt,
  getIsoWeekId,
  LeaderboardEntry,
  SubjectId,
} from './types/exam';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('exams');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');

  const [customExams, setCustomExams] = useState<Exam[]>(() => loadCustomExams());
  const [attempts, setAttempts] = useState<ExamAttempt[]>(() => loadAttempts());
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>(() =>
    loadLeaderboard(),
  );
  const [defaultStudentName, setDefaultStudentName] = useState<string>(() => loadStudentName());

  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [gradedResult, setGradedResult] = useState<GradedExamResult | null>(null);

  const currentWeekId = useMemo(() => getIsoWeekId(new Date()), []);
  const [selectedWeekId, setSelectedWeekId] = useState<string>(currentWeekId);

  const mathOfficialCount = useMemo(
    () => OFFICIAL_EXAMS.filter((e) => e.subject === 'toan').length,
    [],
  );
  const vietnameseOfficialCount = useMemo(
    () => OFFICIAL_EXAMS.filter((e) => e.subject === 'tieng-viet').length,
    [],
  );

  const handleNavigate = (view: ActiveView) => {
    setActiveExam(null);
    setGradedResult(null);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExam = (exam: Exam, randomizeOrder = true) => {
    unlockCelebrationAudio();
    const prepared = prepareRandomizedExam(exam, randomizeOrder);
    setGradedResult(null);
    setActiveExam(prepared);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExamFromBank = (subject: SubjectId | 'all' = selectedSubject) => {
    unlockCelebrationAudio();
    const picked = pickRandomExamFromBank(subject, customExams);
    setGradedResult(null);
    setActiveExam(picked);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteExam = (payload: CompletedExamPayload) => {
    const total = payload.exam.questions.length;
    let correctCount = 0;
    payload.exam.questions.forEach((q, idx) => {
      if ((payload.selectedAnswers[idx] ?? -1) === q.correctIndex) {
        correctCount += 1;
      }
    });
    const score = total > 0 ? Number(((correctCount / total) * 10).toFixed(1)) : 0;
    const weekId = getIsoWeekId(new Date());

    // Auto-play applause & spoken praise immediately when high score (>= 8.0) triggers CertificateCard
    if (score >= 8) {
      void playCelebrationApplause(true);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const msg = new SpeechSynthesisUtterance(
            score >= 9
              ? `Hoan hô ${payload.studentName}! Con đã xuất sắc đạt ${score} điểm và nhận được giấy khen!`
              : `Chúc mừng ${payload.studentName}! Con đã làm rất tốt với ${score} điểm và nhận được giấy khen!`,
          );
          msg.lang = 'vi-VN';
          msg.rate = 0.92;
          window.setTimeout(() => {
            window.speechSynthesis.speak(msg);
          }, 1100);
        } catch {
          // ignore speech errors
        }
      }
    }

    const saved = recordExamSubmission({
      exam: payload.exam,
      studentName: payload.studentName,
      selectedAnswers: payload.selectedAnswers,
      score,
      correctCount,
      durationSecondsUsed: payload.durationSecondsUsed,
      weekId,
    });

    setDefaultStudentName(payload.studentName);
    setAttempts(saved.attempts);
    setLeaderboardEntries(saved.leaderboard);

    setActiveExam(null);
    setGradedResult({
      exam: payload.exam,
      studentName: payload.studentName,
      selectedAnswers: payload.selectedAnswers,
      correctCount,
      score,
      durationSecondsUsed: payload.durationSecondsUsed,
      weekId,
      leaderboardUpdated: saved.leaderboardUpdated,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublishExam = (newExam: Exam) => {
    const next = saveCustomExam(newExam);
    setCustomExams(next);
    setSelectedSubject(newExam.subject);
    setActiveView('exams');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCustomExam = (examId: string) => {
    const next = deleteCustomExam(examId);
    setCustomExams(next);
  };

  const isTakingExam = Boolean(activeExam);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onQuickRandomExam={() => handleStartExamFromBank(selectedSubject)}
        disabled={isTakingExam}
      />

      <main className="flex-1">
        {activeExam ? (
          <ExamRunner
            exam={activeExam}
            defaultStudentName={defaultStudentName}
            onExit={() => setActiveExam(null)}
            onComplete={handleCompleteExam}
          />
        ) : gradedResult ? (
          <ExamResultView
            result={gradedResult}
            onRetake={() => handleStartExam(gradedResult.exam, true)}
            onNewRandomExam={() => handleStartExamFromBank(gradedResult.exam.subject)}
            onBackToCatalog={() => {
              setGradedResult(null);
              setActiveView('exams');
            }}
            onViewLeaderboard={() => {
              setGradedResult(null);
              setSelectedWeekId(gradedResult.weekId);
              setActiveView('leaderboard');
            }}
          />
        ) : activeView === 'create' ? (
          <ExamBuilder
            onPublishExam={handlePublishExam}
            onCancel={() => handleNavigate('exams')}
          />
        ) : activeView === 'leaderboard' ? (
          <WeeklyLeaderboard
            currentWeekId={currentWeekId}
            selectedWeekId={selectedWeekId}
            onSelectWeekId={setSelectedWeekId}
            entries={leaderboardEntries}
            myAttempts={attempts}
            onStartPractice={() => handleNavigate('exams')}
          />
        ) : activeView === 'curriculum' ? (
          <CurriculumGuide
            onPracticeSubject={(subject) => {
              setSelectedSubject(subject);
              handleNavigate('exams');
            }}
          />
        ) : (
          <>
            <HeroSection
              onStartExamNow={() => handleStartExamFromBank(selectedSubject)}
              onCreateExam={() => handleNavigate('create')}
              onViewLeaderboard={() => handleNavigate('leaderboard')}
            />
            <ExamCatalog
              totalOfficialCount={OFFICIAL_EXAMS.length}
              mathCount={mathOfficialCount}
              vietnameseCount={vietnameseOfficialCount}
              customExams={customExams}
              selectedSubject={selectedSubject}
              onSelectSubject={setSelectedSubject}
              onStartExamFromBank={handleStartExamFromBank}
              onStartSpecificExam={(exam) => handleStartExam(exam, true)}
              onCreateExam={() => handleNavigate('create')}
              onDeleteCustomExam={handleDeleteCustomExam}
            />
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Bảng Vàng Lớp 1 · Kho 100 đề Toán (Cộng &amp; Trừ) &amp; Tiếng Việt GDPT 2018</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleNavigate('exams')}
              disabled={isTakingExam}
              className="hover:text-slate-800 cursor-pointer disabled:opacity-50"
            >
              Luyện thi
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('create')}
              disabled={isTakingExam}
              className="hover:text-slate-800 cursor-pointer disabled:opacity-50"
            >
              Tạo đề thi
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('leaderboard')}
              disabled={isTakingExam}
              className="hover:text-slate-800 cursor-pointer disabled:opacity-50"
            >
              Bảng xếp hạng tuần
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
