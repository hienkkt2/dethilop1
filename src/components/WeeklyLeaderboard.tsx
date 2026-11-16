import { useMemo, useState } from 'react';
import { Award, Clock, Medal, Trophy } from 'lucide-react';
import {
  ExamAttempt,
  formatDurationMMSS,
  formatWeekLabel,
  getPreviousIsoWeekId,
  getSubjectMeta,
  getTrangNguyenHonor,
  LeaderboardEntry,
  SUBJECTS,
  SubjectId,
} from '../types/exam';

interface WeeklyLeaderboardProps {
  currentWeekId: string;
  selectedWeekId: string;
  onSelectWeekId: (weekId: string) => void;
  entries: LeaderboardEntry[];
  myAttempts: ExamAttempt[];
  onStartPractice: () => void;
}

export default function WeeklyLeaderboard({
  currentWeekId,
  selectedWeekId,
  onSelectWeekId,
  entries,
  myAttempts,
  onStartPractice,
}: WeeklyLeaderboardProps) {
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | 'all'>('all');

  const prevWeekId = useMemo(() => getPreviousIsoWeekId(new Date()), []);
  const weekOptions = useMemo(
    () => [
      { id: currentWeekId, label: `Tuần này · ${formatWeekLabel(currentWeekId)}` },
      { id: prevWeekId, label: `Tuần trước · ${formatWeekLabel(prevWeekId)}` },
    ],
    [currentWeekId, prevWeekId],
  );

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (entry.weekId !== selectedWeekId) return false;
      if (subjectFilter !== 'all' && entry.subject !== subjectFilter) return false;
      return true;
    });
  }, [entries, selectedWeekId, subjectFilter]);

  const topThree = filteredEntries.slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-amber-200">
          <div>
            <p className="text-xs font-semibold text-amber-700">
              Vinh danh sĩ tử xuất sắc hàng tuần
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-stone-900">
              Bảng Vàng Trạng Nguyên Lớp 1
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Ghi danh Trạng Nguyên Nhí, Bảng Nhãn, Thám Hoa dựa trên điểm số cao nhất và thời gian
              hoàn thành nhanh nhất mỗi tuần.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-amber-100/70 rounded-lg self-start md:self-auto">
            {weekOptions.map((wk) => {
              const active = selectedWeekId === wk.id;
              return (
                <button
                  key={wk.id}
                  type="button"
                  onClick={() => onSelectWeekId(wk.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    active ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {wk.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Filter Tabs */}
        <div className="mt-5 flex items-center gap-1 p-1 bg-amber-100/70 rounded-lg overflow-x-auto w-fit max-w-full">
          <button
            type="button"
            onClick={() => setSubjectFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
              subjectFilter === 'all' ? 'bg-white text-emerald-900 shadow-sm' : 'text-stone-600'
            }`}
          >
            Tất cả môn
          </button>
          {SUBJECTS.map((subj) => (
            <button
              key={subj.id}
              type="button"
              onClick={() => setSubjectFilter(subj.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
                subjectFilter === subj.id
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {subj.shortName}
            </button>
          ))}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="mt-8 bg-white border border-amber-200 rounded-2xl p-10 text-center">
            <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-display text-lg font-semibold text-stone-900">
              Chưa có sĩ tử nào ghi danh trong {formatWeekLabel(selectedWeekId)}
            </h3>
            <p className="mt-1 text-sm text-stone-600">
              Bé hãy hoàn thành một vòng thi 25 phút để tự động ghi tên lên Bảng Vàng tuần này nhé.
            </p>
            <button
              type="button"
              onClick={onStartPractice}
              className="mt-5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer"
            >
              Vào thi Trạng Nguyên ngay
            </button>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Spotlight */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {topThree.map((entry, idx) => {
                const rank = idx + 1;
                const subjMeta = getSubjectMeta(entry.subject);
                const honor = getTrangNguyenHonor(entry.score);
                const rankStyle =
                  rank === 1
                    ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-white'
                    : rank === 2
                      ? 'border-emerald-300 bg-gradient-to-b from-emerald-50/50 to-white'
                      : 'border-orange-200 bg-gradient-to-b from-orange-50/40 to-white';

                return (
                  <div
                    key={entry.id}
                    className={`border rounded-2xl p-5 flex flex-col justify-between ${rankStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800">
                          {rank === 1 ? (
                            <Trophy className="w-4 h-4 text-amber-600" aria-hidden="true" />
                          ) : (
                            <Medal className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                          )}
                          <span>
                            Hạng {rank} · {honor.rankTitle}
                          </span>
                        </span>
                        <span className="text-xs text-stone-500">{subjMeta.shortName}</span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold text-stone-900 truncate">
                        {entry.studentName}
                      </h3>
                      <p className="mt-1 text-xs text-stone-600 line-clamp-1">{entry.examTitle}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-amber-200/70 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-stone-500">Điểm số</p>
                        <p className="font-mono-nums text-2xl font-bold text-rose-700">
                          {entry.score.toFixed(1)}
                          <span className="text-xs font-medium text-stone-500"> / 10</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-500">Thời gian</p>
                        <p className="font-mono-nums text-sm font-semibold text-stone-800 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                          {formatDurationMMSS(entry.durationSecondsUsed)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Ranked Table */}
            <div className="mt-6 bg-white border border-amber-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-amber-200 bg-amber-50/70 text-xs font-semibold text-stone-700">
                      <th className="py-3.5 px-4 w-20">Hạng</th>
                      <th className="py-3.5 px-4">Thí sinh</th>
                      <th className="py-3.5 px-4">Danh hiệu</th>
                      <th className="py-3.5 px-4">Môn học</th>
                      <th className="py-3.5 px-4 text-right">Số câu đúng</th>
                      <th className="py-3.5 px-4 text-right">Thời gian</th>
                      <th className="py-3.5 px-4 text-right">Điểm số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 text-sm">
                    {filteredEntries.map((entry, idx) => (
                      <tr key={entry.id} className="hover:bg-amber-50/40">
                        <td className="py-3.5 px-4 font-mono-nums font-bold text-stone-900">
                          #{idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                          {entry.studentName}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-amber-800">
                          {getTrangNguyenHonor(entry.score).rankTitle}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {getSubjectMeta(entry.subject).shortName}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-nums text-stone-700">
                          {entry.correctCount}/{entry.totalQuestions}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-nums text-stone-700">
                          {formatDurationMMSS(entry.durationSecondsUsed)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-nums font-bold text-emerald-800">
                          {entry.score.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Practice History Section */}
      <div className="pt-4 border-t border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          <h3 className="font-display text-xl font-bold text-stone-900">
            Lịch sử các vòng thi của bé
          </h3>
        </div>

        {myAttempts.length === 0 ? (
          <p className="text-sm text-stone-500">
            Chưa có lượt thi nào được ghi lại trên thiết bị này.
          </p>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-amber-200 bg-amber-50/70 text-xs font-semibold text-stone-700">
                    <th className="py-3 px-4">Tuần</th>
                    <th className="py-3 px-4">Tên bé</th>
                    <th className="py-3 px-4">Bài thi</th>
                    <th className="py-3 px-4 text-right">Đúng</th>
                    <th className="py-3 px-4 text-right">Thời gian</th>
                    <th className="py-3 px-4 text-right">Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 text-sm">
                  {myAttempts.slice(0, 20).map((att) => (
                    <tr key={att.id}>
                      <td className="py-3 px-4 font-mono-nums text-xs text-stone-500">
                        {att.weekId}
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-800">{att.studentName}</td>
                      <td className="py-3 px-4 text-stone-700">{att.examTitle}</td>
                      <td className="py-3 px-4 text-right font-mono-nums text-stone-700">
                        {att.correctCount}/{att.totalQuestions}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums text-stone-700">
                        {formatDurationMMSS(att.durationSecondsUsed)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums font-bold text-emerald-800">
                        {att.score.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
