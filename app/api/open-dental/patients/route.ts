import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { CURRENT_PRACTICE_ID } from '@/lib/current-user';
import type { OpenDentalPatient } from '@/types/open-dental';

export type { OpenDentalPatient };

async function getCredentials(): Promise<{ customerKey: string; patientKey: string } | null> {
  // Env vars take priority (dev override)
  const envCustomer = process.env.OPEN_DENTAL_CUSTOMER_KEY;
  const envPatient = process.env.OPEN_DENTAL_PATIENT_KEY;
  if (envCustomer && envPatient) {
    return { customerKey: envCustomer, patientKey: envPatient };
  }

  // Fall back to Supabase practices table (requires service role key)
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from('practices')
      .select('open_dental_customer_key, open_dental_patient_key')
      .eq('id', CURRENT_PRACTICE_ID)
      .single();

    if (data?.open_dental_customer_key && data?.open_dental_patient_key) {
      return {
        customerKey: data.open_dental_customer_key,
        patientKey: data.open_dental_patient_key,
      };
    }
  } catch {
    // Admin client unavailable (service role key not set)
  }

  return null;
}

function buildAuthHeader(customerKey: string): string {
  const devKey = process.env.OPEN_DENTAL_DEV_KEY;
  if (!devKey || devKey === 'test') {
    return 'ODFHIR NFF6i0KrXrxDkZHt/VzkmZEaUWOjnQX2z';
  }
  return `ODFHIR ${devKey}/${customerKey}`;
}

export async function GET(request: NextRequest) {
  const devKey = process.env.OPEN_DENTAL_DEV_KEY;
  const isTest = !devKey || devKey === 'test';

  let authHeader: string;

  if (isTest) {
    authHeader = buildAuthHeader('');
  } else {
    const creds = await getCredentials();
    if (!creds) {
      return NextResponse.json(
        { error: 'open_dental_not_configured' },
        { status: 503 }
      );
    }
    authHeader = buildAuthHeader(creds.customerKey);
  }

  const { searchParams } = request.nextUrl;
  const LName = searchParams.get('LName') ?? '';
  const FName = searchParams.get('FName') ?? '';
  const Birthdate = searchParams.get('Birthdate') ?? '';

  if (!LName && !FName) {
    return NextResponse.json({ error: 'Provide at least LName or FName' }, { status: 400 });
  }

  const params = new URLSearchParams();
  if (LName) params.set('LName', LName);
  if (FName) params.set('FName', FName);
  if (Birthdate) params.set('Birthdate', Birthdate);

  const odUrl = `https://api.opendental.com/api/v1/patients?${params.toString()}`;

  const odRes = await fetch(odUrl, {
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!odRes.ok) {
    const text = await odRes.text();
    return NextResponse.json(
      { error: 'Open Dental API error', detail: text },
      { status: odRes.status }
    );
  }

  const patients: OpenDentalPatient[] = await odRes.json();
  return NextResponse.json(patients);
}
