import { useState } from 'react';
import { BookOpen, Play, PlusCircle, Trophy } from 'lucide-react';

interface HeroSectionProps {
  onStartExamNow: () => void;
  onCreateExam: () => void;
  onViewLeaderboard: () => void;
}

const HERO_IMAGE = '/src/assets/images/hero_grade1_study_1794793714496.jpg';

export default function HeroSection({
  onStartExamNow,
  onCreateExam,
  onViewLeaderboard,
}: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-medium text-sky-700 mb-3">
              Toán (Phép cộng &amp; Phép trừ) &amp; Tiếng Việt Lớp 1 · Chuẩn SGK GDPT 2018
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-slate-900 leading-[1.15] text-balance">
              Ôn luyện Toán Cộng Trừ &amp; Tiếng Việt Lớp 1 tại nhà
            </h1>
            <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
              Ngân hàng 100 đề thi chuẩn sách giáo khoa mới nhất. Chọn môn học và bấm bắt đầu để
              vào thi 25 phút ngay, có hình ảnh minh họa, loa đọc đề bài và Giấy Khen tuyên dương
              khi bé đạt điểm cao.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStartExamNow}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>Bắt đầu vào thi</span>
              </button>
              <button
                type="button"
                onClick={onCreateExam}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>Tạo đề cho con</span>
              </button>
              <button
                type="button"
                onClick={onViewLeaderboard}
                className="inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-slate-600 hover:text-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>Bảng xếp hạng tuần</span>
              </button>
            </div>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-6">
            <div className="h-full min-h-[260px] lg:min-h-[340px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              {!imgError ? (
                <img
                  src={HERO_IMAGE}
                  alt="Góc học tập sáng sủa dành cho học sinh Lớp 1 với sách giáo khoa Toán, Tiếng Việt và bàn tính"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-sky-50 via-slate-50 to-amber-50">
                  <BookOpen className="w-12 h-12 text-sky-600 mb-3" aria-hidden="true" />
                  <p className="font-display text-lg font-semibold text-slate-800">
                    Không gian ôn luyện Lớp 1 tại nhà
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Chuẩn chương trình Toán (Phép cộng &amp; trừ) và Tiếng Việt Lớp 1
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
