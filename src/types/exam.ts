export type SubjectId = 'toan' | 'tieng-viet';

export type TextbookSeriesId =
  | 'ket-noi-tri-thuc'
  | 'chan-troi-sang-tao'
  | 'canh-dieu'
  | 'tong-hop';

export type QuestionVisualSpec =
  | {
      kind: 'counting-addition';
      leftCount: number;
      rightCount: number;
      itemType: 'apple' | 'star' | 'flower' | 'cube';
      caption?: string;
    }
  | {
      kind: 'counting-subtraction';
      totalCount: number;
      crossedCount: number;
      itemType: 'apple' | 'star' | 'balloon' | 'cube';
      caption?: string;
    }
  | {
      kind: 'shapes';
      items: Array<{
        shape: 'triangle' | 'square' | 'circle' | 'rectangle';
        color: string;
        label?: string;
      }>;
      caption?: string;
    }
  | {
      kind: 'clock';
      hour: number;
      minute: number;
      caption?: string;
    }
  | {
      kind: 'ruler';
      lengthCm: number;
      objectType: 'pencil' | 'crayon' | 'ribbon';
      caption?: string;
    }
  | {
      kind: 'compare-groups';
      leftCount: number;
      rightCount: number;
      itemType: 'cube' | 'apple' | 'star';
      caption?: string;
    }
  | {
      kind: 'traffic-light';
      activeColor: 'red' | 'yellow' | 'green';
      caption?: string;
    }
  | {
      kind: 'color-swatch';
      colorHex: string;
      colorNameHint?: string;
      caption?: string;
    };

export interface Question {
  id: string;
  prompt: string;
  speechText?: string;
  options: [string, string, string, string];
  correctIndex: number; // 0 | 1 | 2 | 3
  explanation: string;
  curriculumTag: string;
  questionType?: string;
  visual?: QuestionVisualSpec;
}

export interface Exam {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  subject: SubjectId;
  textbookSeries: TextbookSeriesId;
  topic: string;
  durationMinutes: 25;
  questionCount: number;
  questions: Question[];
  isOfficial?: boolean;
  isRandomMix?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  subject: SubjectId;
  textbookSeries: TextbookSeriesId;
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationSecondsUsed: number;
  weekId: string;
  selectedAnswers: number[];
  submittedAt: number;
}

export interface LeaderboardEntry {
  id: string;
  attemptId: string;
  userId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  subject: SubjectId;
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationSecondsUsed: number;
  weekId: string;
  submittedAt: number;
}

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  shortName: string;
  description: string;
  imagePath?: string;
}

export interface TextbookMeta {
  id: TextbookSeriesId;
  name: string;
  shortName: string;
  publisher: string;
}

export const EXAM_DURATION_MINUTES = 25;
export const EXAM_DURATION_SECONDS = 25 * 60;

export const SUBJECTS: SubjectMeta[] = [
  {
    id: 'toan',
    name: 'Toán Lớp 1 (Phép cộng & Phép trừ)',
    shortName: 'Toán (Cộng & Trừ)',
    description:
      'Phép cộng và phép trừ qua hình ảnh trực quan, tính nhẩm phạm vi 10 & 20, điền số vào ô trống, so sánh phép tính và bài toán có lời văn.',
    imagePath: '/src/assets/images/subject_math_blocks_1794793715832.jpg',
  },
  {
    id: 'tieng-viet',
    name: 'Tiếng Việt Lớp 1',
    shortName: 'Tiếng Việt',
    description:
      'Âm vần thanh điệu, quy tắc chính tả c/k, g/gh, ng/ngh, ghép tiếng, từ chỉ sự vật/hoạt động và đọc hiểu đoạn văn ngắn.',
    imagePath: '/src/assets/images/subject_vietnamese_books_1794793714448.jpg',
  },
];

export const TEXTBOOK_SERIES: TextbookMeta[] = [
  {
    id: 'ket-noi-tri-thuc',
    name: 'Kết nối tri thức với cuộc sống',
    shortName: 'Kết nối tri thức',
    publisher: 'NXB Giáo dục Việt Nam',
  },
  {
    id: 'chan-troi-sang-tao',
    name: 'Chân trời sáng tạo',
    shortName: 'Chân trời sáng tạo',
    publisher: 'NXB Giáo dục Việt Nam',
  },
  {
    id: 'canh-dieu',
    name: 'Cánh diều',
    shortName: 'Cánh diều',
    publisher: 'NXB Đại học Sư phạm',
  },
  {
    id: 'tong-hop',
    name: 'Tổng hợp GDPT 2018',
    shortName: 'Tổng hợp 2018',
    publisher: 'Chuẩn Bộ GD&ĐT',
  },
];

export function getSubjectMeta(id: SubjectId): SubjectMeta {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0];
}

export function getTextbookMeta(id: TextbookSeriesId): TextbookMeta {
  return TEXTBOOK_SERIES.find((t) => t.id === id) ?? TEXTBOOK_SERIES[3];
}

export function getIsoWeekId(dateInput: Date = new Date()): string {
  const date = new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getPreviousIsoWeekId(dateInput: Date = new Date()): string {
  const prev = new Date(dateInput.getTime() - 7 * 24 * 60 * 60 * 1000);
  return getIsoWeekId(prev);
}

export function formatWeekLabel(weekId: string): string {
  const [year, week] = weekId.split('-W');
  return `Tuần ${Number(week)} (${year})`;
}

export function formatDurationMMSS(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDurationVietnamese(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  if (mins === 0) return `${secs} giây`;
  if (secs === 0) return `${mins} phút`;
  return `${mins} phút ${secs} giây`;
}

export function getTrangNguyenHonor(score: number): {
  rankTitle: string;
  certificatePhrase: string;
} {
  if (score >= 9.5) {
    return {
      rankTitle: 'TRẠNG NGUYÊN NHÍ',
      certificatePhrase: 'ĐẠT DANH HIỆU TRẠNG NGUYÊN NHÍ — XUẤT SẮC',
    };
  }
  if (score >= 9) {
    return {
      rankTitle: 'BẢNG NHÃN',
      certificatePhrase: 'ĐẠT DANH HIỆU BẢNG NHÃN — HOÀN THÀNH XUẤT SẮC',
    };
  }
  if (score >= 8) {
    return {
      rankTitle: 'THÁM HOA',
      certificatePhrase: 'ĐẠT DANH HIỆU THÁM HOA — HOÀN THÀNH TỐT',
    };
  }
  return {
    rankTitle: 'SĨ TỬ CHĂM NGOAN',
    certificatePhrase: 'SĨ TỬ CHĂM NGOAN',
  };
}
