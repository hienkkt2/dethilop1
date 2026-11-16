import { ArrowRight, BookMarked } from 'lucide-react';
import { CURRICULUM_GUIDES } from '../data/curriculumGrade1';
import { getSubjectMeta, getTextbookMeta, SubjectId } from '../types/exam';

interface CurriculumGuideProps {
  onPracticeSubject: (subject: SubjectId) => void;
}

export default function CurriculumGuide({ onPracticeSubject }: CurriculumGuideProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="pb-6 border-b border-amber-200">
        <h2 className="font-display text-2xl font-bold text-stone-900">
          Chương trình ôn thi Trạng Nguyên Lớp 1 (GDPT 2018)
        </h2>
        <p className="mt-1.5 text-sm text-stone-600 max-w-3xl">
          Nội dung câu hỏi trong ngân hàng 100 đề thi bám sát 3 bộ sách giáo khoa hiện hành:
          Kết nối tri thức với cuộc sống, Chân trời sáng tạo và Cánh diều.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {CURRICULUM_GUIDES.map((guide, index) => {
          const subjectMeta = getSubjectMeta(guide.subject);
          const textbookMeta = getTextbookMeta(guide.textbookSeries);
          return (
            <div
              key={guide.subject}
              className="bg-white border border-amber-200 rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-amber-800">
                    0{index + 1}. {textbookMeta.shortName} · {guide.termLabel}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-stone-900">
                    {subjectMeta.name}
                  </h3>
                </div>
                <BookMarked className="w-5 h-5 text-emerald-700 shrink-0 mt-1" aria-hidden="true" />
              </div>

              <p className="mt-2 text-sm text-stone-600">{subjectMeta.description}</p>

              <ul className="mt-4 space-y-2 border-t border-amber-100 pt-4 text-sm text-stone-700">
                {guide.units.map((unit) => (
                  <li key={unit} className="flex items-start gap-2.5">
                    <span className="text-emerald-700 font-semibold mt-0.5" aria-hidden="true">
                      •
                    </span>
                    <span>{unit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-5">
                <button
                  type="button"
                  onClick={() => onPracticeSubject(guide.subject)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                >
                  <span>Thi thử {subjectMeta.shortName}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
