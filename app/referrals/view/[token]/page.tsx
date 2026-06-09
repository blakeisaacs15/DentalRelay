import { notFound } from 'next/navigation';
import { Calendar, MapPin, Phone, Mail, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

type PageProps = { params: Promise<{ token: string }> };

type ReferralRow = {
  referral_id: string;
  treatment: string;
  priority: string;
  notes: string | null;
  created_at: string;
  status: string;
  patient_first: string;
  patient_last: string;
  patient_dob: string;
  from_practice_name: string;
  from_practice_city: string | null;
  from_practice_state: string | null;
  from_practice_phone: string | null;
  from_practice_email: string | null;
  from_provider_first: string;
  from_provider_last: string;
  from_provider_specialty: string | null;
  to_practice_name: string;
};

const priorityConfig: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: 'Urgent',        bg: 'bg-red-50',    text: 'text-red-700'    },
  high:   { label: 'High Priority', bg: 'bg-amber-50',  text: 'text-amber-700'  },
  normal: { label: 'Normal',        bg: 'bg-blue-50',   text: 'text-blue-700'   },
  low:    { label: 'Low Priority',  bg: 'bg-slate-100', text: 'text-slate-500'  },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  new:         { label: 'Awaiting Review', icon: <Clock size={14} className="text-blue-500" /> },
  in_progress: { label: 'In Progress',     icon: <Clock size={14} className="text-amber-500" /> },
  completed:   { label: 'Completed',       icon: <CheckCircle2 size={14} className="text-emerald-500" /> },
  archived:    { label: 'Archived',        icon: <AlertTriangle size={14} className="text-slate-400" /> },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtDob(dob: string) {
  return new Date(dob + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function PublicReferralView({ params }: PageProps) {
  const { token } = await params;
  const admin = createSupabaseAdminClient();

  const { data: rows } = await admin.rpc('get_public_referral_by_token', { p_token: token });
  const r = (rows as ReferralRow[] | null)?.[0];
  if (!r) notFound();

  const priority = priorityConfig[r.priority] ?? priorityConfig.normal;
  const status   = statusConfig[r.status]     ?? statusConfig.new;
  const location = [r.from_practice_city, r.from_practice_state].filter(Boolean).join(', ');
  const replyTo  = r.from_practice_email
    ? `mailto:${r.from_practice_email}?subject=Re: Referral — ${r.patient_first} ${r.patient_last}&body=Regarding your referral for ${r.patient_first} ${r.patient_last}:%0A%0A`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            Dental<span className="text-blue-600">Relay</span>
          </span>
          <a
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Create free account →
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-5">

        {/* Status + priority row */}
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${priority.bg} ${priority.text}`}>
            {priority.label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
            {status.icon}
            {status.label}
          </span>
          <span className="ml-auto text-xs text-slate-400">Sent {fmt(r.created_at)}</span>
        </div>

        {/* Patient card */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-5">
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-1">Patient</p>
            <h1 className="text-white text-2xl font-bold">{r.patient_first} {r.patient_last}</h1>
            <p className="text-blue-100 text-sm mt-1">DOB: {fmtDob(r.patient_dob)}</p>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Treatment Requested</p>
            <p className="text-slate-900 text-lg font-semibold">{r.treatment}</p>
          </div>
        </div>

        {/* Notes */}
        {r.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">Clinical Notes</p>
            <p className="text-amber-900 text-sm leading-relaxed whitespace-pre-wrap">{r.notes}</p>
          </div>
        )}

        {/* Referring practice */}
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Referred By</p>
          <p className="text-slate-900 font-semibold">
            Dr. {r.from_provider_first} {r.from_provider_last}
            {r.from_provider_specialty && (
              <span className="text-slate-400 font-normal text-sm"> · {r.from_provider_specialty}</span>
            )}
          </p>
          <p className="text-slate-600 text-sm">{r.from_practice_name}</p>
          {location && (
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              <MapPin size={13} /> {location}
            </p>
          )}
          {r.from_practice_phone && (
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              <Phone size={13} /> {r.from_practice_phone}
            </p>
          )}
          {r.from_practice_email && (
            <p className="text-slate-400 text-sm flex items-center gap-1.5">
              <Mail size={13} />
              <a href={`mailto:${r.from_practice_email}`} className="hover:text-blue-600 transition-colors">
                {r.from_practice_email}
              </a>
            </p>
          )}
        </div>

        {/* Referred to */}
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Referred To</p>
          <p className="text-slate-900 font-semibold">{r.to_practice_name}</p>
        </div>

        {/* Reply CTA */}
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-6 text-center space-y-3">
          <p className="text-slate-700 font-medium">Ready to respond to this referral?</p>
          {replyTo ? (
            <a
              href={replyTo}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Mail size={15} />
              Reply via email
            </a>
          ) : (
            <p className="text-slate-400 text-sm">Contact {r.from_practice_name} directly to respond.</p>
          )}
          <p className="text-xs text-slate-400 pt-1">
            Want to manage referrals, send outcome letters, and message securely?{' '}
            <a href="/" className="text-blue-600 font-medium hover:underline">
              Create a free DentalRelay account
            </a>
          </p>
        </div>

        {/* HIPAA notice */}
        <p className="text-center text-xs text-slate-400 pb-4">
          This referral was sent via DentalRelay, a HIPAA-compliant dental referral platform.
          This link is private — only share it with authorized care team members.
        </p>

      </main>
    </div>
  );
}
