import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type PracticeUpdate = Database['public']['Tables']['practices']['Update'];
type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  // Only allow these two fields — strip everything else
  const update: PracticeUpdate = {};
  if ('open_dental_customer_key' in body) {
    update.open_dental_customer_key = body.open_dental_customer_key ?? null;
  }
  if ('open_dental_patient_key' in body) {
    update.open_dental_patient_key = body.open_dental_patient_key ?? null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No allowed fields provided' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from('practices').update(update).eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
