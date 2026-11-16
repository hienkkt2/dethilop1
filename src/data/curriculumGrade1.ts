import {
  Exam,
  getSubjectMeta,
  getTextbookMeta,
  Question,
  SubjectId,
  TextbookSeriesId,
} from '../types/exam';

export interface CurriculumQuestionItem extends Question {
  subject: SubjectId;
  textbookSeries: TextbookSeriesId;
}

export interface CurriculumTopicGuide {
  subject: SubjectId;
  textbookSeries: TextbookSeriesId;
  termLabel: string;
  units: string[];
}

export const CURRICULUM_GUIDES: CurriculumTopicGuide[] = [
  {
    subject: 'toan',
    textbookSeries: 'ket-noi-tri-thuc',
    termLabel: 'Trọng tâm Phép cộng & Phép trừ',
    units: [
      'Đếm gộp hai nhóm đồ vật qua hình ảnh để làm phép cộng',
      'Đếm số còn lại sau khi gạch bớt qua hình ảnh để làm phép trừ',
      'Phép cộng và phép trừ trong phạm vi 10 (bao gồm số 0)',
      'Điền số còn thiếu vào ô trống trong phép cộng và phép trừ',
      'So sánh kết quả hai phép cộng / phép trừ bằng dấu >, <, =',
      'Phép cộng, trừ không nhớ trong phạm vi 20 và bài toán có lời văn',
    ],
  },
  {
    subject: 'tieng-viet',
    textbookSeries: 'ket-noi-tri-thuc',
    termLabel: 'Âm vần, Chính tả & Đọc hiểu',
    units: [
      'Nhận diện âm, chữ cái và 6 thanh điệu tiếng Việt',
      'Quy tắc chính tả c/k, g/gh, ng/ngh và phân biệt s/x, tr/ch, l/n, r/d/gi',
      'Ghép vần có âm đệm và âm cuối (oa, oai, iên, ươi, ươn...)',
      'Đọc hiểu đoạn văn ngắn, câu thơ về gia đình và trường học',
      'Nhận biết từ chỉ sự vật, hoạt động, màu sắc và sắp xếp câu',
    ],
  },
];

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray<T>(input: T[], rng: () => number = Math.random): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildNumberOptions(
  answer: number,
  minVal = 0,
  maxVal = 20,
  rng: () => number = Math.random,
): [string, string, string, string] {
  const set = new Set<number>([answer]);
  const candidates = shuffleArray(
    [
      answer + 1,
      answer - 1,
      answer + 2,
      answer - 2,
      answer + 3,
      answer - 3,
      answer + 4,
    ],
    rng,
  );
  for (const c of candidates) {
    if (set.size >= 4) break;
    if (c >= minVal && c <= maxVal && !set.has(c)) {
      set.add(c);
    }
  }
  while (set.size < 4) {
    const rnd = Math.floor(rng() * (maxVal - minVal + 1)) + minVal;
    set.add(rnd);
  }
  const arr = shuffleArray(Array.from(set), rng).map((n) => String(n));
  return [arr[0], arr[1], arr[2], arr[3]];
}

function makeNumericQuestion(
  id: string,
  prompt: string,
  answer: number,
  explanation: string,
  curriculumTag: string,
  questionType: string,
  visual?: Question['visual'],
  unitLabel?: string,
  maxRange = 20,
  rng: () => number = Math.random,
): Question {
  const rawOptions = buildNumberOptions(answer, 0, maxRange, rng);
  const options = rawOptions.map((o) => (unitLabel ? `${o} ${unitLabel}` : o)) as [
    string,
    string,
    string,
    string,
  ];
  const answerText = unitLabel ? `${answer} ${unitLabel}` : String(answer);
  const correctIndex = options.indexOf(answerText);

  return {
    id,
    prompt,
    options,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    explanation,
    curriculumTag,
    questionType,
    visual,
  };
}

export function generateDynamicMathQuestions(
  count = 10,
  rangeMode: 'within10' | 'within20' | 'mixed' = 'mixed',
  rng: () => number = Math.random,
  idPrefix = 'dyn_math',
): Question[] {
  const results: Question[] = [];
  const itemTypes: Array<'apple' | 'star' | 'flower' | 'cube'> = ['apple', 'star', 'flower', 'cube'];
  const subTypes: Array<'apple' | 'star' | 'balloon' | 'cube'> = ['apple', 'star', 'balloon', 'cube'];
  const itemNames: Record<'apple' | 'star' | 'flower' | 'cube' | 'balloon', string> = {
    apple: 'quả táo',
    star: 'ngôi sao',
    flower: 'bông hoa',
    cube: 'khối lập phương',
    balloon: 'quả bóng bay',
  };

  const wordStoriesAdd = [
    (a: number, b: number) => ({
      prompt: `Trên cành cây có ${a} con chim, có thêm ${b} con chim bay đến. Hỏi trên cành có tất cả mấy con chim?`,
      unit: 'con chim',
      explain: `Có thêm chim bay đến nên ta làm phép cộng: ${a} + ${b} = ${a + b} (con chim).`,
    }),
    (a: number, b: number) => ({
      prompt: `Bé có ${a} viên bi, anh cho bé thêm ${b} viên bi nữa. Hỏi bé có tất cả bao nhiêu viên bi?`,
      unit: 'viên bi',
      explain: `Số viên bi bé có tất cả là: ${a} + ${b} = ${a + b} (viên bi).`,
    }),
    (a: number, b: number) => ({
      prompt: `Trong rổ có ${a} quả cam, mẹ bỏ thêm ${b} quả cam vào rổ. Hỏi trong rổ có tất cả mấy quả cam?`,
      unit: 'quả cam',
      explain: `Tổng số quả cam trong rổ là: ${a} + ${b} = ${a + b} (quả cam).`,
    }),
  ];

  const wordStoriesSub = [
    (a: number, b: number) => ({
      prompt: `Lan có ${a} bông hoa, Lan tặng bạn ${b} bông hoa. Hỏi Lan còn lại mấy bông hoa?`,
      unit: 'bông hoa',
      explain: `Số bông hoa Lan còn lại là: ${a} - ${b} = ${a - b} (bông hoa).`,
    }),
    (a: number, b: number) => ({
      prompt: `Trên đĩa có ${a} chiếc bánh, bé đã ăn ${b} chiếc bánh. Hỏi trên đĩa còn lại mấy chiếc bánh?`,
      unit: 'chiếc bánh',
      explain: `Số chiếc bánh còn lại trên đĩa là: ${a} - ${b} = ${a - b} (chiếc bánh).`,
    }),
    (a: number, b: number) => ({
      prompt: `Trong hộp có ${a} bút chì màu, bé cho em mượn ${b} bút chì. Hỏi trong hộp còn lại mấy bút chì?`,
      unit: 'bút chì',
      explain: `Số bút chì còn lại trong hộp là: ${a} - ${b} = ${a - b} (bút chì).`,
    }),
  ];

  const usedPrompts = new Set<string>();
  let attempts = 0;

  while (results.length < count && attempts < count * 10) {
    attempts += 1;
    const idx = results.length;
    const modeCycle = idx % 7;
    const id = `${idPrefix}_${idx}_${attempts}`;

    const use20 =
      rangeMode === 'within20' || (rangeMode === 'mixed' && idx % 3 === 2);

    let q: Question;

    if (modeCycle === 0) {
      // Visual counting addition
      const a = 2 + Math.floor(rng() * 5);
      const b = 1 + Math.floor(rng() * (10 - a));
      const item = itemTypes[Math.floor(rng() * itemTypes.length)];
      const label = itemNames[item];
      q = makeNumericQuestion(
        id,
        `Quan sát hai nhóm hình bên dưới. Hỏi có tất cả bao nhiêu ${label}?`,
        a + b,
        `Nhóm bên trái có ${a} ${label}, nhóm bên phải có ${b} ${label}. Phép cộng: ${a} + ${b} = ${a + b} (${label}).`,
        'Phép cộng qua hình ảnh',
        'Cộng qua hình ảnh',
        {
          kind: 'counting-addition',
          leftCount: a,
          rightCount: b,
          itemType: item,
          caption: `Đếm tổng số ${label} ở cả hai bên`,
        },
        label,
        10,
        rng,
      );
    } else if (modeCycle === 1) {
      // Visual subtraction with crossed items
      const total = 5 + Math.floor(rng() * 6); // 5..10
      const crossed = 1 + Math.floor(rng() * (total - 1));
      const item = subTypes[Math.floor(rng() * subTypes.length)];
      const label = itemNames[item];
      q = makeNumericQuestion(
        id,
        `Có ${total} ${label} trong hình, đã gạch bớt ${crossed} ${label}. Hỏi còn lại mấy ${label}?`,
        total - crossed,
        `Lấy tổng số trừ đi số đã gạch bớt: ${total} - ${crossed} = ${total - crossed} (${label}).`,
        'Phép trừ gạch bớt',
        'Trừ qua hình ảnh',
        {
          kind: 'counting-subtraction',
          totalCount: total,
          crossedCount: crossed,
          itemType: item,
          caption: `Đếm số ${label} chưa bị gạch chéo`,
        },
        label,
        10,
        rng,
      );
    } else if (modeCycle === 2) {
      // Mental addition or subtraction (within 10 or within 20 no-carry)
      const isAdd = rng() > 0.45;
      if (use20) {
        if (isAdd) {
          const onesA = 1 + Math.floor(rng() * 6);
          const onesB = 1 + Math.floor(rng() * (9 - onesA));
          const a = 10 + onesA;
          q = makeNumericQuestion(
            id,
            `Tính nhẩm kết quả của phép cộng: ${a} + ${onesB} = ?`,
            a + onesB,
            `Cộng hàng đơn vị: ${onesA} + ${onesB} = ${onesA + onesB}, giữ nguyên 1 chục được ${a + onesB}.`,
            'Phép cộng phạm vi 20',
            'Tính nhẩm phép cộng',
            undefined,
            undefined,
            20,
            rng,
          );
        } else {
          const onesA = 4 + Math.floor(rng() * 6); // 4..9
          const onesB = 1 + Math.floor(rng() * onesA);
          const a = 10 + onesA;
          q = makeNumericQuestion(
            id,
            `Tính nhẩm kết quả của phép trừ: ${a} - ${onesB} = ?`,
            a - onesB,
            `Trừ hàng đơn vị: ${onesA} - ${onesB} = ${onesA - onesB}, giữ nguyên 1 chục được ${a - onesB}.`,
            'Phép trừ phạm vi 20',
            'Tính nhẩm phép trừ',
            undefined,
            undefined,
            20,
            rng,
          );
        }
      } else if (isAdd) {
        const a = 1 + Math.floor(rng() * 8);
        const b = Math.floor(rng() * (10 - a + 1));
        q = makeNumericQuestion(
          id,
          `Kết quả của phép tính ${a} + ${b} là bao nhiêu?`,
          a + b,
          `Đếm thêm từ ${a} lên ${b} đơn vị: ${a} + ${b} = ${a + b}.`,
          'Phép cộng phạm vi 10',
          'Tính nhẩm phép cộng',
          undefined,
          undefined,
          10,
          rng,
        );
      } else {
        const a = 3 + Math.floor(rng() * 8); // 3..10
        const b = Math.floor(rng() * (a + 1));
        q = makeNumericQuestion(
          id,
          `Kết quả của phép tính ${a} - ${b} là bao nhiêu?`,
          a - b,
          `Bớt đi ${b} từ ${a}: ${a} - ${b} = ${a - b}.`,
          'Phép trừ phạm vi 10',
          'Tính nhẩm phép trừ',
          undefined,
          undefined,
          10,
          rng,
        );
      }
    } else if (modeCycle === 3) {
      // Missing number [ ? ]
      const isAddMissing = rng() > 0.5;
      if (isAddMissing) {
        const sum = use20 ? 12 + Math.floor(rng() * 8) : 5 + Math.floor(rng() * 6);
        const a = use20 ? 10 + Math.floor(rng() * (sum - 11)) : 1 + Math.floor(rng() * (sum - 1));
        const ans = sum - a;
        q = makeNumericQuestion(
          id,
          `Số nào thích hợp điền vào ô trống: ${a} + [ ? ] = ${sum}?`,
          ans,
          `Vì ${a} + ${ans} = ${sum} nên số cần điền vào ô trống là ${ans}.`,
          'Tìm số còn thiếu',
          'Điền số ô trống',
          undefined,
          undefined,
          use20 ? 20 : 10,
          rng,
        );
      } else {
        const a = use20 ? 13 + Math.floor(rng() * 7) : 5 + Math.floor(rng() * 6);
        const res = use20 ? 10 + Math.floor(rng() * (a - 11)) : 1 + Math.floor(rng() * (a - 1));
        const ans = a - res;
        q = makeNumericQuestion(
          id,
          `Số nào thích hợp điền vào ô trống: ${a} - [ ? ] = ${res}?`,
          ans,
          `Vì ${a} - ${ans} = ${res} nên số thích hợp điền vào ô trống là ${ans}.`,
          'Tìm số còn thiếu',
          'Điền số ô trống',
          undefined,
          undefined,
          use20 ? 20 : 10,
          rng,
        );
      }
    } else if (modeCycle === 4) {
      // 3-term chain a + b - c or a - b + c
      if (rng() > 0.5) {
        const a = 2 + Math.floor(rng() * 5);
        const b = 1 + Math.floor(rng() * (10 - a));
        const mid = a + b;
        const c = 1 + Math.floor(rng() * (mid - 1));
        q = makeNumericQuestion(
          id,
          `Tính giá trị của dãy tính: ${a} + ${b} - ${c} = ?`,
          mid - c,
          `Thực hiện từ trái sang phải: ${a} + ${b} = ${mid}, sau đó ${mid} - ${c} = ${mid - c}.`,
          'Phép tính liên tiếp',
          'Dãy tính cộng trừ',
          undefined,
          undefined,
          10,
          rng,
        );
      } else {
        const a = 5 + Math.floor(rng() * 6); // 5..10
        const b = 1 + Math.floor(rng() * (a - 1));
        const mid = a - b;
        const c = 1 + Math.floor(rng() * (10 - mid));
        q = makeNumericQuestion(
          id,
          `Tính giá trị của dãy tính: ${a} - ${b} + ${c} = ?`,
          mid + c,
          `Thực hiện từ trái sang phải: ${a} - ${b} = ${mid}, sau đó ${mid} + ${c} = ${mid + c}.`,
          'Phép tính liên tiếp',
          'Dãy tính cộng trừ',
          undefined,
          undefined,
          10,
          rng,
        );
      }
    } else if (modeCycle === 5) {
      // Compare two expressions
      const a = 2 + Math.floor(rng() * 6);
      const b = 1 + Math.floor(rng() * (10 - a));
      const leftVal = a + b;
      const c = Math.max(leftVal, 5) + Math.floor(rng() * 3);
      const d = Math.max(1, c - leftVal + (rng() > 0.65 ? 0 : rng() > 0.5 ? 1 : -1));
      const rightVal = c - d;
      const correctSign = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '=';
      const opts: [string, string, string, string] = ['>', '<', '=', 'Không so sánh được'];
      q = {
        id,
        prompt: `Điền dấu thích hợp vào chỗ chấm: ${a} + ${b} ..... ${c} - ${d}`,
        options: opts,
        correctIndex: opts.indexOf(correctSign),
        explanation: `Vế trái ${a} + ${b} = ${leftVal}; vế phải ${c} - ${d} = ${rightVal}. Vì ${leftVal} ${correctSign} ${rightVal} nên chọn dấu ${correctSign}.`,
        curriculumTag: 'So sánh phép tính',
        questionType: 'So sánh cộng trừ',
      };
    } else {
      // Word problem (add or subtract)
      if (rng() > 0.5) {
        const a = 3 + Math.floor(rng() * 6);
        const b = 1 + Math.floor(rng() * (10 - a));
        const story = wordStoriesAdd[Math.floor(rng() * wordStoriesAdd.length)](a, b);
        q = makeNumericQuestion(
          id,
          story.prompt,
          a + b,
          story.explain,
          'Bài toán có lời văn',
          'Toán có lời văn',
          undefined,
          story.unit,
          10,
          rng,
        );
      } else {
        const a = 5 + Math.floor(rng() * 6);
        const b = 1 + Math.floor(rng() * (a - 1));
        const story = wordStoriesSub[Math.floor(rng() * wordStoriesSub.length)](a, b);
        q = makeNumericQuestion(
          id,
          story.prompt,
          a - b,
          story.explain,
          'Bài toán có lời văn',
          'Toán có lời văn',
          undefined,
          story.unit,
          10,
          rng,
        );
      }
    }

    if (!usedPrompts.has(q.prompt)) {
      usedPrompts.add(q.prompt);
      results.push(q);
    }
  }

  return results;
}

const CURATED_OFFICIAL_EXAMS: Exam[] = [
  {
    id: 'official-toan-cong-tru-01',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Toán Lớp 1 — Cộng trừ phạm vi 10 qua hình ảnh (Đề số 1)',
    subject: 'toan',
    textbookSeries: 'ket-noi-tri-thuc',
    topic: 'Phép cộng gộp nhóm & Phép trừ gạch bớt phạm vi 10',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: [
      {
        id: 't1-q1',
        questionType: 'Cộng qua hình ảnh',
        curriculumTag: 'Phép cộng qua hình ảnh',
        prompt: 'Quan sát hai giỏ táo trong hình. Hỏi có tất cả bao nhiêu quả táo?',
        options: ['6 quả táo', '7 quả táo', '8 quả táo', '5 quả táo'],
        correctIndex: 1,
        explanation: 'Giỏ bên trái có 4 quả táo, giỏ bên phải có 3 quả táo. Ta có phép cộng: 4 + 3 = 7 (quả táo).',
        visual: {
          kind: 'counting-addition',
          leftCount: 4,
          rightCount: 3,
          itemType: 'apple',
          caption: 'Đếm số quả táo ở hai bên dấu cộng',
        },
      },
      {
        id: 't1-q2',
        questionType: 'Trừ qua hình ảnh',
        curriculumTag: 'Phép trừ gạch bớt',
        prompt: 'Trên hình có 8 ngôi sao, đã gạch bớt 3 ngôi sao. Hỏi còn lại mấy ngôi sao chưa bị gạch?',
        options: ['4 ngôi sao', '5 ngôi sao', '6 ngôi sao', '3 ngôi sao'],
        correctIndex: 1,
        explanation: 'Có 8 ngôi sao, gạch bớt 3 ngôi sao ta thực hiện phép trừ: 8 - 3 = 5 (ngôi sao).',
        visual: {
          kind: 'counting-subtraction',
          totalCount: 8,
          crossedCount: 3,
          itemType: 'star',
          caption: 'Đếm số ngôi sao còn lại không bị gạch chéo',
        },
      },
      {
        id: 't1-q3',
        questionType: 'Cộng qua hình ảnh',
        curriculumTag: 'Phép cộng bông hoa',
        prompt: 'Nhìn hình vẽ hai cụm hoa. Tổng cộng có bao nhiêu bông hoa?',
        options: ['8 bông hoa', '9 bông hoa', '10 bông hoa', '7 bông hoa'],
        correctIndex: 1,
        explanation: 'Bên trái có 5 bông hoa, bên phải có 4 bông hoa. Tổng cộng 5 + 4 = 9 (bông hoa).',
        visual: {
          kind: 'counting-addition',
          leftCount: 5,
          rightCount: 4,
          itemType: 'flower',
          caption: 'Đếm số bông hoa ở cả hai nhóm',
        },
      },
      {
        id: 't1-q4',
        questionType: 'Trừ qua hình ảnh',
        curriculumTag: 'Phép trừ bóng bay',
        prompt: 'Có 9 quả bóng bay, trong đó 4 quả bị gạch bỏ. Còn lại bao nhiêu quả bóng bay?',
        options: ['4 quả', '5 quả', '6 quả', '3 quả'],
        correctIndex: 1,
        explanation: 'Số bóng bay còn lại là: 9 - 4 = 5 (quả bóng bay).',
        visual: {
          kind: 'counting-subtraction',
          totalCount: 9,
          crossedCount: 4,
          itemType: 'balloon',
          caption: 'Đếm số bóng bay chưa bị gạch chéo',
        },
      },
      {
        id: 't1-q5',
        questionType: 'Cộng qua hình ảnh',
        curriculumTag: 'Phép cộng khối vuông',
        prompt: 'Đếm số khối lập phương ở hai bên. Tất cả có bao nhiêu khối lập phương?',
        options: ['7 khối', '8 khối', '9 khối', '6 khối'],
        correctIndex: 1,
        explanation: 'Bên trái có 6 khối, bên phải có 2 khối. Ta tính: 6 + 2 = 8 (khối lập phương).',
        visual: {
          kind: 'counting-addition',
          leftCount: 6,
          rightCount: 2,
          itemType: 'cube',
          caption: 'Gộp hai nhóm khối lập phương lại với nhau',
        },
      },
      {
        id: 't1-q6',
        questionType: 'Tính nhẩm phép cộng',
        curriculumTag: 'Phép cộng phạm vi 10',
        prompt: 'Kết quả của phép tính 4 + 5 là bao nhiêu?',
        options: ['8', '9', '10', '7'],
        correctIndex: 1,
        explanation: 'Đếm thêm từ 4 lên 5 đơn vị: 4 + 5 = 9.',
      },
      {
        id: 't1-q7',
        questionType: 'Điền số phép cộng',
        curriculumTag: 'Tìm số còn thiếu',
        prompt: 'Số nào thích hợp điền vào ô trống: 3 + [ ? ] = 10?',
        options: ['6', '7', '8', '5'],
        correctIndex: 1,
        explanation: 'Ta biết 3 và 7 gộp lại được 10 (3 + 7 = 10). Vậy số cần điền là 7.',
      },
      {
        id: 't1-q8',
        questionType: 'Dãy tính cộng trừ',
        curriculumTag: 'Phép cộng trừ liên tiếp',
        prompt: 'Tính giá trị của dãy tính: 9 - 4 + 2 = ?',
        options: ['6', '7', '8', '5'],
        correctIndex: 1,
        explanation: 'Thực hiện lần lượt từ trái sang phải: 9 - 4 = 5, sau đó lấy 5 + 2 = 7.',
      },
      {
        id: 't1-q9',
        questionType: 'So sánh phép tính',
        curriculumTag: 'So sánh kết quả cộng trừ',
        prompt: 'Điền dấu thích hợp vào chỗ chấm: 5 + 3 ..... 10 - 2',
        options: ['>', '<', '=', 'Không so sánh được'],
        correctIndex: 2,
        explanation: 'Ta có vế trái 5 + 3 = 8, vế phải 10 - 2 = 8. Vì 8 = 8 nên điền dấu =.',
      },
      {
        id: 't1-q10',
        questionType: 'Toán có lời văn',
        curriculumTag: 'Giải toán phép cộng',
        prompt: 'Trên cành có 5 con chim, có thêm 4 con chim bay tới. Hỏi trên cành có tất cả mấy con chim?',
        options: ['8 con chim', '9 con chim', '1 con chim', '10 con chim'],
        correctIndex: 1,
        explanation: 'Có thêm chim bay tới nên ta làm phép cộng: 5 + 4 = 9 (con chim).',
      },
    ],
  },
  {
    id: 'official-toan-cong-tru-02',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Toán Lớp 1 — Cộng trừ với số 0 & Điền ô trống (Đề số 2)',
    subject: 'toan',
    textbookSeries: 'chan-troi-sang-tao',
    topic: 'Thành thạo cộng trừ phạm vi 10 · Điền số & Bài toán lời văn',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: [
      {
        id: 't2-q1',
        questionType: 'Trừ qua hình ảnh',
        curriculumTag: 'Phép trừ quả táo',
        prompt: 'Có 7 quả táo trong khay, bé đã ăn mất 2 quả (bị gạch chéo). Còn lại mấy quả táo?',
        options: ['4 quả táo', '5 quả táo', '6 quả táo', '3 quả táo'],
        correctIndex: 1,
        explanation: 'Lấy 7 quả táo trừ đi 2 quả đã ăn: 7 - 2 = 5 (quả táo).',
        visual: {
          kind: 'counting-subtraction',
          totalCount: 7,
          crossedCount: 2,
          itemType: 'apple',
          caption: 'Đếm số quả táo chưa bị gạch chéo',
        },
      },
      {
        id: 't2-q2',
        questionType: 'Cộng qua hình ảnh',
        curriculumTag: 'Phép cộng ngôi sao',
        prompt: 'Nhóm bên trái có 3 ngôi sao, nhóm bên phải có 5 ngôi sao. Hỏi có tất cả mấy ngôi sao?',
        options: ['7 ngôi sao', '8 ngôi sao', '9 ngôi sao', '6 ngôi sao'],
        correctIndex: 1,
        explanation: 'Thực hiện phép cộng: 3 + 5 = 8 (ngôi sao).',
        visual: {
          kind: 'counting-addition',
          leftCount: 3,
          rightCount: 5,
          itemType: 'star',
          caption: 'Đếm tổng số ngôi sao ở hai nhóm',
        },
      },
      {
        id: 't2-q3',
        questionType: 'Số 0 trong cộng trừ',
        curriculumTag: 'Cộng trừ với số 0',
        prompt: 'Kết quả của phép tính 6 - 0 + 3 là bao nhiêu?',
        options: ['3', '6', '9', '0'],
        correctIndex: 2,
        explanation: 'Một số trừ đi 0 vẫn bằng chính số đó: 6 - 0 = 6. Tiếp theo 6 + 3 = 9.',
      },
      {
        id: 't2-q4',
        questionType: 'Trừ hai số bằng nhau',
        curriculumTag: 'Phép trừ bằng 0',
        prompt: 'Kết quả của phép tính 7 - 7 + 4 là bao nhiêu?',
        options: ['0', '4', '7', '11'],
        correctIndex: 1,
        explanation: '7 trừ 7 bằng 0. Sau đó 0 + 4 = 4.',
      },
      {
        id: 't2-q5',
        questionType: 'Điền số phép trừ',
        curriculumTag: 'Tìm số trừ',
        prompt: 'Số nào thích hợp điền vào ô trống: 9 - [ ? ] = 4?',
        options: ['4', '5', '6', '3'],
        correctIndex: 1,
        explanation: 'Ta có 9 bớt đi 5 thì còn 4 (9 - 5 = 4). Vậy số cần điền là 5.',
      },
      {
        id: 't2-q6',
        questionType: 'Điền số phép cộng',
        curriculumTag: 'Tìm số hạng còn thiếu',
        prompt: 'Số nào thích hợp điền vào ô trống: [ ? ] + 5 = 8?',
        options: ['2', '3', '4', '5'],
        correctIndex: 1,
        explanation: 'Vì 3 + 5 = 8 nên số thích hợp điền vào ô trống là 3.',
      },
      {
        id: 't2-q7',
        questionType: 'So sánh phép tính',
        curriculumTag: 'So sánh biểu thức',
        prompt: 'Điền dấu thích hợp vào chỗ chấm: 4 + 4 ..... 10 - 3',
        options: ['>', '<', '=', 'Không có dấu đúng'],
        correctIndex: 0,
        explanation: 'Ta tính: 4 + 4 = 8 và 10 - 3 = 7. Vì 8 > 7 nên điền dấu >.',
      },
      {
        id: 't2-q8',
        questionType: 'Dãy tính cộng trừ',
        curriculumTag: 'Tính liên tiếp 3 số',
        prompt: 'Tính nhẩm kết quả của phép tính: 3 + 5 - 4 = ?',
        options: ['3', '4', '5', '2'],
        correctIndex: 1,
        explanation: 'Thực hiện từ trái sang phải: 3 + 5 = 8, rồi 8 - 4 = 4.',
      },
      {
        id: 't2-q9',
        questionType: 'Toán có lời văn',
        curriculumTag: 'Bài toán phép trừ',
        prompt: 'Lan có 8 bông hoa, Lan tặng bạn 3 bông hoa. Hỏi Lan còn lại mấy bông hoa?',
        options: ['4 bông hoa', '5 bông hoa', '6 bông hoa', '11 bông hoa'],
        correctIndex: 1,
        explanation: 'Số bông hoa còn lại của Lan là: 8 - 3 = 5 (bông hoa).',
      },
      {
        id: 't2-q10',
        questionType: 'Toán có lời văn',
        curriculumTag: 'Bài toán phép cộng',
        prompt: 'Trong hộp có 6 bút chì màu, mẹ mua thêm cho bé 4 bút chì màu nữa. Hỏi bé có tất cả bao nhiêu bút chì màu?',
        options: ['8 bút chì', '9 bút chì', '10 bút chì', '2 bút chì'],
        correctIndex: 2,
        explanation: 'Tổng số bút chì màu của bé là: 6 + 4 = 10 (bút chì màu).',
      },
    ],
  },
  {
    id: 'official-toan-cong-tru-03',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Toán Lớp 1 — Phép cộng & Phép trừ phạm vi 20 (Đề số 3)',
    subject: 'toan',
    textbookSeries: 'canh-dieu',
    topic: 'Cộng trừ không nhớ phạm vi 20 & So sánh phép tính',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: [
      {
        id: 't3-q1',
        questionType: 'Trừ qua hình ảnh',
        curriculumTag: 'Phép trừ khối lập phương',
        prompt: 'Có 10 khối lập phương, gạch bớt 6 khối. Hỏi còn lại mấy khối lập phương?',
        options: ['3 khối', '4 khối', '5 khối', '6 khối'],
        correctIndex: 1,
        explanation: 'Ta thực hiện phép trừ: 10 - 6 = 4 (khối lập phương).',
        visual: {
          kind: 'counting-subtraction',
          totalCount: 10,
          crossedCount: 6,
          itemType: 'cube',
          caption: 'Đếm số khối màu xanh còn lại chưa bị gạch',
        },
      },
      {
        id: 't3-q2',
        questionType: 'Cộng phạm vi 20',
        curriculumTag: 'Phép cộng không nhớ',
        prompt: 'Kết quả của phép tính 12 + 5 là bao nhiêu?',
        options: ['16', '17', '18', '15'],
        correctIndex: 1,
        explanation: 'Lấy 2 + 5 = 7, giữ nguyên 1 chục được 17.',
      },
      {
        id: 't3-q3',
        questionType: 'Trừ phạm vi 20',
        curriculumTag: 'Phép trừ không nhớ',
        prompt: 'Kết quả của phép tính 18 - 4 là bao nhiêu?',
        options: ['14', '13', '15', '12'],
        correctIndex: 0,
        explanation: 'Lấy 8 - 4 = 4, giữ nguyên 1 chục được 14.',
      },
      {
        id: 't3-q4',
        questionType: 'Cộng phạm vi 20',
        curriculumTag: 'Cộng với số 10',
        prompt: 'Tính nhẩm: 10 + 7 = ?',
        options: ['16', '17', '18', '107'],
        correctIndex: 1,
        explanation: '1 chục cộng 7 đơn vị bằng 17.',
      },
      {
        id: 't3-q5',
        questionType: 'Trừ phạm vi 20',
        curriculumTag: 'Trừ để được 10',
        prompt: 'Kết quả của phép tính 16 - 6 là bao nhiêu?',
        options: ['6', '10', '12', '8'],
        correctIndex: 1,
        explanation: 'Lấy 6 - 6 = 0, giữ nguyên 1 chục, ta được kết quả là 10.',
      },
      {
        id: 't3-q6',
        questionType: 'Dãy tính phạm vi 20',
        curriculumTag: 'Cộng trừ liên tiếp',
        prompt: 'Tính giá trị dãy tính: 15 - 3 + 2 = ?',
        options: ['12', '13', '14', '15'],
        correctIndex: 2,
        explanation: 'Thực hiện từ trái sang phải: 15 - 3 = 12, sau đó 12 + 2 = 14.',
      },
      {
        id: 't3-q7',
        questionType: 'Điền số phạm vi 20',
        curriculumTag: 'Tìm số còn thiếu',
        prompt: 'Điền số thích hợp vào ô trống: 11 + [ ? ] = 19',
        options: ['6', '7', '8', '9'],
        correctIndex: 2,
        explanation: 'Vì 1 + 8 = 9 nên 11 + 8 = 19. Số cần điền là 8.',
      },
      {
        id: 't3-q8',
        questionType: 'So sánh phép tính',
        curriculumTag: 'So sánh trong phạm vi 20',
        prompt: 'Điền dấu thích hợp vào chỗ chấm: 14 + 3 ..... 19 - 2',
        options: ['>', '<', '=', 'Không so sánh được'],
        correctIndex: 2,
        explanation: 'Vế trái 14 + 3 = 17; vế phải 19 - 2 = 17. Hai vế bằng nhau nên điền dấu =.',
      },
      {
        id: 't3-q9',
        questionType: 'Toán có lời văn',
        curriculumTag: 'Bài toán phép trừ phạm vi 20',
        prompt: 'An có 15 viên bi, An cho Bình 5 viên bi. Hỏi An còn lại bao nhiêu viên bi?',
        options: ['20 viên bi', '10 viên bi', '11 viên bi', '9 viên bi'],
        correctIndex: 1,
        explanation: 'Số viên bi An còn lại là: 15 - 5 = 10 (viên bi).',
      },
      {
        id: 't3-q10',
        questionType: 'Toán có lời văn',
        curriculumTag: 'Bài toán phép cộng phạm vi 20',
        prompt: 'Tổ 1 trồng được 11 cây hoa, Tổ 2 trồng được 7 cây hoa. Hỏi cả hai tổ trồng được bao nhiêu cây hoa?',
        options: ['17 cây', '18 cây', '19 cây', '16 cây'],
        correctIndex: 1,
        explanation: 'Cả hai tổ trồng được: 11 + 7 = 18 (cây hoa).',
      },
    ],
  },
  {
    id: 'official-toan-cong-tru-04',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Toán Lớp 1 — Luyện tập phép cộng phạm vi 10 (Đề số 4)',
    subject: 'toan',
    textbookSeries: 'ket-noi-tri-thuc',
    topic: 'Gộp số, cộng qua hình ảnh & bài toán thêm vào',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: generateDynamicMathQuestions(10, 'within10'),
  },
  {
    id: 'official-toan-cong-tru-05',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Toán Lớp 1 — Luyện tập phép trừ phạm vi 10 (Đề số 5)',
    subject: 'toan',
    textbookSeries: 'chan-troi-sang-tao',
    topic: 'Bớt đi qua hình ảnh, tìm số trừ & bài toán còn lại',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: generateDynamicMathQuestions(10, 'within10'),
  },
  {
    id: 'official-toan-cong-tru-06',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Toán Lớp 1 — Cộng trừ tổng hợp & So sánh (Đề số 6)',
    subject: 'toan',
    textbookSeries: 'tong-hop',
    topic: 'Trộn nhiều dạng phép cộng và phép trừ chuẩn SGK',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: generateDynamicMathQuestions(10, 'mixed'),
  },
  {
    id: 'official-toan-cong-tru-07',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Toán Lớp 1 — Cộng trừ không nhớ phạm vi 20 (Đề số 7)',
    subject: 'toan',
    textbookSeries: 'canh-dieu',
    topic: 'Tính nhẩm nhanh trong phạm vi 20 & điền ô trống',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: generateDynamicMathQuestions(10, 'within20'),
  },
  {
    id: 'official-toan-cong-tru-08',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Toán Lớp 1 — Ôn tập cuối tuần Phép cộng & Phép trừ (Đề số 8)',
    subject: 'toan',
    textbookSeries: 'tong-hop',
    topic: 'Tổng hợp hình ảnh, tính nhẩm, so sánh và lời văn',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: generateDynamicMathQuestions(10, 'mixed'),
  },
  {
    id: 'official-tv-kntt-01',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Tiếng Việt Lớp 1 — Chính tả c/k, g/gh, ng/ngh & Ghép vần (Đề số 1)',
    subject: 'tieng-viet',
    textbookSeries: 'ket-noi-tri-thuc',
    topic: 'Học kì I · Âm, vần và quy tắc chính tả',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: [
      {
        id: 'tv1-q1',
        questionType: 'Quy tắc chính tả',
        curriculumTag: 'Quy tắc chính tả c/k',
        prompt: 'Chữ "k" thường đứng trước các âm nào sau đây?',
        options: ['a, o, ô, ơ', 'i, e, ê', 'u, ư, a', 'ă, â, o'],
        correctIndex: 1,
        explanation: 'Theo quy tắc chính tả tiếng Việt, "k" đứng trước các âm i, e, ê (ví dụ: kì nghỉ, kẻ vở, kể chuyện).',
      },
      {
        id: 'tv1-q2',
        questionType: 'Điền âm đúng',
        curriculumTag: 'Điền g hay gh',
        prompt: 'Từ nào viết đúng chính tả dưới đây?',
        options: ['Cái gế gỗ', 'Cái ghế gỗ', 'Con gẹ biển', 'Gi nhớ bài học'],
        correctIndex: 1,
        explanation: '"gh" luôn đứng trước i, e, ê. Vì âm sau là "ê" nên phải viết là "ghế" (Cái ghế gỗ).',
      },
      {
        id: 'tv1-q3',
        questionType: 'Điền âm đúng',
        curriculumTag: 'Điền ng hay ngh',
        prompt: 'Chọn tiếng viết đúng để điền vào chỗ chấm: "Bé lắng ..... cô giáo giảng bài."',
        options: ['nge', 'nghe', 'ngê', 'nghê'],
        correctIndex: 1,
        explanation: '"ngh" đứng trước các âm i, e, ê. Tiếng "nghe" có âm e đứng sau nên dùng "ngh".',
      },
      {
        id: 'tv1-q4',
        questionType: 'Thanh điệu',
        curriculumTag: 'Nhận biết thanh điệu',
        prompt: 'Tiếng "bưởi" trong "quả bưởi" mang thanh gì?',
        options: ['Thanh huyền', 'Thanh sắc', 'Thanh hỏi', 'Thanh ngã'],
        correctIndex: 2,
        explanation: 'Tiếng "bưởi" có dấu hỏi trên chữ "ơ", vậy mang thanh hỏi.',
      },
      {
        id: 'tv1-q5',
        questionType: 'Nhận diện vần',
        curriculumTag: 'Phân tích vần tiếng Việt',
        prompt: 'Trong từ "hoa hướng dương", tiếng "hoa" chứa vần nào?',
        options: ['ao', 'oa', 'oe', 'ua'],
        correctIndex: 1,
        explanation: 'Tiếng "hoa" gồm âm đầu h ghép với vần "oa".',
      },
      {
        id: 'tv1-q6',
        questionType: 'Chính tả s/x',
        curriculumTag: 'Phân biệt s / x',
        prompt: 'Từ nào viết đúng tên một loài chim hót hay vào buổi sáng?',
        options: ['Chim xẻ', 'Chim sẻ', 'Chim sáo xậu', 'Con xóc'],
        correctIndex: 1,
        explanation: '"Chim sẻ" viết bằng sờ nặng (s) là đúng chính tả.',
      },
      {
        id: 'tv1-q7',
        questionType: 'Chính tả tr/ch',
        curriculumTag: 'Phân biệt tr / ch',
        prompt: 'Chọn từ viết đúng chính tả chỉ mặt trời mọc buổi sáng:',
        options: ['Mặt chời', 'Mặt trời', 'Ánh chăng', 'Bầu chời'],
        correctIndex: 1,
        explanation: '"Mặt trời" viết với âm đầu "tr" (trời).',
      },
      {
        id: 'tv1-q8',
        questionType: 'Từ vựng sự vật',
        curriculumTag: 'Đồ dùng học tập',
        prompt: 'Từ nào chỉ một đồ dùng học tập quen thuộc của học sinh?',
        options: ['Cái chảo', 'Quyển vở', 'Cái gối', 'Bát cơm'],
        correctIndex: 1,
        explanation: 'Quyển vở là đồ dùng để viết bài khi đi học của học sinh lớp 1.',
      },
      {
        id: 'tv1-q9',
        questionType: 'Điền âm c/k',
        curriculumTag: 'Thực hành điền c/k',
        prompt: 'Điền "c" hay "k" vào chỗ trống: ".....éo co" và ".....á vàng"?',
        options: ['céo co, cá vàng', 'kéo co, ká vàng', 'kéo co, cá vàng', 'céo co, ká vàng'],
        correctIndex: 2,
        explanation: 'Trước âm "e" dùng k ("kéo co"), trước âm "a" dùng c ("cá vàng").',
      },
      {
        id: 'tv1-q10',
        questionType: 'Nhận diện vần',
        curriculumTag: 'Phân biệt vần oai / oay',
        prompt: 'Loài củ nào dưới đây viết đúng chính tả?',
        options: ['Củ khoay lang', 'Củ khoai lang', 'Quả soài', 'Bông hoai'],
        correctIndex: 1,
        explanation: 'Củ "khoai lang" dùng vần "oai" (kết thúc bằng i ngắn).',
      },
    ],
  },
  {
    id: 'official-tv-ctst-02',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Tiếng Việt Lớp 1 — Đọc hiểu đoạn văn & Luyện từ câu (Đề số 2)',
    subject: 'tieng-viet',
    textbookSeries: 'chan-troi-sang-tao',
    topic: 'Học kì II · Đọc hiểu & Luyện từ câu',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: [
      {
        id: 'tv2-q1',
        questionType: 'Đọc hiểu đoạn văn',
        curriculumTag: 'Đọc hiểu văn bản',
        prompt: 'Đọc đoạn: "Buổi sáng, mặt trời thức dậy tỏa nắng vàng ấm áp. Đàn chim hót líu lo trên cành bàng trước sân trường." — Đàn chim hót ở đâu?',
        options: ['Trong phòng học', 'Trên cành bàng trước sân trường', 'Bên bờ ao', 'Trên mái nhà'],
        correctIndex: 1,
        explanation: 'Câu văn thứ hai nêu rõ: "Đàn chim hót líu lo trên cành bàng trước sân trường."',
      },
      {
        id: 'tv2-q2',
        questionType: 'Từ loại',
        curriculumTag: 'Từ chỉ sự vật',
        prompt: 'Từ nào dưới đây là từ chỉ con vật?',
        options: ['Chạy nhảy', 'Xanh biếc', 'Chú mèo mướp', 'Chăm chỉ'],
        correctIndex: 2,
        explanation: '"Chú mèo mướp" là từ chỉ con vật; "chạy nhảy" chỉ hoạt động; "xanh biếc" và "chăm chỉ" chỉ đặc điểm.',
      },
      {
        id: 'tv2-q3',
        questionType: 'Từ loại',
        curriculumTag: 'Từ chỉ hoạt động',
        prompt: 'Trong câu "Bé Lan đang tưới cây ngoài vườn", từ nào chỉ hoạt động của bé Lan?',
        options: ['Bé Lan', 'Ngoài vườn', 'Tưới cây', 'Đang'],
        correctIndex: 2,
        explanation: '"Tưới cây" là hành động, việc làm của bé Lan.',
      },
      {
        id: 'tv2-q4',
        questionType: 'Sắp xếp câu',
        curriculumTag: 'Sắp xếp từ thành câu',
        prompt: 'Sắp xếp các từ "em / yêu / trường / lớp" thành câu hoàn chỉnh và đúng ý nghĩa:',
        options: ['Trường lớp em yêu.', 'Em yêu trường lớp.', 'Yêu em trường lớp.', 'Lớp trường yêu em.'],
        correctIndex: 1,
        explanation: 'Câu đúng trật tự tiếng Việt là: "Em yêu trường lớp."',
      },
      {
        id: 'tv2-q5',
        questionType: 'Dấu câu',
        curriculumTag: 'Dấu chấm kết thúc câu',
        prompt: 'Cuối câu kể bình thường (ví dụ: "Hôm nay em đi học sớm") ta dùng dấu câu nào?',
        options: ['Dấu chấm hỏi (?)', 'Dấu chấm (.)', 'Dấu phẩy (,)', 'Dấu hai chấm (:)'],
        correctIndex: 1,
        explanation: 'Khi kết thúc một câu kể đầy đủ ý, ta đặt dấu chấm (.).',
      },
      {
        id: 'tv2-q6',
        questionType: 'Từ trái nghĩa',
        curriculumTag: 'Mở rộng vốn từ',
        prompt: 'Từ trái nghĩa với từ "chăm chỉ" là từ nào?',
        options: ['Siêng năng', 'Lười biếng', 'Ngoan ngoãn', 'Nhanh nhẹn'],
        correctIndex: 1,
        explanation: 'Chăm chỉ nghĩa là chịu khó làm việc/học tập, trái nghĩa với lười biếng.',
      },
      {
        id: 'tv2-q7',
        questionType: 'Chính tả viết hoa',
        curriculumTag: 'Viết hoa tên riêng',
        prompt: 'Tên bạn học sinh nào dưới đây được viết hoa đúng quy tắc?',
        options: ['nguyễn minh an', 'Nguyễn minh an', 'Nguyễn Minh An', 'nguyễn Minh an'],
        correctIndex: 2,
        explanation: 'Tên riêng người Việt phải viết hoa chữ cái đầu của mỗi tiếng: Nguyễn Minh An.',
      },
      {
        id: 'tv2-q8',
        questionType: 'Đọc hiểu ca dao',
        curriculumTag: 'Đọc hiểu thơ ngắn',
        prompt: 'Trong hai dòng thơ: "Công cha như núi Thái Sơn / Nghĩa mẹ như nước trong nguồn chảy ra", dòng thơ nhắc đến ai?',
        options: ['Thầy và cô', 'Cha và mẹ', 'Bạn bè', 'Anh và chị'],
        correctIndex: 1,
        explanation: 'Hai dòng ca dao nói về công lao sinh thành, dưỡng dục của cha và mẹ.',
      },
      {
        id: 'tv2-q9',
        questionType: 'Bài tập hình ảnh',
        curriculumTag: 'Từ chỉ màu sắc qua hình ảnh',
        prompt: 'Quan sát ô màu dưới đây. Từ ngữ nào miêu tả đúng màu sắc của lá cây non trong ô màu?',
        options: ['Đỏ rực', 'Vàng óng', 'Xanh lá tươi', 'Tím biếc'],
        correctIndex: 2,
        explanation: 'Ô màu hiển thị màu xanh lá tươi mát giống màu lá cây non.',
        visual: {
          kind: 'color-swatch',
          colorHex: '#22C55E',
          caption: 'Quan sát màu sắc trong khung hình',
        },
      },
      {
        id: 'tv2-q10',
        questionType: 'Giao tiếp lễ phép',
        curriculumTag: 'Lời nói lịch sự',
        prompt: 'Khi nhận được quà từ ông bà, em nên nói câu nào cho lễ phép?',
        options: ['Ông bà đưa đây.', 'Cháu cảm ơn ông bà ạ!', 'Quà này nhỏ quá.', 'Cháu không lấy đâu.'],
        correctIndex: 1,
        explanation: 'Khi được người lớn tặng quà, nói "Cháu cảm ơn ông bà ạ!" thể hiện sự lễ phép và biết ơn.',
      },
    ],
  },
  {
    id: 'official-tv-cd-03',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Tiếng Việt Lớp 1 — Ghép vần, Từ ngữ & Màu sắc (Đề số 3)',
    subject: 'tieng-viet',
    textbookSeries: 'canh-dieu',
    topic: 'Ôn tập vần khó, từ chỉ đặc điểm & Đọc hiểu',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: [
      {
        id: 'tv3-q1',
        questionType: 'Bài tập hình ảnh',
        curriculumTag: 'Từ ngữ chỉ màu sắc',
        prompt: 'Nhìn ô màu bên dưới. Màu này là màu gì của hoa phượng nở vào mùa hè?',
        options: ['Màu đỏ thắm', 'Màu xanh lam', 'Màu tím nhạt', 'Màu trắng tinh'],
        correctIndex: 0,
        explanation: 'Ô màu hiển thị màu đỏ thắm giống màu hoa phượng mùa hè.',
        visual: {
          kind: 'color-swatch',
          colorHex: '#EF4444',
          caption: 'Quan sát ô màu sắc',
        },
      },
      {
        id: 'tv3-q2',
        questionType: 'Bài tập hình ảnh',
        curriculumTag: 'Từ chỉ màu sắc thiên nhiên',
        prompt: 'Ô màu dưới đây là màu sắc của ánh nắng mặt trời hay hoa cúc vàng. Đó là màu gì?',
        options: ['Màu vàng rực', 'Màu xanh lá', 'Màu nâu đất', 'Màu đen'],
        correctIndex: 0,
        explanation: 'Ô màu hiển thị màu vàng rực rỡ.',
        visual: {
          kind: 'color-swatch',
          colorHex: '#FACC15',
          caption: 'Quan sát ô màu sắc',
        },
      },
      {
        id: 'tv3-q3',
        questionType: 'Quy tắc chính tả',
        curriculumTag: 'Phân biệt l / n',
        prompt: 'Từ nào viết đúng chính tả chỉ loại quả có vỏ xanh, ruột đỏ, nhiều hạt đen?',
        options: ['Quả dưa hấu', 'Quả nựu', 'Cái lồi cơm', 'Con lợn lòi'],
        correctIndex: 0,
        explanation: '"Quả dưa hấu" viết đúng chính tả. Còn "nựu" (lựu), "lồi cơm" (nồi cơm) đều sai l/n.',
      },
      {
        id: 'tv3-q4',
        questionType: 'Đọc hiểu đoạn văn',
        curriculumTag: 'Đọc hiểu chi tiết',
        prompt: 'Đọc đoạn: "Chiều nay, bé Nam cùng bố ra công viên thả diều. Cánh diều giấy bay cao vút trên nền trời xanh." — Bé Nam đi đâu cùng bố?',
        options: ['Đi siêu thị', 'Ra công viên thả diều', 'Đi bơi ở bể bơi', 'Về thăm ông bà'],
        correctIndex: 1,
        explanation: 'Câu đầu tiên cho biết: "Chiều nay, bé Nam cùng bố ra công viên thả diều."',
      },
      {
        id: 'tv3-q5',
        questionType: 'Ghép tiếng',
        curriculumTag: 'Tìm tiếng có vần iên',
        prompt: 'Từ nào dưới đây có tiếng chứa vần "iên"?',
        options: ['Bầu trời', 'Tiên nữ', 'Ngôi nhà', 'Bông hoa'],
        correctIndex: 1,
        explanation: 'Tiếng "Tiên" trong "Tiên nữ" gồm âm đầu t ghép với vần "iên".',
      },
      {
        id: 'tv3-q6',
        questionType: 'Từ loại',
        curriculumTag: 'Từ chỉ người thân',
        prompt: 'Từ nào sau đây KHÔNG phải từ chỉ người thân trong gia đình?',
        options: ['Ông ngoại', 'Cô dì', 'Chú bộ đội', 'Bà nội'],
        correctIndex: 2,
        explanation: 'Ông ngoại, cô dì, bà nội là người thân trong gia đình; chú bộ đội là từ chỉ nghề nghiệp.',
      },
      {
        id: 'tv3-q7',
        questionType: 'Dấu câu',
        curriculumTag: 'Câu hỏi dùng dấu chấm hỏi',
        prompt: 'Cuối câu hỏi "Hôm nay cậu có đi học không" ta cần đặt dấu gì?',
        options: ['Dấu chấm (.)', 'Dấu chấm hỏi (?)', 'Dấu phẩy (,)', 'Dấu gạch ngang (-)'],
        correctIndex: 1,
        explanation: 'Kết thúc một câu hỏi luôn đặt dấu chấm hỏi (?).',
      },
      {
        id: 'tv3-q8',
        questionType: 'Chính tả r/d/gi',
        curriculumTag: 'Phân biệt r / d / gi',
        prompt: 'Tên con vật nào dưới đây viết đúng chính tả?',
        options: ['Con dùa', 'Con rùa', 'Con giùa', 'Con dù'],
        correctIndex: 1,
        explanation: '"Con rùa" viết bằng âm đầu "r".',
      },
      {
        id: 'tv3-q9',
        questionType: 'Sắp xếp câu',
        curriculumTag: 'Ghép từ thành câu',
        prompt: 'Sắp xếp các từ "mẹ / nấu / cơm / ngon" thành câu có nghĩa:',
        options: ['Cơm ngon mẹ nấu.', 'Mẹ nấu cơm ngon.', 'Nấu mẹ cơm ngon.', 'Ngon mẹ nấu cơm.'],
        correctIndex: 1,
        explanation: 'Câu kể đúng cấu trúc là: "Mẹ nấu cơm ngon."',
      },
      {
        id: 'tv3-q10',
        questionType: 'Thanh điệu',
        curriculumTag: 'Tìm tiếng mang thanh ngã',
        prompt: 'Tiếng nào dưới đây mang thanh ngã (~)?',
        options: ['Cái mũ', 'Quyển vở', 'Cây bàng', 'Con mèo'],
        correctIndex: 0,
        explanation: 'Tiếng "mũ" có dấu ngã trên chữ "u". ("vở" là thanh hỏi, "bàng" và "mèo" là thanh huyền).',
      },
    ],
  },
  {
    id: 'official-tv-th-04',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Tiếng Việt Lớp 1 — Luyện đọc hiểu & Chính tả nâng cao (Đề số 4)',
    subject: 'tieng-viet',
    textbookSeries: 'tong-hop',
    topic: 'Đọc hiểu đoạn văn ngắn, từ chỉ đặc điểm & ghép vần',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: [
      {
        id: 'tv4-q1',
        questionType: 'Bài tập hình ảnh',
        curriculumTag: 'Từ chỉ màu sắc bầu trời',
        prompt: 'Quan sát ô màu dưới đây. Màu xanh của bầu trời quang đãng là màu nào?',
        options: ['Xanh dương', 'Đỏ thắm', 'Vàng tươi', 'Nâu đất'],
        correctIndex: 0,
        explanation: 'Ô màu hiển thị màu xanh dương (xanh da trời).',
        visual: {
          kind: 'color-swatch',
          colorHex: '#3B82F6',
          caption: 'Quan sát ô màu bầu trời',
        },
      },
      {
        id: 'tv4-q2',
        questionType: 'Chính tả ng/ngh',
        curriculumTag: 'Quy tắc ng / ngh',
        prompt: 'Từ nào viết đúng chính tả dưới đây?',
        options: ['Củ ngệ vàng', 'Củ nghệ vàng', 'Con ngha', 'Ngỉ hè'],
        correctIndex: 1,
        explanation: 'Trước chữ ê dùng "ngh" nên viết là "nghệ" (Củ nghệ vàng). "Nghỉ hè" cũng dùng ngh, "con nga" dùng ng.',
      },
      {
        id: 'tv4-q3',
        questionType: 'Đọc hiểu đoạn văn',
        curriculumTag: 'Đọc hiểu tìm chi tiết',
        prompt: 'Đọc đoạn: "Bé Hà có một chú chó nhỏ tên là Bông. Bộ lông của Bông trắng muốt và rất mềm." — Chú chó của bé Hà tên là gì?',
        options: ['Mực', 'Bông', 'Vàng', 'Mi Mi'],
        correctIndex: 1,
        explanation: 'Đoạn văn nêu rõ: "chú chó nhỏ tên là Bông".',
      },
      {
        id: 'tv4-q4',
        questionType: 'Thanh điệu',
        curriculumTag: 'Tìm tiếng mang thanh sắc',
        prompt: 'Trong các từ sau, tiếng nào mang thanh sắc (dấu sắc)?',
        options: ['Quả cam', 'Chiếc lá', 'Con bò', 'Hạt gạo'],
        correctIndex: 1,
        explanation: 'Tiếng "lá" trong "Chiếc lá" mang thanh sắc.',
      },
      {
        id: 'tv4-q5',
        questionType: 'Chính tả g/gh',
        curriculumTag: 'Điền g hay gh',
        prompt: 'Điền "g" hay "gh" vào chỗ chấm: ".....i chép" và "con .....à trống"?',
        options: ['gi chép, con gà trống', 'ghi chép, con gà trống', 'ghi chép, con ghà trống', 'gi chép, con ghà trống'],
        correctIndex: 1,
        explanation: 'Trước âm "i" dùng gh ("ghi chép"), trước âm "a" dùng g ("con gà trống").',
      },
      {
        id: 'tv4-q6',
        questionType: 'Từ loại',
        curriculumTag: 'Từ chỉ hoạt động ở trường',
        prompt: 'Từ nào chỉ hoạt động học tập của học sinh trong lớp?',
        options: ['Bảng đen', 'Đọc bài', 'Phấn trắng', 'Cái thước'],
        correctIndex: 1,
        explanation: '"Đọc bài" là từ chỉ hoạt động; các từ còn lại chỉ đồ vật.',
      },
      {
        id: 'tv4-q7',
        questionType: 'Ghép vần',
        curriculumTag: 'Vần ươn / ương',
        prompt: 'Từ nào viết đúng chính tả chỉ nơi trồng nhiều cây ăn quả hoặc hoa?',
        options: ['Khu vường', 'Khu vườn', 'Con đường', 'Cả hai từ Khu vườn và Con đường'],
        correctIndex: 3,
        explanation: '"Khu vườn" viết vần ươn, "Con đường" viết vần ương — cả hai đều viết đúng.',
      },
      {
        id: 'tv4-q8',
        questionType: 'Sắp xếp câu',
        curriculumTag: 'Sắp xếp từ thành câu đúng',
        prompt: 'Sắp xếp các từ "chăm / bé / học / bài" thành câu hoàn chỉnh:',
        options: ['Học bài bé chăm.', 'Bé chăm học bài.', 'Chăm bé học bài.', 'Bài học bé chăm.'],
        correctIndex: 1,
        explanation: 'Câu đúng trật tự tiếng Việt là: "Bé chăm học bài."',
      },
      {
        id: 'tv4-q9',
        questionType: 'Từ trái nghĩa',
        curriculumTag: 'Tìm cặp từ trái nghĩa',
        prompt: 'Từ nào trái nghĩa với từ "cao" (ví dụ: cây cau cao)?',
        options: ['Dài', 'Thấp', 'To', 'Rộng'],
        correctIndex: 1,
        explanation: 'Trái nghĩa với "cao" là "thấp".',
      },
      {
        id: 'tv4-q10',
        questionType: 'Thanh điệu',
        curriculumTag: 'Tìm tiếng mang thanh nặng',
        prompt: 'Tiếng nào dưới đây mang thanh nặng (dấu nặng)?',
        options: ['Hạt thóc', 'Bông lúa', 'Ngọn cỏ', 'Cánh đồng'],
        correctIndex: 0,
        explanation: 'Tiếng "Hạt" có dấu nặng dưới chữ "a".',
      },
    ],
  },
  {
    id: 'official-tv-kntt-05',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Tiếng Việt Lớp 1 — Âm vần & Chính tả phân biệt (Đề số 5)',
    subject: 'tieng-viet',
    textbookSeries: 'ket-noi-tri-thuc',
    topic: 'Phân biệt s/x, tr/ch, l/n, c/k & ghép tiếng',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: [
      {
        id: 'tv5-q1',
        questionType: 'Chính tả s/x',
        curriculumTag: 'Phân biệt s / x',
        prompt: 'Từ nào viết đúng chính tả chỉ phương tiện chạy trên đường phố?',
        options: ['Xe đạp', 'Se đạp', 'Xân trường', 'Sanh tươi'],
        correctIndex: 0,
        explanation: '"Xe đạp" viết với âm đầu "x". ("Sân trường", "Xanh tươi" mới đúng).',
      },
      {
        id: 'tv5-q2',
        questionType: 'Chính tả l/n',
        curriculumTag: 'Phân biệt l / n',
        prompt: 'Chọn câu viết đúng chính tả dưới đây:',
        options: ['Bé ăn bát lóng.', 'Ngọn lửa bập bùng.', 'Mặt nặn trời.', 'Nên lớp một.'],
        correctIndex: 1,
        explanation: '"Ngọn lửa bập bùng." viết đúng hoàn toàn quy tắc l/n.',
      },
      {
        id: 'tv5-q3',
        questionType: 'Ghép vần',
        curriculumTag: 'Tìm tiếng có vần ươi',
        prompt: 'Loại quả nào sau đây có tiếng chứa vần "ươi"?',
        options: ['Quả xoài', 'Quả bưởi', 'Quả táo', 'Quả na'],
        correctIndex: 1,
        explanation: 'Tiếng "bưởi" gồm âm đầu b ghép với vần "ươi" và thanh hỏi.',
      },
      {
        id: 'tv5-q4',
        questionType: 'Đọc hiểu thơ',
        curriculumTag: 'Đọc hiểu thơ thiếu nhi',
        prompt: 'Trong câu thơ: "Sáng ra bờ suối tối vào hang / Cháo bẹ rau măng vẫn sẵn sàng", buổi sáng Bác Hồ làm việc ở đâu?',
        options: ['Trong nhà', 'Ngoài bờ suối', 'Trên sân trường', 'Ở công viên'],
        correctIndex: 1,
        explanation: 'Câu thơ mở đầu ghi rõ: "Sáng ra bờ suối tối vào hang".',
      },
      {
        id: 'tv5-q5',
        questionType: 'Từ loại',
        curriculumTag: 'Từ chỉ bộ phận cây cối',
        prompt: 'Từ nào dưới đây KHÔNG phải tên bộ phận của cái cây?',
        options: ['Rễ cây', 'Cành lá', 'Mái ngói', 'Bông hoa'],
        correctIndex: 2,
        explanation: '"Mái ngói" là bộ phận của ngôi nhà, không phải của cái cây.',
      },
      {
        id: 'tv5-q6',
        questionType: 'Chính tả tr/ch',
        curriculumTag: 'Phân biệt tr / ch',
        prompt: 'Chọn từ viết đúng tên một món ăn quen thuộc buổi sáng:',
        options: ['Bát tráo', 'Bát cháo', 'Củ troai', 'Con châu'],
        correctIndex: 1,
        explanation: '"Bát cháo" viết với âm đầu "ch".',
      },
      {
        id: 'tv5-q7',
        questionType: 'Quy tắc chính tả',
        curriculumTag: 'Quy tắc g / gh',
        prompt: 'Chữ "gh" KHÔNG thể đứng trước nguyên âm nào sau đây?',
        options: ['i', 'e', 'ê', 'a'],
        correctIndex: 3,
        explanation: '"gh" chỉ đứng trước i, e, ê; không đứng trước a (trước a phải viết g, ví dụ: gà, ga).',
      },
      {
        id: 'tv5-q8',
        questionType: 'Sắp xếp câu',
        curriculumTag: 'Đặt câu hoàn chỉnh',
        prompt: 'Sắp xếp các từ "em / giúp / mẹ / quét / nhà" thành câu đúng:',
        options: ['Quét nhà mẹ giúp em.', 'Em giúp mẹ quét nhà.', 'Mẹ nhà quét giúp em.', 'Giúp em mẹ quét nhà.'],
        correctIndex: 1,
        explanation: 'Câu đúng nghĩa là: "Em giúp mẹ quét nhà."',
      },
      {
        id: 'tv5-q9',
        questionType: 'Thanh điệu',
        curriculumTag: 'Thanh ngang (không dấu)',
        prompt: 'Từ nào dưới đây có cả hai tiếng đều KHÔNG có dấu thanh (thanh ngang)?',
        options: ['Hoa hồng', 'Mây xanh', 'Nắng vàng', 'Cầu vồng'],
        correctIndex: 1,
        explanation: 'Cả hai tiếng "Mây" và "xanh" đều mang thanh ngang (không có dấu thanh).',
      },
      {
        id: 'tv5-q10',
        questionType: 'Đọc hiểu đoạn văn',
        curriculumTag: 'Hiểu nội dung đoạn văn',
        prompt: 'Đọc đoạn: "Giờ ra chơi, sân trường rộn rã tiếng cười. Các bạn nữ chơi nhảy dây, còn các bạn nam đá cầu." — Các bạn nam chơi trò gì?',
        options: ['Nhảy dây', 'Đá cầu', 'Trốn tìm', 'Kéo co'],
        correctIndex: 1,
        explanation: 'Đoạn văn viết: "còn các bạn nam đá cầu."',
      },
    ],
  },
  {
    id: 'official-tv-th-06',
    creatorId: 'official-curriculum',
    creatorName: 'Ban Biên Tập SGK Lớp 1',
    title: 'Tiếng Việt Lớp 1 — Tổng hợp Đọc hiểu & Luyện từ (Đề số 6)',
    subject: 'tieng-viet',
    textbookSeries: 'tong-hop',
    topic: 'Ôn tập tổng hợp cuối tuần môn Tiếng Việt Lớp 1',
    durationMinutes: 25,
    questionCount: 10,
    isOfficial: true,
    questions: [
      {
        id: 'tv6-q1',
        questionType: 'Chính tả c/k',
        curriculumTag: 'Quy tắc c / k',
        prompt: 'Từ nào viết đúng chính tả dưới đây?',
        options: ['Quyển vở kẻ ô li', 'Quyển vở cẻ ô li', 'Quả cam cì diệu', 'Cái céo'],
        correctIndex: 0,
        explanation: 'Trước chữ e dùng k ("kẻ ô li"), nên "Quyển vở kẻ ô li" viết đúng.',
      },
      {
        id: 'tv6-q2',
        questionType: 'Từ loại',
        curriculumTag: 'Từ chỉ đặc điểm',
        prompt: 'Trong câu "Chú thỏ trắng rất nhanh nhẹn", từ nào chỉ đặc điểm của chú thỏ?',
        options: ['Chú thỏ', 'Nhanh nhẹn', 'Rất', 'Chú'],
        correctIndex: 1,
        explanation: '"Nhanh nhẹn" và "trắng" là các từ chỉ đặc điểm.',
      },
      {
        id: 'tv6-q3',
        questionType: 'Đọc hiểu đoạn văn',
        curriculumTag: 'Đọc hiểu đoạn ngắn',
        prompt: 'Đọc đoạn: "Mùa xuân về, mưa bụi lất phất bay. Cây bàng trước ngõ nhú lên những búp lá non xanh mơn mởn." — Cây bàng nhú lá non vào mùa nào?',
        options: ['Mùa hạ', 'Mùa thu', 'Mùa đông', 'Mùa xuân'],
        correctIndex: 3,
        explanation: 'Câu đầu tiên cho biết "Mùa xuân về...".',
      },
      {
        id: 'tv6-q4',
        questionType: 'Bài tập hình ảnh',
        curriculumTag: 'Từ ngữ chỉ màu sắc',
        prompt: 'Nhìn ô màu bên dưới. Màu này thường thấy ở quả cà chua chín hoặc hoa hồng nhung:',
        options: ['Màu đỏ tươi', 'Màu xanh lá', 'Màu vàng nhạt', 'Màu xám'],
        correctIndex: 0,
        explanation: 'Ô màu hiển thị màu đỏ tươi.',
        visual: {
          kind: 'color-swatch',
          colorHex: '#EF4444',
          caption: 'Quan sát màu sắc trong khung hình',
        },
      },
      {
        id: 'tv6-q5',
        questionType: 'Chính tả ng/ngh',
        curriculumTag: 'Điền ng hoặc ngh',
        prompt: 'Điền "ng" hay "ngh" vào chỗ trống: ".....ôi sao" và ".....ề nghiệp"?',
        options: ['ngôi sao, nghề nghiệp', 'nghôi sao, nghề nghiệp', 'ngôi sao, ngề nghiệp', 'nghôi sao, ngề nghiệp'],
        correctIndex: 0,
        explanation: 'Trước "ô" dùng ng ("ngôi sao"); trước "ê" dùng ngh ("nghề nghiệp").',
      },
      {
        id: 'tv6-q6',
        questionType: 'Từ trái nghĩa',
        curriculumTag: 'Mở rộng vốn từ',
        prompt: 'Từ trái nghĩa với "sạch sẽ" là từ nào?',
        options: ['Gọn gàng', 'Bẩn thỉu', 'Thơm tho', 'Ngay ngắn'],
        correctIndex: 1,
        explanation: '"Sạch sẽ" trái nghĩa với "bẩn thỉu".',
      },
      {
        id: 'tv6-q7',
        questionType: 'Dấu câu',
        curriculumTag: 'Phân biệt dấu câu',
        prompt: 'Câu nào dưới đây là câu hỏi nên cần dùng dấu chấm hỏi (?) ở cuối câu?',
        options: ['Hôm nay trời nắng đẹp', 'Em đang viết bài tập', 'Bạn đã làm xong bài chưa', 'Cô giáo khen cả lớp'],
        correctIndex: 2,
        explanation: '"Bạn đã làm xong bài chưa?" là câu dùng để hỏi nên cuối câu có dấu chấm hỏi.',
      },
      {
        id: 'tv6-q8',
        questionType: 'Ghép vần',
        curriculumTag: 'Nhận biết vần ai / ay',
        prompt: 'Từ nào dưới đây viết đúng chính tả?',
        options: ['Đôi bàn tai', 'Máy bay giấy', 'Cái mắy tính', 'Quả vảy'],
        correctIndex: 1,
        explanation: '"Máy bay giấy" viết đúng chính tả. ("Đôi bàn tay", "Quả vải" mới đúng).',
      },
      {
        id: 'tv6-q9',
        questionType: 'Sắp xếp câu',
        curriculumTag: 'Sắp xếp từ thành câu',
        prompt: 'Sắp xếp các từ "con / vâng / lời / ông / bà" thành câu có nghĩa:',
        options: ['Ông bà vâng lời con.', 'Con vâng lời ông bà.', 'Lời ông bà con vâng.', 'Vâng con lời ông bà.'],
        correctIndex: 1,
        explanation: 'Câu đúng nghĩa và lễ phép là: "Con vâng lời ông bà."',
      },
      {
        id: 'tv6-q10',
        questionType: 'Chính tả viết hoa',
        curriculumTag: 'Viết hoa đầu câu',
        prompt: 'Khi viết một câu văn mới, chữ cái đầu tiên của câu phải viết như thế nào?',
        options: ['Viết thường', 'Viết hoa', 'Gạch chân', 'Không cần khoảng trắng'],
        correctIndex: 1,
        explanation: 'Quy tắc tiếng Việt: Chữ cái đầu tiên của mỗi câu luôn phải viết hoa.',
      },
    ],
  },
];

const EXTRA_VIETNAMESE_QUESTIONS: Question[] = [
  {
    id: 'tv-extra-1',
    questionType: 'Chính tả c/k',
    curriculumTag: 'Quy tắc c / k',
    prompt: 'Chọn từ viết đúng chính tả khi điền "c" hay "k": "cây .....éo" và ".....on mèo"?',
    options: ['cây kéo, con mèo', 'cây céo, con mèo', 'cây kéo, kon mèo', 'cây céo, kon mèo'],
    correctIndex: 0,
    explanation: 'Trước chữ "e" dùng k (cây kéo); trước chữ "o" dùng c (con mèo).',
  },
  {
    id: 'tv-extra-2',
    questionType: 'Chính tả g/gh',
    curriculumTag: 'Quy tắc g / gh',
    prompt: 'Từ nào viết đúng chính tả trong các từ sau?',
    options: ['Ghế gỗ', 'Gế gỗ', 'Ghà trống', 'Con ghà'],
    correctIndex: 0,
    explanation: 'Trước chữ "ê" viết "gh" (ghế gỗ), còn trước "a" viết "g" (gà trống).',
  },
  {
    id: 'tv-extra-3',
    questionType: 'Chính tả ng/ngh',
    curriculumTag: 'Quy tắc ng / ngh',
    prompt: 'Điền "ng" hay "ngh" vào chỗ trống: "lắng .....e" và "con .....an"?',
    options: ['lắng nghe, con ngan', 'lắng nge, con ngan', 'lắng nghe, con nghan', 'lắng nge, con nghan'],
    correctIndex: 0,
    explanation: 'Trước "e" dùng "ngh" (lắng nghe), trước "a" dùng "ng" (con ngan).',
  },
  {
    id: 'tv-extra-4',
    questionType: 'Bài tập hình ảnh',
    curriculumTag: 'Từ ngữ chỉ màu sắc',
    prompt: 'Quan sát ô màu bên dưới. Màu này giống màu của lá cây xanh tươi:',
    options: ['Màu xanh lá', 'Màu tím nhạt', 'Màu đỏ cam', 'Màu nâu đất'],
    correctIndex: 0,
    explanation: 'Ô màu hiển thị màu xanh lá cây.',
    visual: {
      kind: 'color-swatch',
      colorHex: '#16A34A',
      caption: 'Nhận biết màu sắc trong hình',
    },
  },
  {
    id: 'tv-extra-5',
    questionType: 'Bài tập hình ảnh',
    curriculumTag: 'Từ ngữ chỉ màu sắc',
    prompt: 'Quan sát ô màu bên dưới. Màu này giống màu của hoa hướng dương và mặt trời:',
    options: ['Màu vàng tươi', 'Màu xanh dương', 'Màu đen', 'Màu xám'],
    correctIndex: 0,
    explanation: 'Ô màu hiển thị màu vàng tươi.',
    visual: {
      kind: 'color-swatch',
      colorHex: '#FACC15',
      caption: 'Nhận biết màu sắc trong hình',
    },
  },
  {
    id: 'tv-extra-6',
    questionType: 'Bài tập hình ảnh',
    curriculumTag: 'Từ ngữ chỉ màu sắc',
    prompt: 'Quan sát ô màu bên dưới. Màu này giống màu của bầu trời trong xanh:',
    options: ['Màu xanh da trời', 'Màu đỏ thẫm', 'Màu vàng chanh', 'Màu nâu'],
    correctIndex: 0,
    explanation: 'Ô màu hiển thị màu xanh da trời (xanh dương).',
    visual: {
      kind: 'color-swatch',
      colorHex: '#0EA5E9',
      caption: 'Nhận biết màu sắc trong hình',
    },
  },
  {
    id: 'tv-extra-7',
    questionType: 'Thanh điệu',
    curriculumTag: 'Nhận diện thanh điệu',
    prompt: 'Tiếng "lớp" trong từ "lớp học" mang thanh gì?',
    options: ['Thanh sắc', 'Thanh huyền', 'Thanh hỏi', 'Thanh nặng'],
    correctIndex: 0,
    explanation: 'Tiếng "lớp" có dấu sắc trên chữ ơ nên mang thanh sắc.',
  },
  {
    id: 'tv-extra-8',
    questionType: 'Thanh điệu',
    curriculumTag: 'Nhận diện thanh điệu',
    prompt: 'Tiếng "phượng" trong từ "hoa phượng" mang thanh gì?',
    options: ['Thanh nặng', 'Thanh ngã', 'Thanh hỏi', 'Thanh huyền'],
    correctIndex: 0,
    explanation: 'Tiếng "phượng" có dấu chấm nặng bên dưới chữ ơ nên mang thanh nặng.',
  },
  {
    id: 'tv-extra-9',
    questionType: 'Ghép vần',
    curriculumTag: 'Vần oi / ôi / ơi',
    prompt: 'Từ nào dưới đây có tiếng chứa vần "ơi"?',
    options: ['Bầu trời', 'Con voi', 'Cái nồi', 'Củ tỏi'],
    correctIndex: 0,
    explanation: 'Tiếng "trời" có vần "ơi" (tr - ơi - trơi - huyền - trời).',
  },
  {
    id: 'tv-extra-10',
    questionType: 'Ghép vần',
    curriculumTag: 'Vần ao / au / âu',
    prompt: 'Từ nào dưới đây có tiếng chứa vần "âu"?',
    options: ['Quả dâu', 'Ngôi sao', 'Rau cải', 'Cái phao'],
    correctIndex: 0,
    explanation: 'Tiếng "dâu" có vần "âu" (d - âu - dâu).',
  },
  {
    id: 'tv-extra-11',
    questionType: 'Từ loại',
    curriculumTag: 'Từ chỉ hoạt động',
    prompt: 'Trong các từ sau, từ nào là từ chỉ hoạt động của học sinh ở lớp?',
    options: ['Đọc bài', 'Quyển vở', 'Bút chì', 'Bảng đen'],
    correctIndex: 0,
    explanation: '"Đọc bài" chỉ việc làm/hoạt động; các từ còn lại chỉ đồ vật.',
  },
  {
    id: 'tv-extra-12',
    questionType: 'Từ loại',
    curriculumTag: 'Từ chỉ sự vật',
    prompt: 'Từ nào dưới đây dùng để chỉ đồ dùng học tập?',
    options: ['Thước kẻ', 'Chạy nhảy', 'Chăm chỉ', 'Ca hát'],
    correctIndex: 0,
    explanation: '"Thước kẻ" là đồ dùng học tập của học sinh.',
  },
  {
    id: 'tv-extra-13',
    questionType: 'Đọc hiểu đoạn văn',
    curriculumTag: 'Đọc hiểu đoạn ngắn',
    prompt: 'Đọc đoạn: "Buổi sáng, gà trống gáy vang đánh thức cả xóm nhỏ. Ông mặt trời từ từ nhô lên sau rặng tre." — Con vật nào đã đánh thức cả xóm nhỏ?',
    options: ['Gà trống', 'Mèo mướp', 'Chú vịt con', 'Chim sâu'],
    correctIndex: 0,
    explanation: 'Câu đầu tiên nêu rõ: "gà trống gáy vang đánh thức cả xóm nhỏ".',
  },
  {
    id: 'tv-extra-14',
    questionType: 'Đọc hiểu đoạn văn',
    curriculumTag: 'Đọc hiểu đoạn ngắn',
    prompt: 'Đọc đoạn: "Bé Na rất thích tưới hoa ngoài ban công cùng bà vào mỗi buổi chiều mát." — Bé Na thường tưới hoa cùng ai?',
    options: ['Cùng bà', 'Cùng cô giáo', 'Cùng bạn Lan', 'Cùng chú bộ đội'],
    correctIndex: 0,
    explanation: 'Đoạn văn cho biết bé Na thích tưới hoa ngoài ban công "cùng bà".',
  },
  {
    id: 'tv-extra-15',
    questionType: 'Phân biệt s/x',
    curriculumTag: 'Chính tả s / x',
    prompt: 'Từ nào viết đúng chính tả dưới đây?',
    options: ['Dòng sông', 'Dòng xông', 'Sanh tươi', 'Xe xố'],
    correctIndex: 0,
    explanation: '"Dòng sông" viết đúng chính tả với chữ s.',
  },
  {
    id: 'tv-extra-16',
    questionType: 'Phân biệt tr/ch',
    curriculumTag: 'Chính tả tr / ch',
    prompt: 'Điền "tr" hay "ch" để được tên một loài chim hót hay: ".....im sơn ca"?',
    options: ['chim sơn ca', 'trim sơn ca', 'chim xơn ca', 'trim xơn ca'],
    correctIndex: 0,
    explanation: '"Chim sơn ca" viết đúng với âm đầu "ch".',
  },
  {
    id: 'tv-extra-17',
    questionType: 'Sắp xếp câu',
    curriculumTag: 'Sắp xếp từ thành câu',
    prompt: 'Sắp xếp các từ "em / yêu / trường / tiểu / học" thành câu hoàn chỉnh:',
    options: ['Em yêu trường tiểu học.', 'Trường tiểu học yêu em.', 'Yêu em trường tiểu học.', 'Học tiểu trường yêu em.'],
    correctIndex: 0,
    explanation: 'Câu đúng ngữ pháp và tự nhiên là: "Em yêu trường tiểu học."',
  },
  {
    id: 'tv-extra-18',
    questionType: 'Từ trái nghĩa',
    curriculumTag: 'Mở rộng vốn từ',
    prompt: 'Từ trái nghĩa với từ "vui vẻ" là từ nào?',
    options: ['Buồn bã', 'Hớn hở', 'Tươi cười', 'Chăm ngoan'],
    correctIndex: 0,
    explanation: '"Vui vẻ" trái nghĩa với "buồn bã".',
  },
  {
    id: 'tv-extra-19',
    questionType: 'Phân biệt l/n',
    curriculumTag: 'Chính tả l / n',
    prompt: 'Từ nào viết đúng chính tả dưới đây?',
    options: ['Lá cờ đỏ', 'Ná cờ đỏ', 'Quả na chín', 'Cái lồi cơm'],
    correctIndex: 0,
    explanation: '"Lá cờ đỏ" viết đúng chính tả (lưu ý "Quả na chín" cũng đúng nếu tách riêng, ở đây đáp án A đúng chuẩn).',
  },
  {
    id: 'tv-extra-20',
    questionType: 'Ghép vần',
    curriculumTag: 'Vần ươn / ương',
    prompt: 'Từ nào dưới đây có tiếng chứa vần "ương"?',
    options: ['Con đường', 'Cái gương', 'Khu vườn', 'Lượn bay'],
    correctIndex: 0,
    explanation: 'Tiếng "đường" chứa vần "ương" (đ - ương - đương - huyền - đường).',
  },
];

const TEXTBOOK_CYCLE: TextbookSeriesId[] = [
  'ket-noi-tri-thuc',
  'chan-troi-sang-tao',
  'canh-dieu',
  'tong-hop',
];

function buildHundredOfficialExams(): Exam[] {
  const mathCurated = CURATED_OFFICIAL_EXAMS.filter((e) => e.subject === 'toan');
  const tvCurated = CURATED_OFFICIAL_EXAMS.filter((e) => e.subject === 'tieng-viet');

  const allTvQuestionsPool: Question[] = [
    ...tvCurated.flatMap((ex) => ex.questions),
    ...EXTRA_VIETNAMESE_QUESTIONS,
  ];

  // Build 50 Toán Phép cộng & Phép trừ exams
  const mathExams: Exam[] = [...mathCurated];
  const mathTopicThemes = [
    'Phép cộng & Phép trừ phạm vi 10 qua hình ảnh',
    'Tính nhẩm phép cộng & phép trừ không nhớ',
    'Điền số vào ô trống & Dãy tính cộng trừ',
    'Phép cộng & Phép trừ phạm vi 20 chuẩn SGK',
    'So sánh phép tính & Toán cộng trừ có lời văn',
  ];

  for (let num = mathExams.length + 1; num <= 50; num++) {
    const rng = createSeededRng(202600 + num * 37);
    const tb = TEXTBOOK_CYCLE[(num - 1) % TEXTBOOK_CYCLE.length];
    const modeCycle = num % 3;
    const rangeMode: 'within10' | 'within20' | 'mixed' =
      modeCycle === 1 ? 'within10' : modeCycle === 2 ? 'within20' : 'mixed';
    const theme = mathTopicThemes[(num - 1) % mathTopicThemes.length];
    const questions = generateDynamicMathQuestions(10, rangeMode, rng, `toan50_${num}`);

    mathExams.push({
      id: `official-toan-de-${String(num).padStart(2, '0')}`,
      creatorId: 'official-curriculum',
      creatorName: 'Ban Biên Tập SGK Lớp 1',
      title: `Toán Lớp 1 — ${theme} (Đề số ${num})`,
      subject: 'toan',
      textbookSeries: tb,
      topic: `${theme} · Bám sát chương trình Lớp 1`,
      durationMinutes: 25,
      questionCount: questions.length,
      isOfficial: true,
      questions,
    });
  }

  // Build 50 Tiếng Việt exams
  const tvExams: Exam[] = [...tvCurated];
  const tvTopicThemes = [
    'Nhận diện âm, vần & Thanh điệu tiếng Việt',
    'Quy tắc chính tả c/k, g/gh, ng/ngh & s/x',
    'Đọc hiểu đoạn văn ngắn & Từ chỉ màu sắc',
    'Ghép vần, Từ chỉ sự vật & Sắp xếp câu',
    'Tổng hợp Tiếng Việt Lớp 1 cuối tuần',
  ];

  for (let num = tvExams.length + 1; num <= 50; num++) {
    const rng = createSeededRng(505800 + num * 53);
    const tb = TEXTBOOK_CYCLE[(num - 1) % TEXTBOOK_CYCLE.length];
    const theme = tvTopicThemes[(num - 1) % tvTopicThemes.length];
    const picked = shuffleArray(allTvQuestionsPool, rng)
      .slice(0, 10)
      .map((q, idx) => ({
        ...q,
        id: `tv50_${num}_q${idx + 1}`,
      }));

    tvExams.push({
      id: `official-tv-de-${String(num).padStart(2, '0')}`,
      creatorId: 'official-curriculum',
      creatorName: 'Ban Biên Tập SGK Lớp 1',
      title: `Tiếng Việt Lớp 1 — ${theme} (Đề số ${num})`,
      subject: 'tieng-viet',
      textbookSeries: tb,
      topic: `${theme} · Chuẩn GDPT 2018`,
      durationMinutes: 25,
      questionCount: picked.length,
      isOfficial: true,
      questions: picked,
    });
  }

  // Interleave or combine cleanly: total 100 official exams (50 Toán + 50 Tiếng Việt)
  return [...mathExams, ...tvExams];
}

export const OFFICIAL_EXAMS: Exam[] = buildHundredOfficialExams();

export const CURRICULUM_QUESTION_BANK: CurriculumQuestionItem[] = [
  ...OFFICIAL_EXAMS.slice(0, 14),
].flatMap((exam) =>
  exam.questions.map((q) => ({
    ...q,
    subject: exam.subject,
    textbookSeries: exam.textbookSeries,
  })),
);

export function shuffleQuestionOptions(question: Question): Question {
  const indexed = question.options.map((text, idx) => ({
    text,
    isCorrect: idx === question.correctIndex,
  }));
  const shuffled = shuffleArray(indexed);
  const newCorrectIndex = shuffled.findIndex((item) => item.isCorrect);
  return {
    ...question,
    options: [
      shuffled[0].text,
      shuffled[1].text,
      shuffled[2].text,
      shuffled[3].text,
    ],
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

export function prepareRandomizedExam(exam: Exam, randomizeOrder = true): Exam {
  if (!randomizeOrder) return exam;
  const randomizedQuestions = shuffleArray(exam.questions).map((q) =>
    shuffleQuestionOptions(q),
  );
  return {
    ...exam,
    questions: randomizedQuestions,
  };
}

export function pickRandomExamFromBank(
  subjectFilter: SubjectId | 'all',
  customExams: Exam[] = [],
): Exam {
  const pool = [...customExams, ...OFFICIAL_EXAMS].filter((ex) => {
    if (subjectFilter !== 'all' && ex.subject !== subjectFilter) return false;
    return true;
  });

  if (pool.length === 0) {
    return generateRandomGrade1Exam(subjectFilter, 'all', customExams, 10);
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];
  return prepareRandomizedExam(picked, true);
}

export function generateRandomGrade1Exam(
  subjectFilter: SubjectId | 'all',
  textbookFilter: TextbookSeriesId | 'all',
  customExams: Exam[] = [],
  questionCount = 10,
): Exam {
  const customItems: CurriculumQuestionItem[] = customExams
    .filter((ex) => ex.subject === 'toan' || ex.subject === 'tieng-viet')
    .flatMap((ex) =>
      ex.questions.map((q) => ({
        ...q,
        subject: ex.subject,
        textbookSeries: ex.textbookSeries,
      })),
    );

  // Build fresh dynamic Math questions (100% addition/subtraction)
  const dynamicMathPool = generateDynamicMathQuestions(questionCount, 'mixed');

  // Build Tiếng Việt pool from curated + extra + custom Vietnamese questions
  const tvCuratedPlusExtra: CurriculumQuestionItem[] = [
    ...CURRICULUM_QUESTION_BANK.filter((q) => q.subject === 'tieng-viet'),
    ...EXTRA_VIETNAMESE_QUESTIONS.map((q) => ({
      ...q,
      subject: 'tieng-viet' as const,
      textbookSeries: 'tong-hop' as const,
    })),
    ...customItems.filter((q) => q.subject === 'tieng-viet'),
  ];

  const tvPool = shuffleArray(
    tvCuratedPlusExtra.filter((q) => {
      if (textbookFilter !== 'all' && q.textbookSeries !== textbookFilter) return false;
      return true;
    }),
  );
  const fallbackTvPool = tvPool.length >= questionCount ? tvPool : shuffleArray(tvCuratedPlusExtra);

  let finalQuestions: Question[];
  if (subjectFilter === 'toan') {
    finalQuestions = dynamicMathPool.slice(0, questionCount);
  } else if (subjectFilter === 'tieng-viet') {
    finalQuestions = fallbackTvPool.slice(0, questionCount);
  } else {
    // Mixed Toán Cộng/Trừ (60%) + Tiếng Việt (40%)
    const mathCount = Math.ceil(questionCount * 0.6);
    const tvCount = questionCount - mathCount;
    finalQuestions = shuffleArray([
      ...dynamicMathPool.slice(0, mathCount),
      ...fallbackTvPool.slice(0, tvCount),
    ]);
  }

  const normalized = finalQuestions.map((item, idx) =>
    shuffleQuestionOptions({
      id: `rnd_${Date.now()}_${idx + 1}`,
      prompt: item.prompt,
      speechText: item.speechText,
      options: item.options,
      correctIndex: item.correctIndex,
      explanation: item.explanation,
      curriculumTag: item.curriculumTag,
      questionType: item.questionType,
      visual: item.visual,
    }),
  );

  const chosenSubject: SubjectId = subjectFilter === 'all' ? 'toan' : subjectFilter;
  const chosenTextbook: TextbookSeriesId =
    textbookFilter === 'all' ? 'tong-hop' : textbookFilter;

  const subjectLabel =
    subjectFilter === 'all'
      ? 'Tổng hợp Toán (Cộng & Trừ) & Tiếng Việt'
      : getSubjectMeta(chosenSubject).name;
  const tbLabel =
    textbookFilter === 'all' ? 'Chuẩn SGK mới nhất' : getTextbookMeta(chosenTextbook).shortName;

  return {
    id: `random_${chosenSubject}_${Date.now()}`,
    creatorId: 'random-generator',
    creatorName: 'Bộ đề trộn ngẫu nhiên',
    title: `Đề ngẫu nhiên — ${subjectLabel}`,
    subject: chosenSubject,
    textbookSeries: chosenTextbook,
    topic: `Đề mới tự sinh · Toán Cộng Trừ & Tiếng Việt (có câu hình ảnh) · ${tbLabel}`,
    durationMinutes: 25,
    questionCount: normalized.length,
    questions: normalized,
    isRandomMix: true,
  };
}
