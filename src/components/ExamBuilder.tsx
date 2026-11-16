import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  Image as ImageIcon,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { CURRICULUM_QUESTION_BANK } from '../data/curriculumGrade1';
import {
  Exam,
  getSubjectMeta,
  Question,
  QuestionVisualSpec,
  SUBJECTS,
  SubjectId,
  TEXTBOOK_SERIES,
  TextbookSeriesId,
} from '../types/exam';
import QuestionVisual from './QuestionVisual';

interface ExamBuilderProps {
  onPublishExam: (exam: Exam) => void;
  onCancel: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

type VisualPresetType =
  | 'none'
  | 'counting-addition'
  | 'counting-subtraction'
  | 'color-swatch';

export default function ExamBuilder({ onPublishExam, onCancel }: ExamBuilderProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectId>('toan');
  const [textbookSeries, setTextbookSeries] = useState<TextbookSeriesId>('ket-noi-tri-thuc');
  const [topic, setTopic] = useState('Ôn tập cho bé ở nhà · Lớp 1');
  const [questions, setQuestions] = useState<Question[]>([]);

  const [builderMode, setBuilderMode] = useState<'bank' | 'custom'>('bank');
  const [bankSubjectFilter, setBankSubjectFilter] = useState<SubjectId | 'all'>('toan');

  // Custom question editor state
  const [qPrompt, setQPrompt] = useState('');
  const [qOptions, setQOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState('');
  const [qTag, setQTag] = useState('Kiến thức SGK Lớp 1');

  // Optional visual builder state
  const [visualType, setVisualType] = useState<VisualPresetType>('none');
  const [leftCount, setLeftCount] = useState(3);
  const [rightCount, setRightCount] = useState(4);
  const [subTotalCount, setSubTotalCount] = useState(8);
  const [subCrossedCount, setSubCrossedCount] = useState(3);
  const [swatchHex, setSwatchHex] = useState('#EF4444');

  const [customError, setCustomError] = useState('');
  const [publishError, setPublishError] = useState('');

  const addedIds = useMemo(() => new Set(questions.map((q) => q.id)), [questions]);

  const filteredBank = useMemo(() => {
    return CURRICULUM_QUESTION_BANK.filter((item) => {
      if (bankSubjectFilter !== 'all' && item.subject !== bankSubjectFilter) return false;
      return true;
    });
  }, [bankSubjectFilter]);

  const previewVisual = useMemo((): QuestionVisualSpec | undefined => {
    if (visualType === 'counting-addition') {
      return {
        kind: 'counting-addition',
        leftCount,
        rightCount,
        itemType: 'apple',
        caption: 'Đếm số quả táo ở hai nhóm',
      };
    }
    if (visualType === 'counting-subtraction') {
      return {
        kind: 'counting-subtraction',
        totalCount: subTotalCount,
        crossedCount: Math.min(subTotalCount, subCrossedCount),
        itemType: 'star',
        caption: 'Đếm số ngôi sao còn lại không bị gạch chéo',
      };
    }
    if (visualType === 'color-swatch') {
      return {
        kind: 'color-swatch',
        colorHex: swatchHex,
        caption: 'Quan sát ô màu sắc',
      };
    }
    return undefined;
  }, [visualType, leftCount, rightCount, subTotalCount, subCrossedCount, swatchHex]);

  const handleAddFromBank = (item: Question) => {
    if (addedIds.has(item.id)) return;
    if (questions.length >= 30) {
      setPublishError('Mỗi đề thi tối đa 30 câu hỏi.');
      return;
    }
    setPublishError('');
    setQuestions((prev) => [...prev, item]);
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (qPrompt.trim().length < 4) {
      setCustomError('Vui lòng nhập nội dung câu hỏi (ít nhất 4 ký tự).');
      return;
    }
    if (qOptions.some((o) => o.trim().length === 0)) {
      setCustomError('Vui lòng điền đủ 4 đáp án A, B, C, D.');
      return;
    }
    if (qExplanation.trim().length < 4) {
      setCustomError('Vui lòng viết lời giải thích ngắn để bé xem khi nộp bài.');
      return;
    }
    if (questions.length >= 30) {
      setCustomError('Mỗi đề thi tối đa 30 câu hỏi.');
      return;
    }

    const newQ: Question = {
      id: `custom_${Date.now()}_${questions.length + 1}`,
      prompt: qPrompt.trim(),
      options: [
        qOptions[0].trim(),
        qOptions[1].trim(),
        qOptions[2].trim(),
        qOptions[3].trim(),
      ],
      correctIndex: qCorrectIndex,
      explanation: qExplanation.trim(),
      curriculumTag: qTag.trim() || 'Chuẩn SGK Lớp 1',
      questionType: previewVisual ? 'Bài tập hình ảnh' : 'Câu hỏi tự soạn',
      visual: previewVisual,
    };

    setQuestions((prev) => [...prev, newQ]);
    setQPrompt('');
    setQOptions(['', '', '', '']);
    setQCorrectIndex(0);
    setQExplanation('');
    setVisualType('none');
    setCustomError('');
    setPublishError('');
  };

  const handleMoveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    if (title.trim().length < 3) {
      setPublishError('Tên đề thi cần dài ít nhất 3 ký tự.');
      return;
    }
    if (topic.trim().length < 2) {
      setPublishError('Vui lòng nhập chủ đề hoặc học kì của đề thi.');
      return;
    }
    if (questions.length === 0) {
      setPublishError('Vui lòng thêm ít nhất 1 câu hỏi vào đề thi trước khi lưu.');
      return;
    }

    setPublishError('');
    const newExam: Exam = {
      id: `custom_exam_${Date.now()}`,
      creatorId: 'parent-local',
      creatorName: 'Phụ huynh tự tạo',
      title: title.trim(),
      subject,
      textbookSeries,
      topic: topic.trim(),
      durationMinutes: 25,
      questionCount: questions.length,
      questions,
      isOfficial: false,
      createdAt: Date.now(),
    };
    onPublishExam(newExam);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Tạo bài thi Lớp 1 cho con ôn luyện
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Không cần đăng nhập — ghép nhanh câu hỏi từ ngân hàng SGK (có câu hình ảnh) hoặc tự
            soạn đề riêng và lưu ngay trên máy.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer self-start md:self-auto"
        >
          Quay lại kho đề thi
        </button>
      </div>

      {/* Exam Metadata Card */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-display text-base font-semibold text-slate-900 mb-4">
          01. Thông tin chung của bài thi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label htmlFor="exam-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên đề thi
            </label>
            <input
              id="exam-title"
              type="text"
              maxLength={140}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Đề ôn Toán & Hình ảnh cuối tuần cho bé"
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label htmlFor="exam-subject" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Môn học
            </label>
            <select
              id="exam-subject"
              value={subject}
              onChange={(e) => {
                const next = e.target.value as SubjectId;
                setSubject(next);
                setBankSubjectFilter(next);
              }}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="exam-tb" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bộ sách giáo khoa
            </label>
            <select
              id="exam-tb"
              value={textbookSeries}
              onChange={(e) => setTextbookSeries(e.target.value as TextbookSeriesId)}
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {TEXTBOOK_SERIES.map((tb) => (
                <option key={tb.id} value={tb.id}>
                  {tb.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="exam-topic" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chủ đề / Phạm vi kiến thức
            </label>
            <input
              id="exam-topic"
              type="text"
              maxLength={120}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Phép cộng phạm vi 20 và xem đồng hồ"
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <p className="block text-xs font-semibold text-slate-700 mb-1.5">Thời gian làm bài</p>
            <div className="px-3.5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg tabular-nums">
              25 phút (Mặc định)
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Question Builder & Preview */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <h3 className="font-display text-base font-semibold text-slate-900">
              02. Thêm câu hỏi vào bài thi
            </h3>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setBuilderMode('bank')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  builderMode === 'bank' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Ngân hàng SGK Lớp 1
              </button>
              <button
                type="button"
                onClick={() => setBuilderMode('custom')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  builderMode === 'custom' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Tự soạn (có hình ảnh)
              </button>
            </div>
          </div>

          {builderMode === 'bank' ? (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setBankSubjectFilter('all')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
                    bankSubjectFilter === 'all'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả
                </button>
                {SUBJECTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setBankSubjectFilter(s.id)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
                      bankSubjectFilter === s.id
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.shortName}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {filteredBank.map((item) => {
                  const alreadyAdded = addedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                          <span>{getSubjectMeta(item.subject).shortName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.curriculumTag}</span>
                          {item.visual && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-sky-700 font-semibold">
                                <ImageIcon className="w-3 h-3" aria-hidden="true" />
                                Có hình ảnh
                              </span>
                            </>
                          )}
                        </p>
                        <p className="text-sm font-medium text-slate-900">{item.prompt}</p>
                        <p className="text-xs text-emerald-700 font-medium">
                          Đáp án đúng: {OPTION_LETTERS[item.correctIndex]}.{' '}
                          {item.options[item.correctIndex]}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => handleAddFromBank(item)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer disabled:cursor-default ${
                          alreadyAdded
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-white text-sky-700 border border-sky-200 hover:bg-sky-50'
                        }`}
                      >
                        {alreadyAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Đã thêm</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Thêm vào đề</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddCustomQuestion} className="mt-5 space-y-4">
              <div>
                <label htmlFor="q-tag" className="block text-xs font-semibold text-slate-700 mb-1">
                  Chủ đề nhỏ (tùy chọn)
                </label>
                <input
                  id="q-tag"
                  type="text"
                  maxLength={80}
                  value={qTag}
                  onChange={(e) => setQTag(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Optional Visual Attachment */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <label
                    htmlFor="q-visual-type"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Đính kèm hình minh họa (tùy chọn)
                  </label>
                  <select
                    id="q-visual-type"
                    value={visualType}
                    onChange={(e) => setVisualType(e.target.value as VisualPresetType)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="none">Không đính kèm hình ảnh (Chỉ văn bản)</option>
                    <option value="counting-addition">Hình ảnh Toán: Đếm nhóm quả táo (Phép cộng)</option>
                    <option value="counting-subtraction">Hình ảnh Toán: Gạch bớt ngôi sao (Phép trừ)</option>
                    <option value="color-swatch">Hình ảnh Tiếng Việt: Ô màu sắc nhận biết</option>
                  </select>
                </div>

                {visualType === 'counting-addition' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Số táo bên trái (1–8)</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={leftCount}
                        onChange={(e) => setLeftCount(Math.min(8, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Số táo bên phải (1–8)</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={rightCount}
                        onChange={(e) => setRightCount(Math.min(8, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {visualType === 'counting-subtraction' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Tổng số ngôi sao (2–12)</label>
                      <input
                        type="number"
                        min={2}
                        max={12}
                        value={subTotalCount}
                        onChange={(e) => setSubTotalCount(Math.min(12, Math.max(2, Number(e.target.value) || 2)))}
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Số ngôi sao gạch bớt</label>
                      <input
                        type="number"
                        min={1}
                        max={subTotalCount}
                        value={subCrossedCount}
                        onChange={(e) =>
                          setSubCrossedCount(
                            Math.min(subTotalCount, Math.max(1, Number(e.target.value) || 1)),
                          )
                        }
                        className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {visualType === 'color-swatch' && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Chọn màu sắc</label>
                    <select
                      value={swatchHex}
                      onChange={(e) => setSwatchHex(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="#EF4444">Màu đỏ thắm</option>
                      <option value="#3B82F6">Màu xanh dương</option>
                      <option value="#22C55E">Màu xanh lá tươi</option>
                      <option value="#FACC15">Màu vàng rực</option>
                    </select>
                  </div>
                )}

                {previewVisual && <QuestionVisual visual={previewVisual} />}
              </div>

              <div>
                <label htmlFor="q-prompt" className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung câu hỏi
                </label>
                <textarea
                  id="q-prompt"
                  rows={3}
                  maxLength={400}
                  value={qPrompt}
                  onChange={(e) => setQPrompt(e.target.value)}
                  placeholder="Nhập câu hỏi dành cho bé Lớp 1..."
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-700">
                  4 lựa chọn &amp; chọn đáp án đúng
                </p>
                {OPTION_LETTERS.map((letter, idx) => (
                  <div key={letter} className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="correct-option"
                      id={`correct-${idx}`}
                      checked={qCorrectIndex === idx}
                      onChange={() => setQCorrectIndex(idx)}
                      className="w-4 h-4 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <label
                      htmlFor={`correct-${idx}`}
                      className="font-mono-nums text-xs font-bold text-slate-700 w-5 cursor-pointer"
                    >
                      {letter}.
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={qOptions[idx]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQOptions((prev) => {
                          const next = [...prev] as [string, string, string, string];
                          next[idx] = val;
                          return next;
                        });
                      }}
                      placeholder={`Nhập phương án ${letter}`}
                      className="flex-1 px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label
                  htmlFor="q-explanation"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Lời giải thích chi tiết (hiện sau khi nộp bài)
                </label>
                <textarea
                  id="q-explanation"
                  rows={2}
                  maxLength={500}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="Giải thích ngắn gọn, dễ hiểu vì sao đáp án đó đúng..."
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {customError && <p className="text-xs font-medium text-rose-600">{customError}</p>}

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Thêm câu hỏi này vào đề</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Selected Questions Preview & Save */}
        <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 lg:sticky lg:top-20">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-display text-base font-semibold text-slate-900">
              03. Cấu trúc đề thi ({questions.length}/30 câu)
            </h3>
            {questions.length > 0 && (
              <button
                type="button"
                onClick={() => setQuestions([])}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {questions.length === 0 ? (
            <div className="py-10 text-center">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-700">Chưa có câu hỏi nào</p>
              <p className="mt-1 text-xs text-slate-500">
                Chọn câu hỏi từ Ngân hàng SGK bên trái hoặc tự soạn câu hỏi (có hình ảnh).
              </p>
            </div>
          ) : (
            <ol className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <li
                  key={q.id}
                  className="p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-start justify-between gap-2"
                >
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-slate-900">
                      <span className="font-mono-nums text-sky-700 mr-1.5">Câu {idx + 1}.</span>
                      {q.prompt}
                    </p>
                    <p className="text-emerald-700 font-medium">
                      Đúng: {OPTION_LETTERS[q.correctIndex]}. {q.options[q.correctIndex]}
                      {q.visual ? ' · Có hình minh họa' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveQuestion(idx, -1)}
                      aria-label="Di chuyển lên"
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === questions.length - 1}
                      onClick={() => handleMoveQuestion(idx, 1)}
                      aria-label="Di chuyển xuống"
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      aria-label="Xóa câu hỏi"
                      className="p-1 text-slate-500 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {publishError && <p className="mt-4 text-xs font-medium text-rose-600">{publishError}</p>}

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePublish}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>Lưu bài thi ngay (25 phút)</span>
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
