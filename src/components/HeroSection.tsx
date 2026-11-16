import { useState } from 'react';
import { Award, Play, PlusCircle, Trophy } from 'lucide-react';

interface HeroSectionProps {
  onStartExamNow: () => void;
  onCreateExam: () => void;
  onViewLeaderboard: () => void;
}

const HERO_IMAGE = '/src/assets/images/trang_nguyen_hero_1794800229217.jpg';

export default function HeroSection({
  onStartExamNow,
  onCreateExam,
  onViewLeaderboard,
}: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="border-b border-amber-200/80 bg-[#FFFDF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-semibold text-emerald-800 mb-3">
              Sân chơi Trạng Nguyên Lớp 1 · Toán Cộng Trừ &amp; Tiếng Việt SGK 2018
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-stone-900 leading-[1.15] text-balance">
              Thi Trạng Nguyên Lớp 1 trực tuyến tại nhà
            </h1>
            <p className="mt-4 text-base text-stone-600 leading-relaxed max-w-xl">
              Ngân hàng 100 đề thi chuẩn sách giáo khoa mới theo phong cách Trạng Nguyên Edu. Bé
              nhập tên vào phòng thi 25 phút với hình ảnh trực quan, loa đọc đề chuẩn tiếng Việt,
              hiệu ứng âm thanh vui nhộn và nhận Giấy Khen ghi danh Bảng Vàng.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStartExamNow}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 border-b-2 border-emerald-900 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>Vào thi Trạng Nguyên</span>
              </button>
              <button
                type="button"
                onClick={onCreateExam}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-stone-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-700" aria-hidden="true" />
                <span>Tạo đề cho con</span>
              </button>
              <button
                type="button"
                onClick={onViewLeaderboard}
                className="inline-flex items-center gap-1.5 px-3 py-3 text-sm font-semibold text-amber-800 hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>Bảng Vàng tuần</span>
              </button>
            </div>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-6">
            <div className="h-full min-h-[260px] lg:min-h-[340px] rounded-2xl overflow-hidden border border-amber-200 bg-amber-50">
              {!imgError ? (
                <img
                  src={HERO_IMAGE}
                  alt="Minh họa sân trường Trạng Nguyên Lớp 1 với lũy tre xanh, hồ sen, bàn tính và sách giáo khoa"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-50">
                  <Award className="w-12 h-12 text-emerald-700 mb-3" aria-hidden="true" />
                  <p className="font-display text-lg font-semibold text-stone-800">
                    Sân thi Trạng Nguyên Lớp 1 tại nhà
                  </p>
                  <p className="text-sm text-stone-600 mt-1">
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
