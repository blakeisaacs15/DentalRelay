'use client';

import ToothChart from './ToothChart';

export type ClinicalData = {
  teeth: number[];
  procedures: string[];
  consultations: string[];
  implantTiming: 'immediate' | 'delayed' | null;
  antibioticPremedication: 'yes' | 'no' | null;
  xrayStatus: string | null;
  implantBrand: string | null;
  caseNotes: string;
};

export const EMPTY_CLINICAL_DATA: ClinicalData = {
  teeth: [],
  procedures: [],
  consultations: [],
  implantTiming: null,
  antibioticPremedication: null,
  xrayStatus: null,
  implantBrand: null,
  caseNotes: '',
};

const PROCEDURES = [
  'Extraction', 'Alveoloplasty', 'Biopsy', 'Incision and Drainage', 'Lesion Evaluation',
  'Exposure', 'Hard Tissue', 'Infection', 'Frenectomy', 'Apicoectomy', 'Soft Tissue',
];

const CONSULTATIONS = [
  'TMJ', 'Implants', 'Orthognathic Evaluation', 'Pre-Prosthetic',
  'Cosmetic', 'Ridge Augmentation', 'Bone Grafting',
];

const XRAY_STATUSES = [
  'Being Mailed', 'Given to Patient', 'Please Take', 'Attached with Referral',
];

const IMPLANT_BRANDS = [
  'Biomet 3i', 'Astra', 'BioHorizon', 'Implant Direct', 'Implant Innovations',
  'Keystone / Lifecore', 'MiS', 'Nobel BioCare', 'Straumann', 'Zimmer', 'Other',
];

function Checkbox({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
        checked
          ? 'border-blue-300 bg-blue-50 text-blue-800'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      <span
        className={`flex items-center justify-center w-4 h-4 rounded border-2 shrink-0 transition-colors ${
          checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3">
            <path d="M3 8.5L6.5 12L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">{title}</p>
      {children}
    </div>
  );
}

interface Props {
  data: ClinicalData;
  onChange: (data: ClinicalData) => void;
}

export default function ClinicalTemplateForm({ data, onChange }: Props) {
  function patch(partial: Partial<ClinicalData>) {
    onChange({ ...data, ...partial });
  }

  function toggleInList(key: 'procedures' | 'consultations', value: string) {
    const list = data[key];
    const wasChecked = list.includes(value);
    const next = wasChecked ? list.filter((v) => v !== value) : [...list, value];

    // Clear implant timing when "Implants" is unchecked
    const clearImplantTiming = key === 'consultations' && value === 'Implants' && wasChecked;
    onChange({
      ...data,
      [key]: next,
      ...(clearImplantTiming && { implantTiming: null }),
    });
  }

  const implantsSelected = data.consultations.includes('Implants');

  return (
    <div className="space-y-6">
      <Section title="Tooth Chart">
        <ToothChart selected={data.teeth} onChange={(teeth) => patch({ teeth })} />
      </Section>

      <Section title="Procedures">
        <div className="grid grid-cols-2 gap-2">
          {PROCEDURES.map((p) => (
            <Checkbox key={p} label={p} checked={data.procedures.includes(p)} onToggle={() => toggleInList('procedures', p)} />
          ))}
        </div>
      </Section>

      <Section title="Consultations">
        <div className="grid grid-cols-2 gap-2">
          {CONSULTATIONS.map((c) => (
            <Checkbox key={c} label={c} checked={data.consultations.includes(c)} onToggle={() => toggleInList('consultations', c)} />
          ))}
        </div>
        {implantsSelected && (
          <div className="mt-2.5 ml-1 flex items-center gap-2">
            <span className="text-xs text-slate-500">Implant timing:</span>
            {(['immediate', 'delayed'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => patch({ implantTiming: data.implantTiming === t ? null : t })}
                className={`px-3 py-1 text-xs font-medium rounded-md border capitalize transition-colors ${
                  data.implantTiming === t
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </Section>

      <div className="grid grid-cols-2 gap-6">
        <Section title="Antibiotic Pre-medication">
          <div className="flex gap-2">
            {(['yes', 'no'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => patch({ antibioticPremedication: data.antibioticPremedication === v ? null : v })}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border capitalize transition-colors ${
                  data.antibioticPremedication === v
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </Section>

        <Section title="X-ray Status">
          <select
            value={data.xrayStatus ?? ''}
            onChange={(e) => patch({ xrayStatus: e.target.value || null })}
            className="field-input"
          >
            <option value="">Select status…</option>
            {XRAY_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Section>
      </div>

      {implantsSelected && (
        <Section title="Implant Brand">
          <select
            value={data.implantBrand ?? ''}
            onChange={(e) => patch({ implantBrand: e.target.value || null })}
            className="field-input"
          >
            <option value="">Select brand…</option>
            {IMPLANT_BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </Section>
      )}

      <Section title="Case Notes">
        <textarea
          value={data.caseNotes}
          onChange={(e) => patch({ caseNotes: e.target.value })}
          placeholder="Additional clinical context for the receiving provider…"
          rows={4}
          className="field-input resize-none"
        />
      </Section>
    </div>
  );
}
