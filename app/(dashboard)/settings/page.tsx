import { Settings } from 'lucide-react';
import ComingSoon from '@/components/layout/ComingSoon';

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Settings"
      description="Practice profile, team members, and account preferences."
    />
  );
}
