import { auth } from '@clerk/nextjs/server';
import { cache } from 'react';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type CurrentUser = {
  providerId: string;
  practiceId: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  role: string;
};

/**
 * Resolves the signed-in Clerk user to their providers/practices row.
 * Cached per-request so multiple lookups don't hit Supabase repeatedly.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Not authenticated');
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('providers')
    .select('id, practice_id, first_name, last_name, role')
    .eq('clerk_user_id', userId)
    .single();

  if (error || !data || !data.practice_id) {
    throw new Error(`No provider record found for Clerk user ${userId}`);
  }

  return {
    providerId: data.id,
    practiceId: data.practice_id,
    clerkUserId: userId,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role,
  };
});
