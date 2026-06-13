import { ArrowLeftRight } from 'lucide-react';
import ComingSoon from '@/components/layout/ComingSoon';

export default function ReferralsPage() {
  return (
    <ComingSoon
      icon={ArrowLeftRight}
      title="Referrals"
      description="A full, filterable history of every referral your practice has sent or received."
    />
  );
}
