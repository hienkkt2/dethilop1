import {
  formatDurationVietnamese,
  getSubjectMeta,
  getTextbookMeta,
  getTrangNguyenHonor,
  SubjectId,
  TextbookSeriesId,
} from '../types/exam';

export interface CertificateDownloadPayload {
  studentName: string;
  examTitle: string;
  subject: SubjectId;
  textbookSeries: TextbookSeriesId;
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationSecondsUsed: number;
}

function slugifyFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

export function downloadCertificatePng(payload: CertificateDownloadPayload): boolean {
  if (typeof document === 'undefined') return false;

  const width = 1600;
  const height = 1120;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const honor = getTrangNguyenHonor(payload.score);
  const subjectMeta = getSubjectMeta(payload.subject);
  const textbookMeta = getTextbookMeta(payload.textbookSeries);
  const todayLabel = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  // 1. Warm ivory background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#FFFBEB');
  bgGrad.addColorStop(0.3, '#FFFDF7');
  bgGrad.addColorStop(0.7, '#FFFDF7');
  bgGrad.addColorStop(1, '#ECFDF5');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Outer gold frame
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 10;
  drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 28);
  ctx.stroke();

  // Inner subtle amber border
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 64, 64, width - 128, height - 128, 20);
  ctx.stroke();

  // Corner stars
  const corners = [
    [110, 110],
    [width - 110, 110],
    [110, height - 110],
    [width - 110, height - 110],
  ];
  ctx.fillStyle = '#F59E0B';
  corners.forEach(([cx, cy]) => {
    drawStar(ctx, cx, cy, 5, 16, 7);
    ctx.fill();
  });

  // 3. Top Medal Rosette
  ctx.fillStyle = '#FEF3C7';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(width / 2, 165, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#D97706';
  drawStar(ctx, width / 2, 165, 5, 32, 14);
  ctx.fill();

  // 4. Header Typography
  ctx.textAlign = 'center';
  ctx.fillStyle = '#065F46';
  ctx.font = '700 22px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText('BẢNG VÀNG TRẠNG NGUYÊN LỚP 1 · KHEN TẶNG SĨ TỬ CHĂM NGOAN', width / 2, 265);

  ctx.fillStyle = '#BE123C';
  ctx.font = '800 68px "Bricolage Grotesque", "Segoe UI", Arial, sans-serif';
  ctx.fillText('GIẤY KHEN TRẠNG NGUYÊN', width / 2, 355);

  ctx.fillStyle = '#57534E';
  ctx.font = '500 28px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText('Trân trọng tuyên dương em:', width / 2, 420);

  // 5. Student Name + Underline
  ctx.fillStyle = '#1C1917';
  ctx.font = '700 58px "Bricolage Grotesque", "Segoe UI", Arial, sans-serif';
  ctx.fillText(payload.studentName, width / 2, 502);

  const nameMetrics = ctx.measureText(payload.studentName);
  const lineHalf = Math.max(240, Math.min(540, nameMetrics.width / 2 + 50));
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - lineHalf, 526);
  ctx.lineTo(width / 2 + lineHalf, 526);
  ctx.stroke();

  // 6. Honor Statement
  ctx.fillStyle = '#BE123C';
  ctx.font = '700 28px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText(honor.certificatePhrase, width / 2, 592);

  ctx.fillStyle = '#1E293B';
  ctx.font = '600 26px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText(
    `Môn ${subjectMeta.shortName} (${textbookMeta.shortName}) · ${payload.examTitle}`,
    width / 2,
    640,
  );

  // 7. Metrics Box
  const boxW = 1040;
  const boxH = 176;
  const boxX = (width - boxW) / 2;
  const boxY = 696;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#FCD34D';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 20);
  ctx.fill();
  ctx.stroke();

  const colW = boxW / 3;
  // Dividers
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(boxX + colW, boxY + 28);
  ctx.lineTo(boxX + colW, boxY + boxH - 28);
  ctx.moveTo(boxX + colW * 2, boxY + 28);
  ctx.lineTo(boxX + colW * 2, boxY + boxH - 28);
  ctx.stroke();

  const drawMetric = (colIndex: number, label: string, value: string, color: string) => {
    const cx = boxX + colW * colIndex + colW / 2;
    ctx.fillStyle = '#64748B';
    ctx.font = '500 22px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
    ctx.fillText(label, cx, boxY + 58);

    ctx.fillStyle = color;
    ctx.font = '700 44px "IBM Plex Mono", "Segoe UI", Arial, sans-serif';
    ctx.fillText(value, cx, boxY + 122);
  };

  drawMetric(0, 'Điểm số', `${payload.score.toFixed(1)} / 10`, '#BE123C');
  drawMetric(1, 'Số câu đúng', `${payload.correctCount}/${payload.totalQuestions}`, '#0F172A');
  drawMetric(2, 'Thời gian làm', formatDurationVietnamese(payload.durationSecondsUsed), '#0369A1');

  // 8. Footer Line & Dates
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(180, 940);
  ctx.lineTo(width - 180, 940);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#475569';
  ctx.font = '500 24px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText(`Ngày cấp: ${todayLabel}`, 180, 995);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#92400E';
  ctx.font = '700 24px "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  ctx.fillText('Chứng nhận thành tích ôn luyện Lớp 1', width - 180, 995);

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  const safeName = slugifyFileName(payload.studentName) || 'be-lop-1';
  anchor.href = dataUrl;
  anchor.download = `giay-khen-${safeName}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  return true;
}
