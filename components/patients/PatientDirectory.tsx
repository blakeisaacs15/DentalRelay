'use client';

import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, Search, Shield } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';

export type PatientRow = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  email: string | null;
  phone: string | null;
  insuranceProvider: string | null;
  referralCount: number;
  lastReferralAt: string | null;
  lastReferralStatus: string | null;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  archived: { label: 'Archived', className: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' },
};

const avatarColors = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
];

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDob(dob: string) {
  return new Date(dob + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  initialPatients: PatientRow[];
  practiceId: string;
}

export default function PatientDirectory({ initialPatients, practiceId }: Props) {
  const supabase = useRef(createSupabaseClient()).current;
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState(initialPatients);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase.rpc('get_patients_for_practice', {
        p_practice_id: practiceId,
        p_query: trimmed,
      });
      setPatients(
        (data ?? []).map((row) => ({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          dob: row.dob,
          email: row.email,
          phone: row.phone,
          insuranceProvider: row.insurance_provider,
          referralCount: Number(row.referral_count),
          lastReferralAt: row.last_referral_at,
          lastReferralStatus: row.last_referral_status,
        }))
      );
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patients by name…"
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Insurance</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Referrals</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Last Referral</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((patient, i) => {
              const initials = `${patient.firstName[0] ?? ''}${patient.lastName[0] ?? ''}`.toUpperCase();
              const colorClass = avatarColors[i % avatarColors.length];
              const statusStyle = patient.lastReferralStatus ? statusConfig[patient.lastReferralStatus] : null;

              return (
                <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${colorClass}`}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{patient.firstName} {patient.lastName}</p>
                        <p className="text-slate-400 text-xs">DOB {formatDob(patient.dob)}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="space-y-1">
                      {patient.email && (
                        <p className="flex items-center gap-1.5 text-slate-600 text-xs"><Mail size={12} className="text-slate-400" /> {patient.email}</p>
                      )}
                      {patient.phone && (
                        <p className="flex items-center gap-1.5 text-slate-600 text-xs"><Phone size={12} className="text-slate-400" /> {patient.phone}</p>
                      )}
                      {!patient.email && !patient.phone && <span className="text-slate-300 text-xs">—</span>}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    {patient.insuranceProvider ? (
                      <p className="flex items-center gap-1.5 text-slate-600 text-xs"><Shield size={12} className="text-slate-400" /> {patient.insuranceProvider}</p>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="text-slate-600">{patient.referralCount}</span>
                  </td>

                  <td className="px-5 py-3.5">
                    {statusStyle ? (
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                        <p className="text-slate-400 text-xs">{formatDate(patient.lastReferralAt)}</p>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">No referrals yet</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && patients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <p className="text-sm font-medium text-slate-600">
              {query.trim() ? `No patients matched "${query.trim()}"` : 'No patients yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {query.trim() ? 'Try a different name.' : 'Patients appear here once they’re added through a referral.'}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
          <p className="text-xs text-slate-400">
            {loading ? 'Searching…' : `Showing ${patients.length} patient${patients.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>
    </div>
  );
}
