import { useMemo, useState } from 'react';
import { Award, Clock, Medal, Trophy } from 'lucide-react';
import {
  ExamAttempt,
  formatDurationMMSS,
  formatWeekLabel,
  getPreviousIsoWeekId,
  getSubjectMeta,
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Bảng xếp hạng thành tích hàng tuần
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ghi nhận điểm số cao nhất và thời gian hoàn thành nhanh nhất mỗi tuần cho bé ôn
              luyện tại nhà.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
            {weekOptions.map((wk) => {
              const active = selectedWeekId === wk.id;
              return (
                <button
                  key={wk.id}
                  type="button"
                  onClick={() => onSelectWeekId(wk.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {wk.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Filter Tabs */}
        <div className="mt-5 flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto w-fit max-w-full">
          <button
            type="button"
            onClick={() => setSubjectFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
              subjectFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
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
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {subj.shortName}
            </button>
          ))}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="mt-8 bg-white border border-slate-200 rounded-xl p-10 text-center">
            <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" aria-hidden="true" />
            <h3 className="font-display text-lg font-semibold text-slate-900">
              Chưa có lượt thi nào trong {formatWeekLabel(selectedWeekId)}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Bé hãy hoàn thành một bài thi 25 phút để tự động ghi tên lên Bảng Vàng tuần này nhé.
            </p>
            <button
              type="button"
              onClick={onStartPractice}
              className="mt-5 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
            >
              Làm bài thi ngay
            </button>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Spotlight */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {topThree.map((entry, idx) => {
                const rank = idx + 1;
                const subjMeta = getSubjectMeta(entry.subject);
                const rankStyle =
                  rank === 1
                    ? 'border-amber-300 bg-amber-50/40'
                    : rank === 2
                      ? 'border-slate-300 bg-slate-50/60'
                      : 'border-orange-200 bg-orange-50/30';

                return (
                  <div
                    key={entry.id}
                    className={`border rounded-xl p-5 flex flex-col justify-between ${rankStyle}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          {rank === 1 ? (
                            <Trophy className="w-4 h-4 text-amber-600" aria-hidden="true" />
                          ) : (
                            <Medal className="w-4 h-4 text-slate-600" aria-hidden="true" />
                          )}
                          <span>Hạng {rank}</span>
                        </span>
                        <span className="text-xs text-slate-500">{subjMeta.shortName}</span>
                      </div>

                      <h3 className="mt-2 font-display text-xl font-bold text-slate-900 truncate">
                        {entry.studentName}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-1">{entry.examTitle}</p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Điểm số</p>
                        <p className="font-mono-nums text-2xl font-bold text-sky-700">
                          {entry.score.toFixed(1)}
                          <span className="text-xs font-medium text-slate-500"> / 10</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Thời gian</p>
                        <p className="font-mono-nums text-sm font-semibold text-slate-800 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                          {formatDurationMMSS(entry.durationSecondsUsed)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Ranked Table */}
            <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="py-3.5 px-4 w-20">Hạng</th>
                      <th className="py-3.5 px-4">Học sinh</th>
                      <th className="py-3.5 px-4">Môn học</th>
                      <th className="py-3.5 px-4">Đề thi</th>
                      <th className="py-3.5 px-4 text-right">Số câu đúng</th>
                      <th className="py-3.5 px-4 text-right">Thời gian</th>
                      <th className="py-3.5 px-4 text-right">Điểm số</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredEntries.map((entry, idx) => (
                      <tr key={entry.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-mono-nums font-bold text-slate-900">
                          #{idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {entry.studentName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {getSubjectMeta(entry.subject).shortName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {entry.examTitle}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-nums text-slate-700">
                          {entry.correctCount}/{entry.totalQuestions}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-nums text-slate-700">
                          {formatDurationMMSS(entry.durationSecondsUsed)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono-nums font-bold text-sky-700">
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
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-sky-600" aria-hidden="true" />
          <h3 className="font-display text-xl font-bold text-slate-900">
            Lịch sử các lượt làm bài của bé
          </h3>
        </div>

        {myAttempts.length === 0 ? (
          <p className="text-sm text-slate-500">
            Chưa có lượt làm bài nào được ghi lại trên thiết bị này.
          </p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Tuần</th>
                    <th className="py-3 px-4">Tên bé</th>
                    <th className="py-3 px-4">Bài thi</th>
                    <th className="py-3 px-4 text-right">Đúng</th>
                    <th className="py-3 px-4 text-right">Thời gian</th>
                    <th className="py-3 px-4 text-right">Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {myAttempts.slice(0, 20).map((att) => (
                    <tr key={att.id}>
                      <td className="py-3 px-4 font-mono-nums text-xs text-slate-500">
                        {att.weekId}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{att.studentName}</td>
                      <td className="py-3 px-4 text-slate-700">{att.examTitle}</td>
                      <td className="py-3 px-4 text-right font-mono-nums text-slate-700">
                        {att.correctCount}/{att.totalQuestions}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums text-slate-700">
                        {formatDurationMMSS(att.durationSecondsUsed)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums font-bold text-sky-700">
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
