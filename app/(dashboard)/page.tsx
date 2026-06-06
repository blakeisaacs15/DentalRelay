import { Bell, Plus } from 'lucide-react';
import ReferralStatsBar from '@/components/referrals/ReferralStatsBar';
import ReferralTable from '@/components/referrals/ReferralTable';
import ReferralFilters from '@/components/referrals/ReferralFilters';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Referral, ReferralStats, ReferralStatus } from '@/types/referral';

type InboxRow = {
  id: string;
  status: string;
  treatment: string;
  created_at: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_dob: string;
  from_practice_name: string;
  from_provider_first: string;
  from_provider_last: string;
  to_practice_name: string;
  to_provider_first: string | null;
  to_provider_last: string | null;
};

type StatusCountRow = { status: string; count: number };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

async function getReferrals(): Promise<{ referrals: Referral[]; stats: ReferralStats }> {
  const supabase = await createSupabaseServerClient();

  const [{ data: rows }, { data: counts }] = await Promise.all([
    supabase.rpc('get_referral_inbox_data', { p_limit: 50, p_offset: 0 }),
    supabase.rpc('get_referral_status_counts'),
  ]);

  const referrals: Referral[] = (rows ?? []).map((row: InboxRow) => ({
    id: row.id,
    patient: {
      id: row.id,
      firstName: row.patient_first_name,
      lastName: row.patient_last_name,
      dob: row.patient_dob,
    },
    referralFrom: {
      id: '',
      name: `Dr. ${row.from_provider_first} ${row.from_provider_last}`,
      practice: row.from_practice_name,
    },
    referredTo: {
      id: '',
      name: row.to_provider_first
        ? `Dr. ${row.to_provider_first} ${row.to_provider_last}`
        : 'Unassigned',
      practice: row.to_practice_name,
    },
    treatment: row.treatment,
    status: row.status as ReferralStatus,
    receivedAt: formatDate(row.created_at),
  }));

  const stats: ReferralStats = { new: 0, inProgress: 0, completed: 0, archived: 0 };
  (counts ?? []).forEach((row: StatusCountRow) => {
    if (row.status === 'new')         stats.new        = Number(row.count);
    if (row.status === 'in_progress') stats.inProgress = Number(row.count);
    if (row.status === 'completed')   stats.completed  = Number(row.count);
    if (row.status === 'archived')    stats.archived   = Number(row.count);
  });

  return { referrals, stats };
}

export default async function InboxPage() {
  const { referrals, stats } = await getReferrals();

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Referral Inbox</h1>
          <p className="text-sm text-slate-400 mt-0.5">View and manage all incoming referrals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Plus size={16} />
            New Referral
          </button>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 px-8 py-6 space-y-5">
        <ReferralStatsBar stats={stats} />
        <ReferralFilters />
        <ReferralTable referrals={referrals} total={referrals.length} />
      </div>
    </div>
  );
}
