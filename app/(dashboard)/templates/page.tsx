import { LayoutTemplate } from 'lucide-react';
import ComingSoon from '@/components/layout/ComingSoon';

export default function TemplatesPage() {
  return (
    <ComingSoon
      icon={LayoutTemplate}
      title="Templates"
      description="Reusable clinical templates for common referral types and treatment plans."
    />
  );
}
