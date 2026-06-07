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

function Tooth({ num, isSelected, onToggle }: { num: number; isSelected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={`Tooth #${num}`}
      className={`flex flex-col items-center justify-center w-8 h-10 sm:w-9 sm:h-11 rounded-md text-[11px] font-semibold border transition-colors ${
        isSelected
          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
          : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      {num}
    </button>
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

      <div className="flex flex-col items-center gap-2 py-2">
        {/* Upper arch */}
        <div className="flex gap-1">
          {UPPER_ARCH.map((n) => (
            <Tooth key={n} num={n} isSelected={selected.includes(n)} onToggle={() => toggle(n)} />
          ))}
        </div>
        <div className="w-full max-w-md border-t border-dashed border-slate-200" />
        {/* Lower arch */}
        <div className="flex gap-1">
          {LOWER_ARCH.map((n) => (
            <Tooth key={n} num={n} isSelected={selected.includes(n)} onToggle={() => toggle(n)} />
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400 mt-2">
        {selected.length === 0 ? 'Click teeth to select, or apply a template above' : `Selected: ${selected.join(', ')}`}
      </p>
    </div>
  );
}
