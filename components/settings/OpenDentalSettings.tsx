'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { CURRENT_PRACTICE_ID } from '@/lib/current-user';

// Read-only fetch of current keys (anon client, no RLS issue for SELECT)
// Write goes through the admin-backed API route to bypass RLS

type ConnectionStatus = 'unknown' | 'connected' | 'disconnected' | 'testing';

export default function OpenDentalSettings() {
  const supabase = useRef(createSupabaseClient()).current;

  const [customerKey, setCustomerKey] = useState('');
  const [patientKey, setPatientKey] = useState('');
  const [showCustomer, setShowCustomer] = useState(false);
  const [showPatient, setShowPatient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('unknown');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from('practices')
      .select('open_dental_customer_key, open_dental_patient_key')
      .eq('id', CURRENT_PRACTICE_ID)
      .single()
      .then(({ data }) => {
        if (data?.open_dental_customer_key) setCustomerKey(data.open_dental_customer_key);
        if (data?.open_dental_patient_key) setPatientKey(data.open_dental_patient_key);
        if (data?.open_dental_customer_key && data?.open_dental_patient_key) {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
        setLoaded(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const res = await fetch(`/api/practices/${CURRENT_PRACTICE_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        open_dental_customer_key: customerKey.trim() || null,
        open_dental_patient_key: patientKey.trim() || null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSaveError(data.error ?? 'Failed to save credentials.');
      return;
    }

    setSaved(true);
    setStatus(customerKey.trim() && patientKey.trim() ? 'connected' : 'disconnected');
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTest() {
    setStatus('testing');
    try {
      const res = await fetch('/api/open-dental/patients?LName=Test');
      if (res.status === 503) {
        setStatus('disconnected');
      } else if (res.ok || res.status === 400) {
        // 400 means the API is reachable and credentials are valid; 400 is just a param issue
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch {
      setStatus('disconnected');
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 p-6 text-slate-400 text-sm">
        <Loader2 size={15} className="animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        {status === 'connected' && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} />
            Connected
          </span>
        )}
        {status === 'disconnected' && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            <XCircle size={12} />
            Not connected
          </span>
        )}
        {status === 'testing' && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
            <Loader2 size={12} className="animate-spin" />
            Testing connection…
          </span>
        )}
        {status === 'unknown' && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 px-2.5 py-1 rounded-full">
            Status unknown
          </span>
        )}
      </div>

      <p className="text-sm text-slate-500">
        Connect your Open Dental database to import patient records directly when sending referrals.
        Find your API keys in Open Dental under{' '}
        <span className="font-medium text-slate-700">Setup &rsaquo; eServices &rsaquo; Open Dental API</span>.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Customer Key
          </label>
          <div className="relative">
            <input
              type={showCustomer ? 'text' : 'password'}
              value={customerKey}
              onChange={(e) => setCustomerKey(e.target.value)}
              placeholder="Enter your Customer Key"
              className="field-input pr-10"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowCustomer((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showCustomer ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Patient Key
          </label>
          <div className="relative">
            <input
              type={showPatient ? 'text' : 'password'}
              value={patientKey}
              onChange={(e) => setPatientKey(e.target.value)}
              placeholder="Enter your Patient Key"
              className="field-input pr-10"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPatient((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPatient ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
      </div>

      {saveError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {saveError}
        </p>
      )}

      {saved && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Credentials saved.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save credentials'}
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={status === 'testing' || !customerKey.trim() || !patientKey.trim()}
          className="px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 rounded-lg transition-colors"
        >
          Test connection
        </button>
      </div>
    </div>
  );
}
