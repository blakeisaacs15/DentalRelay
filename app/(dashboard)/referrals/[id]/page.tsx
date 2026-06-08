import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Mail, MapPin, Phone } from 'lucide-react';
import MessageThread, { type ThreadMessage } from '@/components/referrals/MessageThread';
import OutcomeLetterPanel, { type OutcomeLetter } from '@/components/referrals/OutcomeLetterPanel';
import ReferralStatusControl from '@/components/referrals/ReferralStatusControl';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ReferralStatus } from '@/types/referral';

type DetailRow = {
  id: string;
  status: string;
  priority: string;
  treatment: string;
  notes: string | null;
  created_at: string;
  appointment_date: string | null;
  completed_at: string | null;
  patient_id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_dob: string;
  patient_email: string | null;
  patient_phone: string | null;
  from_practice_id: string;
  from_practice_name: string;
  from_practice_city: string | null;
  from_practice_state: string | null;
  from_provider_id: string;
  from_provider_first: string;
  from_provider_last: string;
  from_provider_specialty: string | null;
  to_practice_id: string;
  to_practice_name: string;
  to_practice_city: string | null;
  to_practice_state: string | null;
  to_provider_id: string | null;
  to_provider_first: string | null;
  to_provider_last: string | null;
  to_provider_specialty: string | null;
};

type MessageRow = {
  id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_id: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_practice_name: string;
};

type OutcomeLetterRow = {
  id: string;
  treatment_performed: string;
  outcome: 'excellent' | 'good' | 'fair' | 'guarded';
  patient_response: string | null;
  follow_up_required: boolean;
  follow_up_notes: string | null;
  recommendations: string | null;
  signature_name: string;
  signed_at: string;
  created_at: string;
  provider_id: string;
  provider_first_name: string;
  provider_last_name: string;
  provider_specialty: string | null;
  practice_name: string;
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Low Priority', className: 'bg-slate-100 text-slate-500' },
  normal: { label: 'Normal', className: 'bg-slate-100 text-slate-600' },
  high: { label: 'High Priority', className: 'bg-amber-50 text-amber-700' },
  urgent: { label: 'Urgent', className: 'bg-red-50 text-red-700' },
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDob(dob: string) {
  return new Date(dob + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReferralDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: detailRows }, { data: messageRows }, { data: letterRows }] = await Promise.all([
    supabase.rpc('get_referral_detail', { p_referral_id: id }),
    supabase.rpc('get_referral_messages', { p_referral_id: id }),
    supabase.rpc('get_outcome_letters', { p_referral_id: id }),
  ]);

  const detail = (detailRows as DetailRow[] | null)?.[0];
  if (!detail) notFound();

  const messages: ThreadMessage[] = ((messageRows as MessageRow[] | null) ?? []).map((m) => ({
    id: m.id,
    content: m.content,
    isRead: m.is_read,
    createdAt: m.created_at,
    senderId: m.sender_id,
    senderName: `Dr. ${m.sender_first_name} ${m.sender_last_name}`,
    senderPractice: m.sender_practice_name,
  }));

  const outcomeLetters: OutcomeLetter[] = ((letterRows as OutcomeLetterRow[] | null) ?? []).map((l) => ({
    id: l.id,
    treatmentPerformed: l.treatment_performed,
    outcome: l.outcome,
    patientResponse: l.patient_response,
    followUpRequired: l.follow_up_required,
    followUpNotes: l.follow_up_notes,
    recommendations: l.recommendations,
    signatureName: l.signature_name,
    signedAt: l.signed_at,
    providerName: `Dr. ${l.provider_first_name} ${l.provider_last_name}`,
    providerSpecialty: l.provider_specialty,
    practiceName: l.practice_name,
  }));

  const priorityStyle = priorityConfig[detail.priority] ?? priorityConfig.normal;

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={17} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-slate-900">
                {detail.patient_first_name} {detail.patient_last_name}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${priorityStyle.className}`}>
                {priorityStyle.label}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{detail.treatment} · Received {formatDate(detail.created_at)}</p>
          </div>
        </div>
        <ReferralStatusControl referralId={detail.id} initialStatus={detail.status as ReferralStatus} />
      </header>

      {/* Page content */}
      <div className="flex-1 px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left column: details */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Patient card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Patient</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Name</span>
                  <span className="font-medium text-slate-700">{detail.patient_first_name} {detail.patient_last_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Date of birth</span>
                  <span className="font-medium text-slate-700">{formatDob(detail.patient_dob)}</span>
                </div>
                {detail.patient_email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5"><Mail size={13} /> Email</span>
                    <span className="font-medium text-slate-700">{detail.patient_email}</span>
                  </div>
                )}
                {detail.patient_phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5"><Phone size={13} /> Phone</span>
                    <span className="font-medium text-slate-700">{detail.patient_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Providers card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Providers</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Referring</p>
                  <p className="text-sm font-medium text-slate-800">Dr. {detail.from_provider_first} {detail.from_provider_last}</p>
                  {detail.from_provider_specialty && (
                    <p className="text-xs text-slate-400">{detail.from_provider_specialty}</p>
                  )}
                  <p className="text-sm text-slate-600 mt-1">{detail.from_practice_name}</p>
                  {(detail.from_practice_city || detail.from_practice_state) && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={12} /> {[detail.from_practice_city, detail.from_practice_state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Receiving</p>
                  <p className="text-sm font-medium text-slate-800">
                    {detail.to_provider_first ? `Dr. ${detail.to_provider_first} ${detail.to_provider_last}` : 'Unassigned'}
                  </p>
                  {detail.to_provider_specialty && (
                    <p className="text-xs text-slate-400">{detail.to_provider_specialty}</p>
                  )}
                  <p className="text-sm text-slate-600 mt-1">{detail.to_practice_name}</p>
                  {(detail.to_practice_city || detail.to_practice_state) && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <MapPin size={12} /> {[detail.to_practice_city, detail.to_practice_state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline / notes card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Details</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={13} /> Received</span>
                  <span className="font-medium text-slate-700">{formatDate(detail.created_at)}</span>
                </div>
                {detail.appointment_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={13} /> Appointment</span>
                    <span className="font-medium text-slate-700">{formatDate(detail.appointment_date)}</span>
                  </div>
                )}
                {detail.completed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={13} /> Completed</span>
                    <span className="font-medium text-slate-700">{formatDate(detail.completed_at)}</span>
                  </div>
                )}
              </div>
              {detail.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Referral notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{detail.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: conversation */}
          <div className="lg:col-span-3">
            <MessageThread referralId={detail.id} initialMessages={messages} />
          </div>
        </div>

        <div className="mt-5">
          <OutcomeLetterPanel
            referralId={detail.id}
            recipientName={`Dr. ${detail.from_provider_first} ${detail.from_provider_last}`}
            recipientPractice={detail.from_practice_name}
            initialLetters={outcomeLetters}
          />
        </div>
      </div>
    </div>
  );
}
