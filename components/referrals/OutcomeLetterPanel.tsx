'use client';

import { useRef, useState } from 'react';
import { FileSignature } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';

export type OutcomeLetter = {
  id: string;
  treatmentPerformed: string;
  outcome: 'excellent' | 'good' | 'fair' | 'guarded';
  patientResponse: string | null;
  followUpRequired: boolean;
  followUpNotes: string | null;
  recommendations: string | null;
  signatureName: string;
  signedAt: string;
  providerName: string;
  providerSpecialty: string | null;
  practiceName: string;
};

const OUTCOMES = [
  { value: 'excellent', label: 'Excellent', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  { value: 'good', label: 'Good', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
  { value: 'fair', label: 'Fair', dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700' },
  { value: 'guarded', label: 'Guarded', dot: 'bg-red-400', badge: 'bg-red-50 text-red-700' },
] as const;

type OutcomeValue = (typeof OUTCOMES)[number]['value'];

type FormState = {
  treatmentPerformed: string;
  outcome: OutcomeValue | null;
  patientResponse: string;
  followUpRequired: 'yes' | 'no' | null;
  followUpNotes: string;
  recommendations: string;
  signatureName: string;
};

const EMPTY_FORM: FormState = {
  treatmentPerformed: '',
  outcome: null,
  patientResponse: '',
  followUpRequired: null,
  followUpNotes: '',
  recommendations: '',
  signatureName: '',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function initialsOf(name: string) {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function LetterCard({ letter, recipientName, recipientPractice }: {
  letter: OutcomeLetter;
  recipientName: string;
  recipientPractice: string;
}) {
  const outcomeStyle = OUTCOMES.find((o) => o.value === letter.outcome) ?? OUTCOMES[1];

  return (
    <div className="px-5 py-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Treatment outcome for {recipientName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{recipientPractice} · Signed {formatDate(letter.signedAt)}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${outcomeStyle.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${outcomeStyle.dot}`} />
          {outcomeStyle.label} response
        </span>
      </div>

      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Treatment performed</p>
          <p className="whitespace-pre-wrap">{letter.treatmentPerformed}</p>
        </div>
        {letter.patientResponse && (
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Patient response</p>
            <p className="whitespace-pre-wrap">{letter.patientResponse}</p>
          </div>
        )}
        {letter.followUpRequired && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-2.5 text-amber-800">
            <p className="text-xs font-semibold">Follow-up care recommended</p>
            {letter.followUpNotes && <p className="text-xs mt-0.5 whitespace-pre-wrap">{letter.followUpNotes}</p>}
          </div>
        )}
        {letter.recommendations && (
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Recommendations for ongoing care</p>
            <p className="whitespace-pre-wrap">{letter.recommendations}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
          {initialsOf(letter.providerName)}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] italic text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>{letter.signatureName}</p>
          <p className="text-xs text-slate-400 truncate">
            {letter.providerName}
            {letter.providerSpecialty ? ` · ${letter.providerSpecialty}` : ''} — {letter.practiceName}
          </p>
        </div>
      </div>
    </div>
  );
}

interface Props {
  referralId: string;
  recipientName: string;
  recipientPractice: string;
  initialLetters: OutcomeLetter[];
  currentProviderId: string;
}

export default function OutcomeLetterPanel({ referralId, recipientName, recipientPractice, initialLetters, currentProviderId }: Props) {
  const supabase = useRef(createSupabaseClient()).current;
  const [letters, setLetters] = useState(initialLetters);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(partial: Partial<FormState>) {
    setForm((f) => ({ ...f, ...partial }));
  }

  function cancel() {
    setComposing(false);
    setForm(EMPTY_FORM);
    setError(null);
  }

  const valid = form.treatmentPerformed.trim().length > 0 && form.outcome !== null && form.signatureName.trim().length > 0;

  async function handleSubmit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);

    const followUpRequired = form.followUpRequired === 'yes';
    const { data: id, error: rpcError } = await supabase.rpc('create_outcome_letter', {
      p_referral_id: referralId,
      p_provider_id: currentProviderId,
      p_treatment_performed: form.treatmentPerformed.trim(),
      p_outcome: form.outcome as string,
      p_signature_name: form.signatureName.trim(),
      p_follow_up_required: followUpRequired,
      ...(form.patientResponse.trim() && { p_patient_response: form.patientResponse.trim() }),
      ...(followUpRequired && form.followUpNotes.trim() && { p_follow_up_notes: form.followUpNotes.trim() }),
      ...(form.recommendations.trim() && { p_recommendations: form.recommendations.trim() }),
    });

    if (rpcError || !id) {
      setError(rpcError?.message ?? 'Failed to send the letter. Please try again.');
      setSubmitting(false);
      return;
    }

    setLetters((prev) => [
      {
        id,
        treatmentPerformed: form.treatmentPerformed.trim(),
        outcome: form.outcome as OutcomeValue,
        patientResponse: form.patientResponse.trim() || null,
        followUpRequired,
        followUpNotes: followUpRequired ? (form.followUpNotes.trim() || null) : null,
        recommendations: form.recommendations.trim() || null,
        signatureName: form.signatureName.trim(),
        signedAt: new Date().toISOString(),
        providerName: 'You',
        providerSpecialty: null,
        practiceName: '',
      },
      ...prev,
    ]);
    setSubmitting(false);
    cancel();
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">Outcome Letters</h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            Signed treatment summaries sent back to {recipientName} at {recipientPractice}
          </p>
        </div>
        {!composing && (
          <button
            onClick={() => setComposing(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
          >
            <FileSignature size={14} />
            Write Letter
          </button>
        )}
      </div>

      {composing && (
        <div className="px-5 py-5 border-b border-slate-100 bg-slate-50/60 space-y-4">
          <Field label="Treatment performed" required>
            <textarea
              autoFocus
              value={form.treatmentPerformed}
              onChange={(e) => patch({ treatmentPerformed: e.target.value })}
              placeholder="Summarize the procedure(s) completed for this patient…"
              rows={3}
              className="field-input resize-none"
            />
          </Field>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Patient response <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => patch({ outcome: o.value })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    form.outcome === o.value
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${o.dot}`} />
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Notes on patient response (optional)">
            <textarea
              value={form.patientResponse}
              onChange={(e) => patch({ patientResponse: e.target.value })}
              placeholder="e.g. Healing well at the two-week follow-up, no complications…"
              rows={2}
              className="field-input resize-none"
            />
          </Field>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Is follow-up care needed?</label>
            <div className="flex gap-2">
              {(['yes', 'no'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => patch({ followUpRequired: v, ...(v === 'no' && { followUpNotes: '' }) })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border capitalize transition-colors ${
                    form.followUpRequired === v
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {form.followUpRequired === 'yes' && (
              <textarea
                value={form.followUpNotes}
                onChange={(e) => patch({ followUpNotes: e.target.value })}
                placeholder="Describe the recommended follow-up (timing, what to watch for)…"
                rows={2}
                className="field-input resize-none mt-2"
              />
            )}
          </div>

          <Field label="Recommendations for ongoing care (optional)">
            <textarea
              value={form.recommendations}
              onChange={(e) => patch({ recommendations: e.target.value })}
              placeholder="Anything the referring provider should know going forward…"
              rows={2}
              className="field-input resize-none"
            />
          </Field>

          <div className="pt-1 border-t border-slate-200">
            <Field label="Electronic signature — type your full name to sign" required>
              <input
                type="text"
                value={form.signatureName}
                onChange={(e) => patch({ signatureName: e.target.value })}
                placeholder="Dr. Jane Smith, DDS"
                className="field-input italic"
                style={{ fontFamily: 'Georgia, serif' }}
              />
            </Field>
            <p className="text-[11px] text-slate-400 mt-1.5">
              By typing your name and sending, you certify this summary is accurate and complete.
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            <button onClick={cancel} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </button>
            <button
              disabled={!valid || submitting}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors min-w-[150px] justify-center"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <FileSignature size={14} />
                  Sign &amp; Send Letter
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {letters.length === 0 && !composing && (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <FileSignature size={18} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No outcome letters yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Once treatment is complete, write a signed summary to send back to {recipientName}.
            </p>
          </div>
        )}
        {letters.map((letter) => (
          <LetterCard key={letter.id} letter={letter} recipientName={recipientName} recipientPractice={recipientPractice} />
        ))}
      </div>
    </div>
  );
}
