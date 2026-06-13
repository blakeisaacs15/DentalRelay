import { BarChart3 } from 'lucide-react';
import ComingSoon from '@/components/layout/ComingSoon';

export default function AnalyticsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Analytics"
      description="Referral volume, response times, and outcomes across your practice."
    />
  );
}
