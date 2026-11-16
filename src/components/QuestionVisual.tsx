import { QuestionVisualSpec } from '../types/exam';

interface QuestionVisualProps {
  visual: QuestionVisualSpec;
}

function ItemGlyph({
  type,
  x,
  y,
  crossed = false,
}: {
  type: 'apple' | 'star' | 'flower' | 'cube' | 'balloon';
  x: number;
  y: number;
  crossed?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {type === 'apple' && (
        <>
          <circle cx="16" cy="18" r="12" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
          <path d="M16 6 C16 2, 21 2, 22 5" stroke="#15803D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="19" cy="5" rx="4" ry="2.2" fill="#22C55E" />
        </>
      )}
      {type === 'star' && (
        <polygon
          points="16,3 19.8,11.5 29,12.4 22,18.6 24,27.5 16,22.8 8,27.5 10,18.6 3,12.4 12.2,11.5"
          fill="#FACC15"
          stroke="#CA8A04"
          strokeWidth="1.5"
        />
      )}
      {type === 'flower' && (
        <>
          <circle cx="16" cy="8" r="5" fill="#F472B6" />
          <circle cx="24" cy="14" r="5" fill="#F472B6" />
          <circle cx="21" cy="23" r="5" fill="#F472B6" />
          <circle cx="11" cy="23" r="5" fill="#F472B6" />
          <circle cx="8" cy="14" r="5" fill="#F472B6" />
          <circle cx="16" cy="16" r="4.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
        </>
      )}
      {type === 'cube' && (
        <>
          <rect x="4" y="6" width="22" height="22" rx="3" fill="#0EA5E9" stroke="#0369A1" strokeWidth="1.5" />
          <line x1="9" y1="11" x2="21" y2="11" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {type === 'balloon' && (
        <>
          <ellipse cx="16" cy="14" rx="10" ry="12" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <path d="M16 26 Q14 30 17 33" stroke="#64748B" strokeWidth="1.5" fill="none" />
        </>
      )}
      {crossed && (
        <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="3" x2="29" y2="29" />
          <line x1="29" y1="3" x2="3" y2="29" />
        </g>
      )}
    </g>
  );
}

export default function QuestionVisual({ visual }: QuestionVisualProps) {
  return (
    <div className="my-4 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center">
      {visual.kind === 'counting-addition' && (
        <svg
          viewBox="0 0 420 120"
          className="w-full max-w-md h-auto"
          role="img"
          aria-label={visual.caption || `Nhóm thứ nhất có ${visual.leftCount} và nhóm thứ hai có ${visual.rightCount}`}
        >
          <rect x="8" y="10" width="170" height="92" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          {Array.from({ length: visual.leftCount }).map((_, idx) => {
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            return (
              <ItemGlyph
                key={`l-${idx}`}
                type={visual.itemType}
                x={20 + col * 38}
                y={18 + row * 38}
              />
            );
          })}
          <text x="210" y="64" textAnchor="middle" fontSize="28" fontWeight="700" fill="#0284C7">
            +
          </text>
          <rect x="242" y="10" width="170" height="92" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          {Array.from({ length: visual.rightCount }).map((_, idx) => {
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            return (
              <ItemGlyph
                key={`r-${idx}`}
                type={visual.itemType}
                x={254 + col * 38}
                y={18 + row * 38}
              />
            );
          })}
        </svg>
      )}

      {visual.kind === 'counting-subtraction' && (
        <svg
          viewBox="0 0 420 110"
          className="w-full max-w-md h-auto"
          role="img"
          aria-label={
            visual.caption ||
            `Có tất cả ${visual.totalCount} hình, đã gạch bớt ${visual.crossedCount} hình`
          }
        >
          <rect x="10" y="10" width="400" height="88" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          {Array.from({ length: visual.totalCount }).map((_, idx) => {
            const col = idx % 6;
            const row = Math.floor(idx / 6);
            const isCrossed = idx >= visual.totalCount - visual.crossedCount;
            return (
              <ItemGlyph
                key={idx}
                type={visual.itemType}
                x={26 + col * 62}
                y={16 + row * 38}
                crossed={isCrossed}
              />
            );
          })}
        </svg>
      )}

      {visual.kind === 'shapes' && (
        <svg
          viewBox="0 0 420 120"
          className="w-full max-w-md h-auto"
          role="img"
          aria-label={visual.caption || 'Hình minh họa các hình học phẳng'}
        >
          <rect x="6" y="8" width="408" height="104" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          {visual.items.map((item, idx) => {
            const step = 408 / visual.items.length;
            const cx = 6 + step * idx + step / 2;
            const cy = 54;
            return (
              <g key={idx}>
                {item.shape === 'triangle' && (
                  <polygon
                    points={`${cx},${cy - 26} ${cx - 26},${cy + 22} ${cx + 26},${cy + 22}`}
                    fill={item.color}
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                )}
                {item.shape === 'square' && (
                  <rect
                    x={cx - 22}
                    y={cy - 22}
                    width="44"
                    height="44"
                    fill={item.color}
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                )}
                {item.shape === 'circle' && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="23"
                    fill={item.color}
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                )}
                {item.shape === 'rectangle' && (
                  <rect
                    x={cx - 32}
                    y={cy - 18}
                    width="64"
                    height="36"
                    fill={item.color}
                    stroke="#0F172A"
                    strokeWidth="1.5"
                  />
                )}
                {item.label && (
                  <text
                    x={cx}
                    y={98}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#334155"
                  >
                    {item.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}

      {visual.kind === 'clock' && (() => {
        const hourAngle = ((visual.hour % 12) + visual.minute / 60) * 30 - 90;
        const minuteAngle = visual.minute * 6 - 90;
        const hourRad = (hourAngle * Math.PI) / 180;
        const minRad = (minuteAngle * Math.PI) / 180;
        const hx = 100 + 36 * Math.cos(hourRad);
        const hy = 100 + 36 * Math.sin(hourRad);
        const mx = 100 + 54 * Math.cos(minRad);
        const my = 100 + 54 * Math.sin(minRad);

        return (
          <svg
            viewBox="0 0 200 200"
            className="w-44 h-44"
            role="img"
            aria-label={visual.caption || `Mặt đồng hồ chỉ ${visual.hour} giờ`}
          >
            <circle cx="100" cy="100" r="88" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
            <circle cx="100" cy="100" r="80" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            {Array.from({ length: 12 }).map((_, i) => {
              const num = i === 0 ? 12 : i;
              const angle = ((i * 30 - 90) * Math.PI) / 180;
              const nx = 100 + 64 * Math.cos(angle);
              const ny = 100 + 64 * Math.sin(angle) + 5;
              return (
                <text
                  key={num}
                  x={nx}
                  y={ny}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill="#0F172A"
                >
                  {num}
                </text>
              );
            })}
            {/* Hour hand (short, bold) */}
            <line
              x1="100"
              y1="100"
              x2={hx}
              y2={hy}
              stroke="#0F172A"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Minute hand (long, blue) */}
            <line
              x1="100"
              y1="100"
              x2={mx}
              y2={my}
              stroke="#0284C7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="5" fill="#0284C7" />
          </svg>
        );
      })()}

      {visual.kind === 'ruler' && (() => {
        const pxPerCm = 34;
        const startX = 36;
        const lengthPx = visual.lengthCm * pxPerCm;
        return (
          <svg
            viewBox="0 0 420 120"
            className="w-full max-w-md h-auto"
            role="img"
            aria-label={visual.caption || `Đo vật dài ${visual.lengthCm} cm trên thước kẻ`}
          >
            {/* Object to measure */}
            {visual.objectType === 'pencil' && (
              <g>
                <rect
                  x={startX}
                  y="24"
                  width={Math.max(20, lengthPx - 16)}
                  height="18"
                  rx="2"
                  fill="#FACC15"
                  stroke="#CA8A04"
                  strokeWidth="1.5"
                />
                <polygon
                  points={`${startX + Math.max(20, lengthPx - 16)},24 ${startX + lengthPx},33 ${startX + Math.max(20, lengthPx - 16)},42`}
                  fill="#FDE68A"
                  stroke="#CA8A04"
                  strokeWidth="1.5"
                />
                <polygon
                  points={`${startX + lengthPx - 5},30 ${startX + lengthPx},33 ${startX + lengthPx - 5},36`}
                  fill="#1E293B"
                />
              </g>
            )}
            {visual.objectType === 'crayon' && (
              <rect
                x={startX}
                y="24"
                width={lengthPx}
                height="18"
                rx="4"
                fill="#0EA5E9"
                stroke="#0369A1"
                strokeWidth="1.5"
              />
            )}
            {visual.objectType === 'ribbon' && (
              <rect
                x={startX}
                y="26"
                width={lengthPx}
                height="14"
                rx="2"
                fill="#EC4899"
                stroke="#BE185D"
                strokeWidth="1.5"
              />
            )}

            {/* Ruler */}
            <rect
              x="20"
              y="56"
              width="380"
              height="44"
              rx="4"
              fill="#FEF3C7"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            {Array.from({ length: 11 }).map((_, cm) => {
              const tx = startX + cm * pxPerCm;
              return (
                <g key={cm}>
                  <line x1={tx} y1="56" x2={tx} y2="74" stroke="#78350F" strokeWidth="1.5" />
                  <text
                    x={tx}
                    y="91"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="#78350F"
                  >
                    {cm}
                  </text>
                </g>
              );
            })}
            <text x="392" y="91" textAnchor="end" fontSize="11" fontWeight="600" fill="#92400E">
              cm
            </text>
          </svg>
        );
      })()}

      {visual.kind === 'compare-groups' && (
        <svg
          viewBox="0 0 420 120"
          className="w-full max-w-md h-auto"
          role="img"
          aria-label={visual.caption || `So sánh nhóm bên trái ${visual.leftCount} và bên phải ${visual.rightCount}`}
        >
          <rect x="8" y="10" width="166" height="94" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          {Array.from({ length: visual.leftCount }).map((_, idx) => {
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            return (
              <ItemGlyph
                key={`cl-${idx}`}
                type={visual.itemType}
                x={18 + col * 38}
                y={18 + row * 38}
              />
            );
          })}
          <rect x="190" y="36" width="40" height="40" rx="8" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <text x="210" y="63" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0369A1">
            ?
          </text>
          <rect x="246" y="10" width="166" height="94" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          {Array.from({ length: visual.rightCount }).map((_, idx) => {
            const col = idx % 4;
            const row = Math.floor(idx / 4);
            return (
              <ItemGlyph
                key={`cr-${idx}`}
                type={visual.itemType}
                x={256 + col * 38}
                y={18 + row * 38}
              />
            );
          })}
        </svg>
      )}

      {visual.kind === 'traffic-light' && (
        <svg
          viewBox="0 0 120 170"
          className="w-28 h-40"
          role="img"
          aria-label={visual.caption || `Đèn giao thông đang bật đèn ${visual.activeColor}`}
        >
          <rect x="24" y="10" width="72" height="148" rx="16" fill="#1E293B" />
          <circle
            cx="60"
            cy="42"
            r="18"
            fill={visual.activeColor === 'red' ? '#EF4444' : '#475569'}
            stroke="#0F172A"
            strokeWidth="2"
          />
          <circle
            cx="60"
            cy="84"
            r="18"
            fill={visual.activeColor === 'yellow' ? '#FACC15' : '#475569'}
            stroke="#0F172A"
            strokeWidth="2"
          />
          <circle
            cx="60"
            cy="126"
            r="18"
            fill={visual.activeColor === 'green' ? '#22C55E' : '#475569'}
            stroke="#0F172A"
            strokeWidth="2"
          />
        </svg>
      )}

      {visual.kind === 'color-swatch' && (
        <div className="flex flex-col items-center gap-2 py-2">
          <div
            className="w-28 h-20 rounded-xl border-2 border-slate-300 shadow-sm"
            style={{ backgroundColor: visual.colorHex }}
            role="img"
            aria-label={visual.caption || 'Ô màu sắc minh họa'}
          />
        </div>
      )}

      {visual.caption && (
        <p className="mt-2 text-xs font-medium text-slate-600 text-center">{visual.caption}</p>
      )}
    </div>
  );
}
