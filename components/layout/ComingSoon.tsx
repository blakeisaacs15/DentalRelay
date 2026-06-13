import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function ComingSoon({ icon: Icon, title, description }: Props) {
  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{description}</p>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-8 py-6">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
            <Icon size={20} className="text-blue-500" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Coming soon</h2>
          <p className="text-sm text-slate-400 mt-1.5">
            {title} isn&apos;t built yet. Check back as DentalRelay continues to grow.
          </p>
        </div>
      </div>
    </div>
  );
}
