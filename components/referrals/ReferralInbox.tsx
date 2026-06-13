'use client';

import { useMemo, useState } from 'react';
import ReferralFilters from './ReferralFilters';
import ReferralTable from './ReferralTable';
import type { Referral, ReferralStatus } from '@/types/referral';

interface Props {
  referrals: Referral[];
}

export default function ReferralInbox({ referrals }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReferralStatus | 'all'>('all');
  const [provider, setProvider] = useState('all');

  const providers = useMemo(() => {
    const names = new Set<string>();
    referrals.forEach((r) => {
      if (r.referralFrom.name) names.add(r.referralFrom.name);
      if (r.referredTo.name && r.referredTo.name !== 'Unassigned') names.add(r.referredTo.name);
    });
    return Array.from(names).sort();
  }, [referrals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return referrals.filter((referral) => {
      if (status !== 'all' && referral.status !== status) return false;

      if (provider !== 'all' && referral.referralFrom.name !== provider && referral.referredTo.name !== provider) {
        return false;
      }

      if (q) {
        const haystack = [
          referral.patient.firstName,
          referral.patient.lastName,
          referral.treatment,
          referral.referralFrom.name,
          referral.referralFrom.practice,
          referral.referredTo.name,
          referral.referredTo.practice,
        ].join(' ').toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [referrals, search, status, provider]);

  return (
    <>
      <ReferralFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        provider={provider}
        onProviderChange={setProvider}
        providers={providers}
      />
      <ReferralTable referrals={filtered} total={filtered.length} />
    </>
  );
}
