import { useState } from 'react';
import { Menu, Shuffle, X } from 'lucide-react';

export type ActiveView = 'exams' | 'create' | 'leaderboard' | 'curriculum';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onQuickRandomExam: () => void;
  disabled?: boolean;
}

const NAV_ITEMS: { id: ActiveView; label: string }[] = [
  { id: 'exams', label: 'Luyện thi' },
  { id: 'create', label: 'Tạo đề thi' },
  { id: 'leaderboard', label: 'Bảng xếp hạng' },
  { id: 'curriculum', label: 'Chương trình SGK' },
];

export default function Navbar({
  activeView,
  onNavigate,
  onQuickRandomExam,
  disabled = false,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (view: ActiveView) => {
    if (disabled) return;
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('exams')}
          disabled={disabled}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 cursor-pointer disabled:cursor-not-allowed"
        >
          Bảng Vàng Lớp 1
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(item.id)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 ${
                  isActive ? 'text-sky-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[19px] h-0.5 bg-sky-600"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!disabled) onQuickRandomExam();
            }}
            disabled={disabled}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Thi ngẫu nhiên</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            disabled={disabled}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onQuickRandomExam();
                setMobileOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg"
            >
              <Shuffle className="w-4 h-4" />
              <span>Thi ngẫu nhiên 25 phút</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
