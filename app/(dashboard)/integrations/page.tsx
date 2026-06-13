import OpenDentalSettings from '@/components/settings/OpenDentalSettings';
import { getCurrentUser } from '@/lib/current-user';

export default async function IntegrationsPage() {
  const { practiceId } = await getCurrentUser();

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Connect DentalRelay to your practice management software.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 shrink-0">
            <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
              <rect width="40" height="40" rx="8" fill="#EFF6FF" />
              <path d="M12 20C12 15.6 15.6 12 20 12s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="#3B82F6" fillOpacity=".2" />
              <path d="M20 16v8M16 20h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Open Dental</h2>
            <p className="text-xs text-slate-400 mt-0.5">Practice management software integration</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <OpenDentalSettings practiceId={practiceId} />
        </div>
      </div>
    </div>
  );
}
