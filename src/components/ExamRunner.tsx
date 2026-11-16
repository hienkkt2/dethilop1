import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Flag,
  Music,
  Play,
  Send,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { playOptionSelectSound, unlockCelebrationAudio } from '../lib/applauseAudio';
import {
  EXAM_DURATION_MINUTES,
  EXAM_DURATION_SECONDS,
  Exam,
  formatDurationMMSS,
  getSubjectMeta,
  getTextbookMeta,
} from '../types/exam';
import QuestionVisual from './QuestionVisual';

export interface CompletedExamPayload {
  exam: Exam;
  studentName: string;
  selectedAnswers: number[];
  durationSecondsUsed: number;
}

interface ExamRunnerProps {
  exam: Exam;
  defaultStudentName: string;
  onExit: () => void;
  onComplete: (result: CompletedExamPayload) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function ExamRunner({
  exam,
  defaultStudentName,
  onExit,
  onComplete,
}: ExamRunnerProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [nameError, setNameError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(() =>
    new Array(exam.questions.length).fill(-1),
  );
  const [flagged, setFlagged] = useState<boolean[]>(() =>
    new Array(exam.questions.length).fill(false),
  );
  const [secondsLeft, setSecondsLeft] = useState(EXAM_DURATION_SECONDS);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  const speech = useSpeechSynthesis();

  const submittedRef = useRef(false);
  const latestAnswersRef = useRef(selectedAnswers);
  const latestSecondsLeftRef = useRef(secondsLeft);
  const latestStudentNameRef = useRef(studentName);

  latestAnswersRef.current = selectedAnswers;
  latestSecondsLeftRef.current = secondsLeft;
  latestStudentNameRef.current = studentName;

  const subjectMeta = getSubjectMeta(exam.subject);
  const textbookMeta = getTextbookMeta(exam.textbookSeries);

  const finalizeSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    speech.stop();
    const used = Math.min(
      EXAM_DURATION_SECONDS,
      Math.max(1, EXAM_DURATION_SECONDS - latestSecondsLeftRef.current),
    );
    onComplete({
      exam,
      studentName: latestStudentNameRef.current.trim() || 'Bé Lớp 1',
      selectedAnswers: latestAnswersRef.current,
      durationSecondsUsed: used,
    });
  };

  useEffect(() => {
    if (!hasStarted) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          finalizeSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted]);

  // Stop speaking when navigating between questions
  useEffect(() => {
    speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const answeredCount = useMemo(
    () => selectedAnswers.filter((ans) => ans >= 0).length,
    [selectedAnswers],
  );
  const unansweredCount = exam.questions.length - answeredCount;
  const currentQuestion = exam.questions[currentIndex];
  const visualCount = useMemo(
    () => exam.questions.filter((q) => Boolean(q.visual)).length,
    [exam.questions],
  );

  const timerStatus = useMemo(() => {
    if (secondsLeft <= 60) {
      return {
        label: 'Dưới 1 phút · Sắp tự động nộp bài',
        boxClass: 'bg-rose-50 border-rose-300 text-rose-800',
        barClass: 'bg-rose-600',
      };
    }
    if (secondsLeft <= 300) {
      return {
        label: 'Còn dưới 5 phút · Hãy kiểm tra lại bài',
        boxClass: 'bg-amber-50 border-amber-300 text-amber-900',
        barClass: 'bg-amber-500',
      };
    }
    return {
      label: 'Đang trong phòng thi · Thời gian ổn định',
      boxClass: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      barClass: 'bg-emerald-700',
    };
  }, [secondsLeft]);

  const handleStartClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim().length < 2) {
      setNameError('Vui lòng nhập tên của con (ít nhất 2 ký tự) trước khi vào làm bài thi.');
      return;
    }
    unlockCelebrationAudio();
    setNameError('');
    setHasStarted(true);
  };

  const handleSelectOption = (optionIndex: number) => {
    unlockCelebrationAudio();
    if (soundEffectsEnabled) {
      playOptionSelectSound(optionIndex);
    }
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
  };

  const handleToggleFlag = () => {
    setFlagged((prev) => {
      const next = [...prev];
      next[currentIndex] = !next[currentIndex];
      return next;
    });
  };

  const handleReadPrompt = () => {
    const text = currentQuestion.speechText || currentQuestion.prompt;
    speech.speak(text, `prompt-${currentQuestion.id}`, 'vi-VN');
  };

  const handleReadAllOptions = () => {
    const optionsSpeech = currentQuestion.options
      .map((opt, idx) => `Đáp án ${OPTION_LETTERS[idx]}: ${opt}`)
      .join('. ');
    speech.speak(optionsSpeech, `options-${currentQuestion.id}`, 'vi-VN');
  };

  if (!hasStarted) {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quay lại chọn môn</span>
        </button>

        <div className="bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span className="font-semibold text-emerald-800">Phòng Thi Trạng Nguyên</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-stone-700">{subjectMeta.name}</span>
            <span aria-hidden="true">·</span>
            <span>{textbookMeta.name}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{exam.questions.length} câu</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{EXAM_DURATION_MINUTES} phút</span>
          </div>

          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-stone-900">
            {exam.title}
          </h1>
          <p className="mt-2 text-sm text-stone-600">{exam.topic}</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-amber-100">
            <div>
              <p className="text-xs text-stone-500">Thời gian vòng thi</p>
              <p className="mt-0.5 font-mono-nums text-lg font-semibold text-emerald-800">
                25:00 phút
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Số lượng câu hỏi</p>
              <p className="mt-0.5 font-mono-nums text-lg font-semibold text-stone-900">
                {exam.questions.length} câu ({visualCount} hình ảnh)
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Khen thưởng Trạng Nguyên</p>
              <p className="mt-0.5 text-sm font-semibold text-amber-700">
                Từ 8 điểm nhận Giấy Khen
              </p>
            </div>
          </div>

          <form onSubmit={handleStartClick} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="student-name-input"
                className="block text-sm font-semibold text-stone-800 mb-1.5"
              >
                Nhập họ tên thí sinh nhí trước khi vào phòng thi
              </label>
              <input
                id="student-name-input"
                type="text"
                autoFocus
                maxLength={80}
                value={studentName}
                onChange={(e) => {
                  setStudentName(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="Ví dụ: Nguyễn Minh An - Lớp 1A"
                className="w-full px-4 py-3 text-base text-stone-900 bg-[#FFFDF9] border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="mt-1.5 text-xs text-stone-500">
                Tên này sẽ được in trang trọng lên Giấy Khen Trạng Nguyên và Bảng Vàng tuần khi con nộp bài.
              </p>
              {nameError && <p className="mt-1.5 text-xs font-medium text-rose-600">{nameError}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 border-b-2 border-emerald-900 rounded-xl transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>Vào thi ngay (25 phút)</span>
              </button>
              <button
                type="button"
                onClick={onExit}
                className="px-4 py-3 text-sm font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Chọn môn khác
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  const timeProgressPct = Math.round((secondsLeft / EXAM_DURATION_SECONDS) * 100);
  const answerProgressPct = Math.round((answeredCount / Math.max(1, exam.questions.length)) * 100);
  const readingPrompt = speech.isSpeaking && speech.activeKey === `prompt-${currentQuestion.id}`;
  const readingOptions = speech.isSpeaking && speech.activeKey === `options-${currentQuestion.id}`;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Compact Exam Top Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-200">
        <div>
          <p className="text-xs text-stone-600">
            Phòng Thi Trạng Nguyên · {subjectMeta.shortName} · Thí sinh:{' '}
            <strong className="text-emerald-900">{studentName}</strong>
          </p>
          <h1 className="font-display text-xl font-bold text-stone-900">{exam.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEffectsEnabled((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              soundEffectsEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-stone-500 border-amber-200 hover:text-stone-800'
            }`}
          >
            <Music className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{soundEffectsEnabled ? 'Âm chọn đáp án: Bật' : 'Âm chọn đáp án: Tắt'}</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmExitOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-amber-200 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Thoát phòng thi</span>
          </button>
        </div>
      </div>

      {/* Inline Exit Confirmation */}
      {confirmExitOpen && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Nếu thoát bây giờ, bài thi hiện tại sẽ không được ghi điểm lên Bảng Vàng.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmExitOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-amber-200 rounded-lg cursor-pointer"
            >
              Thi tiếp
            </button>
            <button
              type="button"
              onClick={() => {
                speech.stop();
                onExit();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
            >
              Xác nhận thoát
            </button>
          </div>
        </div>
      )}

      {/* Two-Zone Trạng Nguyên Exam Workspace */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main Interactive Question Stage */}
        <div className="lg:col-span-8 bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Trạng Nguyên Progress Header */}
          <div className="pb-4 border-b border-amber-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                <span className="font-mono-nums text-sm font-bold text-emerald-900">
                  Câu {currentIndex + 1} / {exam.questions.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentQuestion.questionType || currentQuestion.curriculumTag}</span>
              </div>

              <button
                type="button"
                onClick={handleToggleFlag}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  flagged[currentIndex]
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-stone-600 border-amber-200 hover:bg-amber-50/50'
                }`}
              >
                <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{flagged[currentIndex] ? 'Đã đánh dấu xem lại' : 'Đánh dấu xem lại'}</span>
              </button>
            </div>

            <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${answerProgressPct}%` }}
              />
            </div>
          </div>

          {/* Read-Aloud Speaker Toolbar */}
          {speech.supported && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleReadPrompt}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    readingPrompt
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                >
                  {readingPrompt ? (
                    <VolumeX className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>{readingPrompt ? 'Dừng đọc đề' : 'Nghe đọc đề bài'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReadAllOptions}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    readingOptions
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {readingOptions ? (
                    <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{readingOptions ? 'Dừng đọc đáp án' : 'Đọc 4 đáp án A, B, C, D'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-600 font-medium">Tốc độ:</span>
                <button
                  type="button"
                  onClick={() => speech.setRate(0.78)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    speech.rate < 0.85
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-stone-600 border border-emerald-200'
                  }`}
                >
                  Chậm
                </button>
                <button
                  type="button"
                  onClick={() => speech.setRate(0.95)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    speech.rate >= 0.85
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-stone-600 border border-emerald-200'
                  }`}
                >
                  Vừa
                </button>
              </div>
            </div>
          )}

          <h2 className="mt-5 font-display text-xl sm:text-2xl font-semibold text-stone-900 leading-relaxed">
            {currentQuestion.prompt}
          </h2>

          {/* Visual Illustration if present */}
          {currentQuestion.visual && <QuestionVisual visual={currentQuestion.visual} />}

          <div
            className="mt-6 space-y-3"
            role="radiogroup"
            aria-label={`Đáp án câu ${currentIndex + 1}`}
          >
            {currentQuestion.options.map((optionText, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left px-4 py-4 rounded-xl border border-b-2 transition-all active:translate-y-[1px] flex items-center justify-between gap-4 min-h-[60px] cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-700 border-b-emerald-800 text-stone-900'
                      : 'bg-[#FFFDF9] border-amber-200 border-b-amber-300 text-stone-800 hover:bg-amber-50/70 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono-nums text-sm font-bold shrink-0 ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {OPTION_LETTERS[optIdx]}
                    </span>
                    <span className="text-base font-medium leading-snug">{optionText}</span>
                  </div>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 shrink-0">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Đã chọn</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Question Navigation Footer */}
          <div className="mt-8 pt-5 border-t border-amber-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Câu trước</span>
            </button>

            {currentIndex < exam.questions.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 border-b-2 border-emerald-900 rounded-xl transition-colors cursor-pointer"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 border-b-2 border-amber-800 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Hoàn thành &amp; Nộp bài</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Sticky Control & Timer Deck */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          <div className={`border rounded-2xl p-5 ${timerStatus.boxClass}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>Thời gian còn lại</span>
              </div>
              <span className="font-mono-nums text-2xl font-bold tracking-tight">
                {formatDurationMMSS(secondsLeft)}
              </span>
            </div>

            <div className="mt-3 h-2 w-full bg-white/80 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${timerStatus.barClass}`}
                style={{ width: `${timeProgressPct}%` }}
              />
            </div>

            <p className="mt-2 text-xs font-medium">{timerStatus.label}</p>
          </div>

          {/* Question Grid Map */}
          <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-stone-600 mb-3">
              <span className="font-semibold text-stone-900">Phiếu trả lời Trạng Nguyên</span>
              <span className="font-mono-nums font-semibold text-emerald-800">
                Đã làm {answeredCount}/{exam.questions.length}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[idx] >= 0;
                const isFlagged = flagged[idx];

                let btnClass =
                  'bg-[#FFFDF9] text-stone-700 border-amber-200 hover:bg-amber-50';
                if (isAnswered) {
                  btnClass = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold';
                }
                if (isFlagged) {
                  btnClass = 'bg-amber-50 text-amber-900 border-amber-400 font-semibold';
                }
                if (isCurrent) {
                  btnClass = 'bg-emerald-700 text-white border-emerald-700 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Chuyển đến câu ${idx + 1}${isAnswered ? ' (đã trả lời)' : ''}`}
                    className={`h-10 rounded-lg border font-mono-nums text-xs transition-colors flex items-center justify-center gap-0.5 cursor-pointer ${btnClass}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && !isCurrent && (
                      <Flag className="w-2.5 h-2.5 text-amber-600" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                Đã chọn đáp án
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                Xem lại
              </span>
            </div>

            {!confirmSubmitOpen ? (
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(true)}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 border-b-2 border-emerald-900 rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Nộp bài &amp; Xem điểm ngay</span>
              </button>
            ) : (
              <div className="mt-5 p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                <p className="text-xs font-medium text-stone-800 leading-relaxed">
                  {unansweredCount > 0
                    ? `Thí sinh vẫn còn ${unansweredCount} câu chưa chọn đáp án. Có muốn nộp bài ngay không?`
                    : 'Bé đã trả lời đủ tất cả câu hỏi. Xác nhận nộp bài để chấm điểm ngay?'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      unlockCelebrationAudio();
                      finalizeSubmit();
                    }}
                    className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                  >
                    Xác nhận nộp bài
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmSubmitOpen(false)}
                    className="px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-amber-200 hover:bg-amber-50 rounded-lg cursor-pointer"
                  >
                    Kiểm tra thêm
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
