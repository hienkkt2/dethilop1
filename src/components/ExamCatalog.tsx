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
      subtitle: 'Bốc ngẫu nhiên từ kho 100 đề Toán Cộng Trừ & Tiếng Việt',
      countLabel: `${totalOfficialCount} đề thi`,
      icon: Shuffle,
    },
    {
      id: 'toan',
      title: 'Toán Lớp 1 (Phép cộng & Phép trừ)',
      subtitle: 'Cộng trừ phạm vi 10 & 20, hình ảnh trực quan và lời văn',
      countLabel: `${mathCount} đề thi`,
      icon: Calculator,
    },
    {
      id: 'tieng-viet',
      title: 'Tiếng Việt Lớp 1',
      subtitle: 'Âm vần, chính tả, từ chỉ màu sắc và đọc hiểu đoạn văn',
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
      <div className="bg-white border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-amber-100">
          <div>
            <p className="text-xs font-semibold text-amber-700">
              Vòng thi Trực tuyến · Không cần đăng nhập
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-stone-900">
              Chọn môn thi &amp; Bắt đầu làm bài
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Ngân hàng <strong className="text-stone-900">{totalOfficialCount} bộ đề thi</strong> chuẩn SGK (25 phút/vòng), tự động bốc đề và đảo thứ tự câu hỏi.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateExam}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors self-start sm:self-center shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Tự tạo đề riêng</span>
          </button>
        </div>

        {/* Step 1: Select Subject */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-3">
            1. Chọn môn học dự thi
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
                      ? 'bg-emerald-50/70 border-emerald-700 ring-1 ring-emerald-700'
                      : 'bg-[#FFFDF9] border-amber-200/80 hover:border-amber-300 hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-stone-900">
                      {choice.title}
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 leading-relaxed">{choice.subtitle}</p>
                    <p className="mt-2.5 text-xs font-semibold text-emerald-800 tabular-nums">
                      {choice.countLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Big Start Exam Action */}
        <div className="mt-7 pt-6 border-t border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-stone-600">
            Môn đã chọn: <strong className="text-stone-900">{selectedLabel}</strong> · Thời gian:{' '}
            <strong className="text-stone-900">25 phút</strong> · Đạt từ 8 điểm nhận Giấy Khen Trạng Nguyên
          </div>

          <button
            type="button"
            onClick={() => onStartExamFromBank(selectedSubject)}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white bg-emerald-700 hover:bg-emerald-800 border-b-2 border-emerald-900 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-5 h-5" aria-hidden="true" />
            <span>Bắt đầu vào thi</span>
          </button>
        </div>
      </div>

      {/* Compact Custom Exams Section */}
      {customExams.length > 0 && (
        <div className="mt-8 bg-white border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-amber-100">
            <div>
              <h3 className="font-display text-lg font-bold text-stone-900">
                Đề thi gia đình tự tạo ({customExams.length})
              </h3>
              <p className="text-xs text-stone-500">
                Các đề do phụ huynh tự soạn thêm cho bé ôn luyện
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-amber-100">
            {customExams
              .filter((e) => SUBJECTS.some((s) => s.id === e.subject))
              .map((exam) => (
                <div
                  key={exam.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{exam.title}</p>
                    <p className="text-xs text-stone-500 tabular-nums">
                      {getSubjectMeta(exam.subject).shortName} · {exam.questionCount} câu · 25 phút
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onStartSpecificExam(exam)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Vào thi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCustomExam(exam.id)}
                      aria-label={`Xóa đề ${exam.title}`}
                      className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 rounded-lg cursor-pointer"
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
