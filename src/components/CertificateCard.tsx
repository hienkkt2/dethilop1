import { Award, CheckCircle2, Download, Printer, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { downloadCertificatePng } from '../lib/certificateDownload';
import {
  formatDurationVietnamese,
  getSubjectMeta,
  getTextbookMeta,
  SubjectId,
  TextbookSeriesId,
} from '../types/exam';

interface CertificateCardProps {
  studentName: string;
  examTitle: string;
  subject: SubjectId;
  textbookSeries: TextbookSeriesId;
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationSecondsUsed: number;
  onReplayApplause: () => void;
}

export default function CertificateCard({
  studentName,
  examTitle,
  subject,
  textbookSeries,
  score,
  correctCount,
  totalQuestions,
  durationSecondsUsed,
  onReplayApplause,
}: CertificateCardProps) {
  const [downloaded, setDownloaded] = useState(false);

  const isExcellent = score >= 9;
  const honorTitle = isExcellent ? 'HOÀN THÀNH XUẤT SẮC' : 'HOÀN THÀNH TỐT';
  const subjectMeta = getSubjectMeta(subject);
  const textbookMeta = getTextbookMeta(textbookSeries);
  const todayLabel = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  const handleDownload = () => {
    const ok = downloadCertificatePng({
      studentName,
      examTitle,
      subject,
      textbookSeries,
      score,
      correctCount,
      totalQuestions,
      durationSecondsUsed,
    });
    if (ok) {
      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 3000);
    }
  };

  return (
    <div className="certificate-print-area bg-[#FFFDF7] border-2 border-amber-400 rounded-2xl p-3 sm:p-5 shadow-sm">
      <div className="border border-amber-300 rounded-xl px-5 py-7 sm:px-10 sm:py-9 relative bg-gradient-to-b from-amber-50/50 via-[#FFFDF7] to-amber-50/40">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center mb-3">
            <Award className="w-8 h-8 text-amber-700" aria-hidden="true" />
          </div>

          <p className="text-xs font-semibold tracking-widest uppercase text-amber-800">
            Bảng Vàng Lớp 1 · Khen Tặng Học Sinh Chăm Ngoan
          </p>

          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-wide text-rose-700">
            GIẤY KHEN
          </h2>

          <p className="mt-3 text-sm text-slate-600">Trân trọng tuyên dương em:</p>

          <p className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-slate-900 border-b-2 border-amber-300 pb-2 px-6">
            {studentName}
          </p>

          <p className="mt-4 text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed">
            Đã đạt danh hiệu{' '}
            <strong className="text-rose-700 font-bold">{honorTitle}</strong> trong bài thi trực
            tuyến môn <strong className="text-slate-900">{subjectMeta.shortName}</strong> (
            {textbookMeta.shortName}).
          </p>

          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">{examTitle}</p>

          {/* Metrics Row */}
          <div className="mt-6 grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-xl py-4 px-4 bg-white/90 border border-amber-200 rounded-xl">
            <div>
              <p className="text-xs text-slate-500">Điểm số</p>
              <p className="mt-0.5 font-mono-nums text-xl sm:text-2xl font-bold text-rose-700">
                {score.toFixed(1)} / 10
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Số câu đúng</p>
              <p className="mt-0.5 font-mono-nums text-xl sm:text-2xl font-bold text-slate-900">
                {correctCount}/{totalQuestions}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Thời gian làm</p>
              <p className="mt-0.5 text-sm sm:text-base font-semibold text-slate-800 pt-1">
                {formatDurationVietnamese(durationSecondsUsed)}
              </p>
            </div>
          </div>

          <div className="mt-6 w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-amber-200/80 text-xs text-slate-600">
            <span>Ngày cấp: {todayLabel}</span>
            <span className="font-semibold text-amber-900">
              Chứng nhận thành tích ôn luyện Lớp 1
            </span>
          </div>

          {/* Action Buttons (hidden when printing) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>{downloaded ? 'Đã tải giấy khen (.png)' : 'Tải giấy khen về'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>In giấy khen</span>
            </button>
            <button
              type="button"
              onClick={onReplayApplause}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>Phát lại tiếng vỗ tay</span>
            </button>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Thành tích đáng khen ngợi!</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
