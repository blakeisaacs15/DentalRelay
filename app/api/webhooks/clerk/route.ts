import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

type ClerkEmailAddress = { id: string; email_address: string };

type ClerkUserCreatedEvent = {
  type: string;
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string | null;
  };
};

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const payload = await request.text();
  const headers = {
    'svix-id': request.headers.get('svix-id') ?? '',
    'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
    'svix-signature': request.headers.get('svix-signature') ?? '',
  };

  let event: ClerkUserCreatedEvent;
  try {
    event = new Webhook(secret).verify(payload, headers) as ClerkUserCreatedEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'user.created') {
    return NextResponse.json({ received: true });
  }

  const { id: clerkUserId, first_name, last_name, email_addresses, primary_email_address_id } = event.data;
  const primaryEmail =
    email_addresses.find((e) => e.id === primary_email_address_id)?.email_address ??
    email_addresses[0]?.email_address ??
    '';
  const firstName = first_name?.trim() || 'New';
  const lastName = last_name?.trim() || 'Provider';

  const admin = createSupabaseAdminClient();

  // Avoid double-provisioning if this webhook fires more than once.
  const { data: existing } = await admin
    .from('providers')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, alreadyProvisioned: true });
  }

  const { data: practice, error: practiceError } = await admin
    .from('practices')
    .insert({ name: `${firstName} ${lastName}'s Practice`, email: primaryEmail || null })
    .select('id')
    .single();

  if (practiceError || !practice) {
    return NextResponse.json({ error: practiceError?.message ?? 'Failed to create practice' }, { status: 500 });
  }

  const { error: providerError } = await admin.from('providers').insert({
    clerk_user_id: clerkUserId,
    practice_id: practice.id,
    first_name: firstName,
    last_name: lastName,
    email: primaryEmail,
    role: 'admin',
  });

  if (providerError) {
    return NextResponse.json({ error: providerError.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
