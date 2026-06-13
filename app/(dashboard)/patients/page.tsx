import PatientDirectory, { type PatientRow } from '@/components/patients/PatientDirectory';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/current-user';

type PatientListRow = {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  email: string | null;
  phone: string | null;
  insurance_provider: string | null;
  referral_count: number;
  last_referral_at: string | null;
  last_referral_status: string | null;
};

export default async function PatientsPage() {
  const { practiceId } = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc('get_patients_for_practice', {
    p_practice_id: practiceId,
    p_query: '',
  });

  const patients: PatientRow[] = ((data as PatientListRow[] | null) ?? []).map((row) => ({
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
  }));

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-400 mt-0.5">Everyone your practice has referred or received, in one place.</p>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 px-8 py-6">
        <PatientDirectory initialPatients={patients} practiceId={practiceId} />
      </div>
    </div>
  );
}
