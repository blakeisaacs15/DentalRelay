import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sendReferralNotification } from '@/lib/email';

type Params = { params: Promise<{ id: string }> };

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
  to_practice_email: string | null;
  access_token: string;
};

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  // Fetch the referral + access_token + receiving practice email in one query
  const { data: rows, error } = await admin.rpc('get_referral_notify_data', {
    p_referral_id: id,
  });

  if (error || !rows || rows.length === 0) {
    return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
  }

  const r = rows[0] as ReferralRow;

  if (!r.to_practice_email) {
    // Receiving practice has no email on file — skip silently
    return NextResponse.json({ skipped: true, reason: 'no_recipient_email' });
  }

  const { error: emailError } = await sendReferralNotification({
    accessToken: r.access_token,
    patientFirst: r.patient_first,
    patientLast: r.patient_last,
    patientDob: r.patient_dob,
    treatment: r.treatment,
    priority: r.priority,
    notes: r.notes,
    fromPracticeName: r.from_practice_name,
    fromPracticeCity: r.from_practice_city,
    fromPracticeState: r.from_practice_state,
    fromPracticePhone: r.from_practice_phone,
    fromPracticeEmail: r.from_practice_email,
    fromProviderFirst: r.from_provider_first,
    fromProviderLast: r.from_provider_last,
    fromProviderSpecialty: r.from_provider_specialty,
    toPracticeEmail: r.to_practice_email,
    toPracticeName: r.to_practice_name,
  });

  if (emailError) {
    console.error('Referral email send failed:', emailError);
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
