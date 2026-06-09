'use client';

import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import type { OpenDentalPatient } from '@/types/open-dental';

export type { OpenDentalPatient };

function fmtBirthdate(raw: string) {
  // OD returns "0001-01-01" when unset
  if (!raw || raw.startsWith('0001')) return 'DOB unknown';
  return new Date(raw + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function OpenDentalPatientSearch({
  onPatientSelect,
}: {
  onPatientSelect: (patient: OpenDentalPatient) => void;
}) {
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [dob, setDob] = useState('');
  const [results, setResults] = useState<OpenDentalPatient[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<'not_configured' | 'api_error' | null>(null);

  async function handleSearch() {
    if (!lName.trim() && !fName.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    const params = new URLSearchParams();
    if (lName.trim()) params.set('LName', lName.trim());
    if (fName.trim()) params.set('FName', fName.trim());
    if (dob) params.set('Birthdate', dob);

    try {
      const res = await fetch(`/api/open-dental/patients?${params.toString()}`);
      if (res.status === 503) {
        setError('not_configured');
        return;
      }
      if (!res.ok) {
        setError('api_error');
        return;
      }
      const data: OpenDentalPatient[] = await res.json();
      setResults(data);
    } catch {
      setError('api_error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="First name"
          value={fName}
          onChange={(e) => setFName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="field-input text-sm"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lName}
          onChange={(e) => setLName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="field-input text-sm"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="field-input text-sm flex-1"
          title="Date of birth (optional)"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || (!lName.trim() && !fName.trim())}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <Search size={14} />
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error === 'not_configured' && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-500" />
          <span>
            Open Dental is not connected yet.{' '}
            <a href="/integrations" className="font-medium underline underline-offset-2">
              Set it up in Settings &rsaquo; Integrations.
            </a>
          </span>
        </div>
      )}

      {error === 'api_error' && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>Could not reach Open Dental. Check your connection and credentials.</span>
        </div>
      )}

      {results !== null && results.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-2">No patients found in Open Dental.</p>
      )}

      {results && results.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          {results.map((p) => (
            <button
              key={p.PatNum}
              type="button"
              onClick={() => onPatientSelect(p)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold shrink-0">
                {p.FName?.[0] ?? '?'}{p.LName?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">
                  {p.FName} {p.LName}
                </p>
                <p className="text-xs text-slate-400">
                  {fmtBirthdate(p.Birthdate)} · Chart #{p.PatNum}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
