'use client';

// Universal Numbering System: permanent teeth 1–32.
// Upper arch runs 1 → 16 left-to-right; lower arch runs 32 → 17 left-to-right,
// so each visual column lines up anatomically (tooth 1 sits above tooth 32, etc).
const UPPER_ARCH = Array.from({ length: 16 }, (_, i) => i + 1); // 1..16
const LOWER_ARCH = Array.from({ length: 16 }, (_, i) => 32 - i); // 32..17

export const TOOTH_PRESETS: Record<string, { label: string; teeth: number[] }> = {
  '4WT': { label: '4WT — Four Wisdom Teeth', teeth: [1, 16, 17, 32] },
};

interface Props {
  selected: number[];
  onChange: (teeth: number[]) => void;
}

const TOOTH_COUNT = 16;
const CENTER_X = 320;
const HALF_SPAN = 266;
const FAN_ANGLE = 28; // degrees of outward tilt for the end teeth
const CURVE_DEPTH = 36; // vertical rise/fall of the arch between center and end teeth
const UPPER_BASELINE = 96; // y of the upper-arch center teeth (nearest the bite line)
const LOWER_BASELINE = 164; // y of the lower-arch center teeth (nearest the bite line)
const MIDLINE_Y = 130;
const LABEL_OFFSET = 27;

// A simplified tooth silhouette: a rounded crown (biting surface) tapering to a
// single root tip. Drawn centered on the origin with the crown along +y, so the
// crown naturally lands on the arch curve and the root points away from it.
const TOOTH_PATH =
  'M -8,12.5 C -8,16 8,16 8,12.5 C 9,6 9,-2 6,-9 ' +
  'C 5,-13 2,-15.5 0,-15.5 C -2,-15.5 -5,-13 -6,-9 ' +
  'C -9,-2 -9,6 -8,12.5 Z';

// The six anterior teeth (canine-to-canine) sit at indices 5–10 in every row —
// the Universal Numbering System is symmetric within each arch, so this single
// rule covers both the upper and lower rows.
function isAnterior(index: number) {
  return index >= 5 && index <= 10;
}

function archU(index: number) {
  return (index - (TOOTH_COUNT - 1) / 2) / ((TOOTH_COUNT - 1) / 2);
}

function Tooth({
  num,
  index,
  baseline,
  curveSign,
  flip,
  isSelected,
  onToggle,
}: {
  num: number;
  index: number;
  baseline: number;
  curveSign: 1 | -1;
  flip: boolean;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const u = archU(index);
  const x = CENTER_X + u * HALF_SPAN;
  const y = baseline + curveSign * CURVE_DEPTH * u * u;
  const rotate = (flip ? -1 : 1) * u * FAN_ANGLE;
  const scaleX = isAnterior(index) ? 0.76 : 1;
  const scaleY = flip ? -1 : 1;

  function handleKeyDown(e: React.KeyboardEvent<SVGGElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }

  return (
    <g
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Tooth ${num}${isSelected ? ', selected' : ''}`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className="cursor-pointer outline-none group"
    >
      <g transform={`rotate(${rotate}) scale(${scaleX} ${scaleY})`}>
        <path
          d={TOOTH_PATH}
          strokeWidth={1.4}
          className={`transition-colors ${
            isSelected
              ? 'fill-blue-500 stroke-blue-600'
              : 'fill-white stroke-slate-300 group-hover:fill-blue-50 group-hover:stroke-blue-300 group-focus-visible:stroke-blue-400'
          }`}
        />
      </g>
      <text
        x={0}
        y={LABEL_OFFSET}
        textAnchor="middle"
        className={`text-[9px] font-semibold transition-colors ${isSelected ? 'fill-blue-700' : 'fill-slate-400'}`}
      >
        {num}
      </text>
    </g>
  );
}

function Arch({
  teeth,
  selected,
  onToggle,
  baseline,
  curveSign,
  flip,
}: {
  teeth: number[];
  selected: number[];
  onToggle: (n: number) => void;
  baseline: number;
  curveSign: 1 | -1;
  flip: boolean;
}) {
  return (
    <>
      {teeth.map((num, index) => (
        <Tooth
          key={num}
          num={num}
          index={index}
          baseline={baseline}
          curveSign={curveSign}
          flip={flip}
          isSelected={selected.includes(num)}
          onToggle={() => onToggle(num)}
        />
      ))}
    </>
  );
}

export default function ToothChart({ selected, onChange }: Props) {
  function toggle(num: number) {
    onChange(selected.includes(num) ? selected.filter((n) => n !== num) : [...selected, num].sort((a, b) => a - b));
  }

  function applyPreset(key: string) {
    onChange(TOOTH_PRESETS[key].teeth);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-700">Tooth chart</p>
        <div className="flex items-center gap-1.5">
          {Object.entries(TOOTH_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {preset.label}
            </button>
          ))}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <svg viewBox="0 0 640 260" className="w-full max-w-2xl mx-auto" role="group" aria-label="Dental arch chart — click a tooth to select it">
        <text x={CENTER_X} y={16} textAnchor="middle" className="text-[10px] font-medium fill-slate-300 uppercase tracking-widest">
          Upper arch
        </text>
        <line
          x1={CENTER_X - HALF_SPAN - 14}
          y1={MIDLINE_Y}
          x2={CENTER_X + HALF_SPAN + 14}
          y2={MIDLINE_Y}
          className="stroke-slate-200"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
        <Arch teeth={UPPER_ARCH} selected={selected} onToggle={toggle} baseline={UPPER_BASELINE} curveSign={-1} flip={false} />
        <Arch teeth={LOWER_ARCH} selected={selected} onToggle={toggle} baseline={LOWER_BASELINE} curveSign={1} flip={true} />
        <text x={CENTER_X} y={250} textAnchor="middle" className="text-[10px] font-medium fill-slate-300 uppercase tracking-widest">
          Lower arch
        </text>
      </svg>

      <p className="text-center text-[11px] text-slate-400 mt-1">
        {selected.length === 0 ? 'Click a tooth to select, or apply a template above' : `Selected: ${selected.join(', ')}`}
      </p>
    </div>
  );
}
