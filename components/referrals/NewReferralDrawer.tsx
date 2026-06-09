'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, Plus, Search, ChevronRight, ChevronLeft, CheckCircle2, UserPlus,
} from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { CURRENT_PRACTICE_ID, CURRENT_PROVIDER_ID } from '@/lib/current-user';
import ClinicalTemplateForm, { EMPTY_CLINICAL_DATA, type ClinicalData } from './ClinicalTemplateForm';
import OpenDentalPatientSearch, { type OpenDentalPatient } from './OpenDentalPatientSearch';

type PatientResult = { id: string; first_name: string; last_name: string; dob: string };
type PracticeResult = { id: string; name: string; city: string; state: string; specialty: string };
type ProviderResult = { id: string; first_name: string; last_name: string; specialty: string };
type Step = 1 | 2 | 3 | 4;
type SelectedPatient = { id: string; firstName: string; lastName: string; dob: string };
type NewPatient = { firstName: string; lastName: string; dob: string; phone: string; email: string };

function hasClinicalData(data: ClinicalData) {
  return (
    data.teeth.length > 0 ||
    data.procedures.length > 0 ||
    data.consultations.length > 0 ||
    data.implantTiming !== null ||
    data.antibioticPremedication !== null ||
    data.xrayStatus !== null ||
    data.implantBrand !== null ||
    data.caseNotes.trim().length > 0
  );
}

function fmtDob(dob: string) {
  return new Date(dob + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Step 1: Patient ──────────────────────────────────────────────────────────

function StepPatient({
  mode,
  query, onQueryChange,
  results, loading,
  selected, onSelect, onClear,
  newPatient, onNewChange,
  onStartNew, onBackToSearch,
  onODImport, odImported, odSearchOpen, onToggleODSearch,
}: {
  mode: 'search' | 'new';
  query: string;
  onQueryChange: (v: string) => void;
  results: PatientResult[];
  loading: boolean;
  selected: SelectedPatient | null;
  onSelect: (p: SelectedPatient) => void;
  onClear: () => void;
  newPatient: NewPatient;
  onNewChange: (field: string, value: string) => void;
  onStartNew: () => void;
  onBackToSearch: () => void;
  onODImport: (patient: OpenDentalPatient) => void;
  odImported: boolean;
  odSearchOpen: boolean;
  onToggleODSearch: () => void;
}) {
  const trimmedQuery = query.trim();

  return (
    <div className="space-y-5">
      {mode === 'search' ? (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">Who is this referral for?</p>
          {selected ? (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {selected.firstName[0]}{selected.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{selected.firstName} {selected.lastName}</p>
                <p className="text-xs text-slate-500">DOB: {fmtDob(selected.dob)}</p>
              </div>
              <button onClick={onClear} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by patient name…"
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Search for the patient first to avoid creating a duplicate record.
              </p>
              {loading && <p className="text-center text-xs text-slate-400 py-6">Searching…</p>}
              {!loading && results.length > 0 && (
                <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onSelect({ id: p.id, firstName: p.first_name, lastName: p.last_name, dob: p.dob })}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {p.first_name[0]}{p.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-slate-400">DOB: {fmtDob(p.dob)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!loading && trimmedQuery && results.length === 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-center text-xs text-slate-400 py-2">No patients matched “{trimmedQuery}”</p>
                  <button
                    onClick={onStartNew}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <UserPlus size={15} />
                    Add “{trimmedQuery}” as a new patient
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">New patient</p>
            <button
              onClick={onBackToSearch}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ChevronLeft size={13} />
              Back to search
            </button>
          </div>

          {/* Open Dental import */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={onToggleODSearch}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-medium text-slate-700">Import from Open Dental</span>
                {odImported && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={10} />
                    Imported
                  </span>
                )}
              </div>
              <ChevronRight
                size={14}
                className={`text-slate-400 transition-transform ${odSearchOpen ? 'rotate-90' : ''}`}
              />
            </button>
            {odSearchOpen && (
              <div className="px-4 pb-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 py-3">
                  Search your Open Dental database to auto-fill the form.
                </p>
                <OpenDentalPatientSearch onPatientSelect={onODImport} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" required>
              <input
                type="text"
                autoFocus
                value={newPatient.firstName}
                onChange={(e) => onNewChange('firstName', e.target.value)}
                placeholder="Jane"
                className="field-input"
              />
            </Field>
            <Field label="Last name" required>
              <input
                type="text"
                value={newPatient.lastName}
                onChange={(e) => onNewChange('lastName', e.target.value)}
                placeholder="Smith"
                className="field-input"
              />
            </Field>
          </div>
          <Field label="Date of birth" required>
            <input
              type="date"
              value={newPatient.dob}
              onChange={(e) => onNewChange('dob', e.target.value)}
              className="field-input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input
                type="tel"
                value={newPatient.phone}
                onChange={(e) => onNewChange('phone', e.target.value)}
                placeholder="(555) 000-0000"
                className="field-input"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={newPatient.email}
                onChange={(e) => onNewChange('email', e.target.value)}
                placeholder="jane@example.com"
                className="field-input"
              />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Recipient ────────────────────────────────────────────────────────

function StepRecipient({
  query, onQueryChange,
  results, loading,
  selected, onSelect, onClear,
  providers, selectedProviderId, onProviderChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  results: PracticeResult[];
  loading: boolean;
  selected: PracticeResult | null;
  onSelect: (p: PracticeResult) => void;
  onClear: () => void;
  providers: ProviderResult[];
  selectedProviderId: string;
  onProviderChange: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">Where are you sending this referral?</p>
        {selected ? (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              {selected.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{selected.name}</p>
              <p className="text-xs text-slate-500">{selected.specialty || 'General'} · {selected.city}, {selected.state}</p>
            </div>
            <button onClick={onClear} className="text-slate-400 hover:text-slate-600 p-1 mt-0.5">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search by practice name…"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {loading && <p className="text-center text-xs text-slate-400 py-6">Searching…</p>}
            {!loading && results.length > 0 && (
              <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold shrink-0">
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.specialty || 'General'} · {p.city}, {p.state}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {!loading && query && results.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">No practices found</p>
            )}
          </>
        )}
      </div>

      {selected && (
        <Field label="Assign to provider (optional)">
          <select
            value={selectedProviderId}
            onChange={(e) => onProviderChange(e.target.value)}
            className="field-input"
          >
            <option value="">Any available provider</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                Dr. {p.first_name} {p.last_name}{p.specialty ? ` — ${p.specialty}` : ''}
              </option>
            ))}
          </select>
          {providers.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">No providers on file for this practice.</p>
          )}
        </Field>
      )}
    </div>
  );
}

// ─── Step 3: Details ──────────────────────────────────────────────────────────

const PRIORITIES = [
  { value: 'low', label: 'Low', desc: 'No rush — schedule whenever convenient' },
  { value: 'normal', label: 'Normal', desc: 'Non-urgent, standard scheduling' },
  { value: 'high', label: 'High', desc: 'Within 1–2 weeks' },
  { value: 'urgent', label: 'Urgent', desc: 'Immediate attention needed' },
] as const;

function StepDetails({
  treatment, onTreatmentChange,
  priority, onPriorityChange,
  notes, onNotesChange,
}: {
  treatment: string;
  onTreatmentChange: (v: string) => void;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  onPriorityChange: (v: 'low' | 'normal' | 'high' | 'urgent') => void;
  notes: string;
  onNotesChange: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Field label="Treatment requested" required>
        <input
          type="text"
          autoFocus
          value={treatment}
          onChange={(e) => onTreatmentChange(e.target.value)}
          placeholder="e.g. Orthodontic evaluation, Root canal"
          className="field-input"
        />
      </Field>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">Priority</label>
        <div className="space-y-2">
          {PRIORITIES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onPriorityChange(value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                priority === value
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                priority === value ? 'border-blue-600' : 'border-slate-300'
              }`}>
                {priority === value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
              </div>
              <div>
                <p className={`text-sm font-medium ${priority === value ? 'text-blue-800' : 'text-slate-700'}`}>{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Field label="Clinical notes (optional)">
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Relevant history, X-ray findings, special instructions…"
          rows={4}
          className="field-input resize-none"
        />
      </Field>
    </div>
  );
}

// ─── Shared Field wrapper ─────────────────────────────────────────────────────

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

// ─── Main drawer ──────────────────────────────────────────────────────────────

export default function NewReferralDrawer() {
  const router = useRouter();
  const supabase = useRef(createSupabaseClient()).current;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 1 state
  const [patientMode, setPatientMode] = useState<'search' | 'new'>('search');
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<PatientResult[]>([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<SelectedPatient | null>(null);
  const [newPatient, setNewPatient] = useState<NewPatient>({ firstName: '', lastName: '', dob: '', phone: '', email: '' });
  const [odImported, setOdImported] = useState(false);
  const [odPatientId, setOdPatientId] = useState<number | null>(null);
  const [odSearchOpen, setOdSearchOpen] = useState(false);

  // Step 2 state
  const [practiceQuery, setPracticeQuery] = useState('');
  const [practiceResults, setPracticeResults] = useState<PracticeResult[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<PracticeResult | null>(null);
  const [providers, setProviders] = useState<ProviderResult[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState('');

  // Step 3 state
  const [treatment, setTreatment] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');

  // Step 4 state (optional clinical template)
  const [clinicalData, setClinicalData] = useState<ClinicalData>(EMPTY_CLINICAL_DATA);

  // Patient search debounce
  useEffect(() => {
    if (patientMode !== 'search' || !patientQuery.trim()) {
      setPatientResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setPatientLoading(true);
      const { data } = await supabase.rpc('search_patients', { p_query: patientQuery.trim() });
      setPatientResults(data ?? []);
      setPatientLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [patientQuery, patientMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Practice search debounce
  useEffect(() => {
    if (!practiceQuery.trim()) {
      setPracticeResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setPracticeLoading(true);
      const { data } = await supabase.rpc('search_practices', {
        p_query: practiceQuery.trim(),
        p_exclude_id: CURRENT_PRACTICE_ID,
      });
      setPracticeResults(data ?? []);
      setPracticeLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [practiceQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load providers when practice changes
  useEffect(() => {
    if (!selectedPractice) { setProviders([]); setSelectedProviderId(''); return; }
    supabase
      .rpc('get_providers_by_practice', { p_practice_id: selectedPractice.id })
      .then(({ data }) => setProviders(data ?? []));
  }, [selectedPractice]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleODImport(patient: OpenDentalPatient) {
    const dob = patient.Birthdate && !patient.Birthdate.startsWith('0001')
      ? patient.Birthdate.split('T')[0]
      : '';
    const phone = patient.WirelessPhone || patient.HmPhone || '';
    setNewPatient({
      firstName: patient.FName,
      lastName: patient.LName,
      dob,
      phone,
      email: patient.Email,
    });
    setOdImported(true);
    setOdPatientId(patient.PatNum);
    setOdSearchOpen(false);
    setPatientMode('new');
  }

  function reset() {
    setStep(1);
    setPatientMode('search');
    setPatientQuery('');
    setPatientResults([]);
    setPatientLoading(false);
    setSelectedPatient(null);
    setNewPatient({ firstName: '', lastName: '', dob: '', phone: '', email: '' });
    setOdImported(false);
    setOdPatientId(null);
    setOdSearchOpen(false);
    setPracticeQuery('');
    setPracticeResults([]);
    setPracticeLoading(false);
    setSelectedPractice(null);
    setProviders([]);
    setSelectedProviderId('');
    setTreatment('');
    setPriority('normal');
    setNotes('');
    setClinicalData(EMPTY_CLINICAL_DATA);
    setSuccess(false);
    setSubmitError(null);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  const step1Valid = patientMode === 'search'
    ? selectedPatient !== null
    : !!(newPatient.firstName.trim() && newPatient.lastName.trim() && newPatient.dob);
  const step2Valid = selectedPractice !== null;
  const step3Valid = treatment.trim().length > 0;

  async function handleSubmit() {
    if (!step3Valid || !step2Valid || !step1Valid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      let patientId: string;

      if (patientMode === 'search' && selectedPatient) {
        patientId = selectedPatient.id;
      } else {
        const { data, error } = await supabase.rpc('create_patient', {
          p_first_name: newPatient.firstName.trim(),
          p_last_name: newPatient.lastName.trim(),
          p_dob: newPatient.dob,
          p_practice_id: CURRENT_PRACTICE_ID,
          ...(newPatient.phone && { p_phone: newPatient.phone }),
          ...(newPatient.email && { p_email: newPatient.email }),
        });
        if (error || !data) throw new Error(error?.message ?? 'Failed to create patient');
        patientId = data;
      }

      const odNote = odPatientId ? `[Open Dental PatNum: ${odPatientId}]` : '';
      const fullNotes = [notes.trim(), odNote].filter(Boolean).join('\n');

      const { error: refError } = await supabase.rpc('create_referral', {
        p_patient_id: patientId,
        p_referring_practice_id: CURRENT_PRACTICE_ID,
        p_referring_provider_id: CURRENT_PROVIDER_ID,
        p_receiving_practice_id: selectedPractice!.id,
        p_treatment: treatment.trim(),
        p_priority: priority,
        ...(selectedProviderId && { p_receiving_provider_id: selectedProviderId }),
        ...(fullNotes && { p_notes: fullNotes }),
        ...(hasClinicalData(clinicalData) && { p_clinical_data: clinicalData }),
      });
      if (refError) throw new Error(refError.message);

      setSuccess(true);
      setTimeout(() => {
        close();
        router.refresh();
      }, 1800);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const stepLabel = step === 1 ? 'Patient' : step === 2 ? 'Recipient' : step === 3 ? 'Details' : 'Clinical Details';

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
      >
        <Plus size={16} />
        New Referral
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New Referral"
        className={`fixed inset-y-0 right-0 z-50 w-[480px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            {step > 1 && !success && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors -ml-1"
                aria-label="Go back"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-slate-900">New Referral</h2>
              {!success && (
                <p className="text-xs text-slate-400 mt-0.5">{stepLabel} — Step {step} of 4</p>
              )}
            </div>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        {!success && (
          <div className="flex px-6 pt-4 gap-1.5 shrink-0">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  s <= step ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Referral Sent</h3>
              <p className="text-sm text-slate-500 mt-1.5">
                {selectedPractice?.name} has been notified.
              </p>
            </div>
          ) : step === 1 ? (
            <StepPatient
              mode={patientMode}
              query={patientQuery}
              onQueryChange={setPatientQuery}
              results={patientResults}
              loading={patientLoading}
              selected={selectedPatient}
              onSelect={(p) => {
                setSelectedPatient(p);
                setPatientQuery('');
                setPatientResults([]);
              }}
              onClear={() => setSelectedPatient(null)}
              newPatient={newPatient}
              onNewChange={(field, value) => setNewPatient((prev) => ({ ...prev, [field]: value }))}
              onStartNew={() => {
                const [firstName, ...rest] = patientQuery.trim().split(/\s+/);
                setNewPatient({
                  firstName: firstName ?? '',
                  lastName: rest.join(' '),
                  dob: '',
                  phone: '',
                  email: '',
                });
                setPatientMode('new');
                setPatientQuery('');
                setPatientResults([]);
              }}
              onBackToSearch={() => {
                setPatientMode('search');
                setOdImported(false);
                setOdPatientId(null);
                setOdSearchOpen(false);
                setNewPatient({ firstName: '', lastName: '', dob: '', phone: '', email: '' });
              }}
              onODImport={handleODImport}
              odImported={odImported}
              odSearchOpen={odSearchOpen}
              onToggleODSearch={() => setOdSearchOpen((v) => !v)}
            />
          ) : step === 2 ? (
            <StepRecipient
              query={practiceQuery}
              onQueryChange={setPracticeQuery}
              results={practiceResults}
              loading={practiceLoading}
              selected={selectedPractice}
              onSelect={(p) => {
                setSelectedPractice(p);
                setPracticeQuery('');
                setPracticeResults([]);
              }}
              onClear={() => {
                setSelectedPractice(null);
                setProviders([]);
                setSelectedProviderId('');
              }}
              providers={providers}
              selectedProviderId={selectedProviderId}
              onProviderChange={setSelectedProviderId}
            />
          ) : step === 3 ? (
            <StepDetails
              treatment={treatment}
              onTreatmentChange={setTreatment}
              priority={priority}
              onPriorityChange={setPriority}
              notes={notes}
              onNotesChange={setNotes}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Clinical template (optional)</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add procedure and consultation details so the receiving provider can prepare in advance.
                </p>
              </div>
              <ClinicalTemplateForm data={clinicalData} onChange={setClinicalData} />
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/60 shrink-0">
            {submitError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                {submitError}
              </p>
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={close}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              {step < 4 ? (
                <button
                  disabled={step === 1 ? !step1Valid : step === 2 ? !step2Valid : step === 3 ? !step3Valid : false}
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Continue
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  disabled={!step3Valid || submitting}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors min-w-[130px] justify-center"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send Referral'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
