import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  RotateCcw,
  Shuffle,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { playCelebrationApplause, stopCelebrationApplause } from '../lib/applauseAudio';
import {
  Exam,
  formatDurationVietnamese,
  getSubjectMeta,
  getTextbookMeta,
} from '../types/exam';
import CertificateCard from './CertificateCard';
import QuestionVisual from './QuestionVisual';

export interface GradedExamResult {
  exam: Exam;
  studentName: string;
  selectedAnswers: number[];
  correctCount: number;
  score: number;
  durationSecondsUsed: number;
  weekId: string;
  leaderboardUpdated: boolean;
}

interface ExamResultViewProps {
  result: GradedExamResult;
  onRetake: () => void;
  onNewRandomExam: () => void;
  onBackToCatalog: () => void;
  onViewLeaderboard: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function ExamResultView({
  result,
  onRetake,
  onNewRandomExam,
  onBackToCatalog,
  onViewLeaderboard,
}: ExamResultViewProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('all');
  const speech = useSpeechSynthesis();

  const isHighScore = result.score >= 8;
  const subjectMeta = getSubjectMeta(result.exam.subject);
  const textbookMeta = getTextbookMeta(result.exam.textbookSeries);
  const total = result.exam.questions.length;

  useEffect(() => {
    if (isHighScore) {
      void playCelebrationApplause(false);
    }
    return () => {
      stopCelebrationApplause();
      speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHighScore]);

  const handleReplayApplause = () => {
    void playCelebrationApplause(true);
    if (speech.supported) {
      const praise =
        result.score >= 9
          ? `Hoan hô ${result.studentName}! Con đã xuất sắc đạt ${result.score} điểm và nhận được giấy khen!`
          : `Chúc mừng ${result.studentName}! Con đã làm bài rất tốt với ${result.score} điểm và nhận được giấy khen!`;
      window.setTimeout(() => {
        speech.speak(praise, 'celebrate-praise', 'vi-VN');
      }, 950);
    }
  };

  const performanceSummary = useMemo(() => {
    if (result.score >= 9.5) {
      return {
        label: 'Danh hiệu Trạng Nguyên Nhí · Xuất sắc',
        detail: 'Thí sinh nhí trả lời tuyệt vời! Chúc mừng con nhận Giấy Khen Trạng Nguyên Nhí.',
        colorClass: 'text-rose-800 bg-amber-50 border-amber-300',
      };
    }
    if (result.score >= 9) {
      return {
        label: 'Danh hiệu Bảng Nhãn · Hoàn thành xuất sắc',
        detail: 'Con nắm rất chắc kiến thức! Chúc mừng con nhận Giấy Khen Bảng Nhãn.',
        colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      };
    }
    if (result.score >= 8) {
      return {
        label: 'Danh hiệu Thám Hoa · Hoàn thành tốt',
        detail: 'Con làm bài rất giỏi! Hãy xem lại vài câu còn lại để đạt Trạng Nguyên Nhí nhé.',
        colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      };
    }
    if (result.score >= 6) {
      return {
        label: 'Sĩ tử làm bài khá · Cố gắng thêm nhé',
        detail: 'Con đạt từ 8 điểm trở lên sẽ được vỗ tay tuyên dương và nhận Giấy Khen Trạng Nguyên nhé!',
        colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    }
    return {
      label: 'Cần ôn tập thêm',
      detail: 'Con hãy bấm loa nghe giải thích từng câu bên dưới để ghi nhớ và thi lại nhé!',
      colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
    };
  }, [result.score]);

  const filteredQuestions = useMemo(() => {
    return result.exam.questions
      .map((q, index) => ({
        question: q,
        index,
        chosenIndex: result.selectedAnswers[index] ?? -1,
        isCorrect: (result.selectedAnswers[index] ?? -1) === q.correctIndex,
      }))
      .filter((item) => {
        if (filterMode === 'wrong') return !item.isCorrect;
        if (filterMode === 'correct') return item.isCorrect;
        return true;
      });
  }, [result.exam.questions, result.selectedAnswers, filterMode]);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Certificate of Merit when High Score (>= 8.0) */}
      {isHighScore && (
        <CertificateCard
          studentName={result.studentName}
          examTitle={result.exam.title}
          subject={result.exam.subject}
          textbookSeries={result.exam.textbookSeries}
          score={result.score}
          correctCount={result.correctCount}
          totalQuestions={total}
          durationSecondsUsed={result.durationSecondsUsed}
          onReplayApplause={handleReplayApplause}
        />
      )}

      {/* Instant Score Card */}
      <div className="no-print bg-white border border-amber-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-stone-500">
              {subjectMeta.name} · {textbookMeta.shortName} · Thí sinh: {result.studentName}
            </p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-stone-900">
              Kết quả vòng thi: {result.exam.title}
            </h1>

            <div
              className={`mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-semibold ${performanceSummary.colorClass}`}
            >
              <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{performanceSummary.label}</span>
            </div>
            <p className="mt-2 text-sm text-stone-600">{performanceSummary.detail}</p>
          </div>

          {/* Score Numerals */}
          <div className="bg-[#FFFDF9] border border-amber-200 rounded-xl px-6 py-5 text-center shrink-0 min-w-[190px]">
            <p className="text-xs font-medium text-stone-500">Điểm số đạt được</p>
            <p className="mt-1 font-mono-nums text-4xl font-bold text-emerald-800">
              {result.score.toFixed(1)}
              <span className="text-lg font-medium text-stone-500"> / 10</span>
            </p>
            <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-center gap-4 text-xs text-stone-600 tabular-nums">
              <span>
                Đúng <strong className="text-stone-900">{result.correctCount}/{total}</strong> câu
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                {formatDurationVietnamese(result.durationSecondsUsed)}
              </span>
            </div>
          </div>
        </div>

        {/* Auto-Saved Local Leaderboard Strip */}
        <div className="mt-6 pt-5 border-t border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 text-sm text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              {result.leaderboardUpdated
                ? 'Đã tự động ghi danh thành tích mới lên Bảng Vàng Trạng Nguyên tuần này.'
                : 'Đã lưu kết quả vào lịch sử ôn luyện (giữ nguyên kỷ lục cao hơn trong tuần).'}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopCelebrationApplause();
                speech.stop();
                onNewRandomExam();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Thi đề ngẫu nhiên khác</span>
            </button>
            <button
              type="button"
              onClick={() => {
                stopCelebrationApplause();
                speech.stop();
                onViewLeaderboard();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Xem Bảng Vàng</span>
            </button>
            <button
              type="button"
              onClick={() => {
                stopCelebrationApplause();
                speech.stop();
                onRetake();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Thi lại đề này</span>
            </button>
            <button
              type="button"
              onClick={() => {
                stopCelebrationApplause();
                speech.stop();
                onBackToCatalog();
              }}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-amber-200 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Answer Key & Explanations */}
      <div className="no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Đáp án chi tiết từng câu hỏi
            </h2>
            <p className="text-sm text-slate-600">
              Xem lại lựa chọn của con, hình minh họa và bấm loa để nghe lời giải thích.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Tất cả ({total})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterMode === 'correct' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Câu đúng ({result.correctCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('wrong')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterMode === 'wrong' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Câu sai ({total - result.correctCount})
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
              Không có câu hỏi nào trong mục lọc này.
            </div>
          ) : (
            filteredQuestions.map(({ question, index, chosenIndex, isCorrect }) => {
              const expKey = `exp-${question.id}`;
              const isReadingExp = speech.isSpeaking && speech.activeKey === expKey;

              return (
                <article
                  key={question.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono-nums font-semibold text-slate-900">
                        Câu {index + 1}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{question.questionType || question.curriculumTag}</span>
                    </div>

                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Trả lời đúng</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        <span>{chosenIndex === -1 ? 'Chưa trả lời' : 'Chưa đúng'}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-display text-lg font-semibold text-slate-900">
                    {question.prompt}
                  </h3>

                  {question.visual && <QuestionVisual visual={question.visual} />}

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {question.options.map((opt, optIdx) => {
                      const isRightAnswer = optIdx === question.correctIndex;
                      const isUserChoice = optIdx === chosenIndex;

                      let boxClass = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isRightAnswer) {
                        boxClass = 'bg-emerald-50 border-emerald-300 text-emerald-950';
                      } else if (isUserChoice && !isRightAnswer) {
                        boxClass = 'bg-rose-50 border-rose-300 text-rose-950';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`px-3.5 py-2.5 rounded-lg border text-sm flex items-center justify-between gap-2 ${boxClass}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono-nums font-bold text-xs">
                              {OPTION_LETTERS[optIdx]}.
                            </span>
                            <span className="font-medium">{opt}</span>
                          </div>
                          {isRightAnswer && (
                            <span className="text-xs font-semibold text-emerald-700 shrink-0">
                              Đáp án đúng
                            </span>
                          )}
                          {isUserChoice && !isRightAnswer && (
                            <span className="text-xs font-semibold text-rose-700 shrink-0">
                              Con đã chọn
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation + Speaker */}
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Giải thích chi tiết</p>
                      <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>

                    {speech.supported && (
                      <button
                        type="button"
                        onClick={() =>
                          speech.speak(
                            `Câu ${index + 1}. Đáp án đúng là ${question.options[question.correctIndex]}. ${question.explanation}`,
                            expKey,
                            'vi-VN',
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border shrink-0 transition-colors cursor-pointer ${
                          isReadingExp
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-white text-sky-700 border-sky-200 hover:bg-sky-50'
                        }`}
                      >
                        {isReadingExp ? (
                          <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>{isReadingExp ? 'Dừng' : 'Nghe giải thích'}</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
