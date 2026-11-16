import { BookOpen, Calculator, CheckCircle2, Play, Plus, Shuffle, Trash2 } from 'lucide-react';
import { Exam, getSubjectMeta, SUBJECTS, SubjectId } from '../types/exam';

interface ExamCatalogProps {
  totalOfficialCount: number;
  mathCount: number;
  vietnameseCount: number;
  customExams: Exam[];
  selectedSubject: SubjectId | 'all';
  onSelectSubject: (subject: SubjectId | 'all') => void;
  onStartExamFromBank: (subject: SubjectId | 'all') => void;
  onStartSpecificExam: (exam: Exam) => void;
  onCreateExam: () => void;
  onDeleteCustomExam: (examId: string) => void;
}

export default function ExamCatalog({
  totalOfficialCount,
  mathCount,
  vietnameseCount,
  customExams,
  selectedSubject,
  onSelectSubject,
  onStartExamFromBank,
  onStartSpecificExam,
  onCreateExam,
  onDeleteCustomExam,
}: ExamCatalogProps) {
  const subjectChoices: Array<{
    id: SubjectId | 'all';
    title: string;
    subtitle: string;
    countLabel: string;
    icon: typeof Shuffle;
  }> = [
    {
      id: 'all',
      title: 'Tất cả 2 môn (Ngẫu nhiên)',
      subtitle: 'Chọn ngẫu nhiên từ kho 100 đề Toán Cộng Trừ & Tiếng Việt',
      countLabel: `${totalOfficialCount} đề thi`,
      icon: Shuffle,
    },
    {
      id: 'toan',
      title: 'Toán Lớp 1 (Phép cộng & Phép trừ)',
      subtitle: 'Cộng trừ phạm vi 10, phạm vi 20, hình ảnh & lời văn',
      countLabel: `${mathCount} đề thi`,
      icon: Calculator,
    },
    {
      id: 'tieng-viet',
      title: 'Tiếng Việt Lớp 1',
      subtitle: 'Âm vần, chính tả, từ chỉ màu sắc & đọc hiểu đoạn văn',
      countLabel: `${vietnameseCount} đề thi`,
      icon: BookOpen,
    },
  ];

  const selectedLabel =
    selectedSubject === 'all'
      ? 'Ngẫu nhiên trong 100 đề'
      : getSubjectMeta(selectedSubject).shortName;

  return (
    <section id="exam-catalog" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Chọn môn học &amp; Bắt đầu vào thi
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Hệ thống sẵn sàng <strong className="text-slate-900">{totalOfficialCount} bộ đề thi</strong> chuẩn SGK (25 phút/đề), tự động bốc đề ngẫu nhiên mỗi lượt thi.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateExam}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-center shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tự tạo đề riêng</span>
          </button>
        </div>

        {/* Step 1: Select Subject */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            1. Chọn môn thi cho con
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label="Chọn môn học">
            {subjectChoices.map((choice) => {
              const Icon = choice.icon;
              const isSelected = selectedSubject === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectSubject(choice.id)}
                  className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-sky-600 ring-1 ring-sky-600'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" aria-hidden="true" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {choice.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{choice.subtitle}</p>
                    <p className="mt-2.5 text-xs font-semibold text-sky-700 tabular-nums">
                      {choice.countLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Big Start Exam Action */}
        <div className="mt-7 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            Môn đã chọn: <strong className="text-slate-900">{selectedLabel}</strong> · Thời gian:{' '}
            <strong className="text-slate-900">25 phút</strong> · Tự động trộn câu hỏi &amp; đáp án
          </div>

          <button
            type="button"
            onClick={() => onStartExamFromBank(selectedSubject)}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-5 h-5" aria-hidden="true" />
            <span>Bắt đầu vào thi</span>
          </button>
        </div>
      </div>

      {/* Compact Custom Exams Section (only shown when parent authored custom exams) */}
      {customExams.length > 0 && (
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Đề thi tự tạo ({customExams.length})
              </h3>
              <p className="text-xs text-slate-500">
                Các đề do phụ huynh tự soạn thêm cho bé ôn luyện
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {customExams
              .filter((e) => SUBJECTS.some((s) => s.id === e.subject))
              .map((exam) => (
                <div
                  key={exam.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{exam.title}</p>
                    <p className="text-xs text-slate-500 tabular-nums">
                      {getSubjectMeta(exam.subject).shortName} · {exam.questionCount} câu · 25 phút
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStartSpecificExam(exam)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Vào thi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCustomExam(exam.id)}
                      aria-label={`Xóa đề ${exam.title}`}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
