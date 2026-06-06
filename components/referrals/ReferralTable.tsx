import type { Referral, ReferralStatus } from '@/types/referral';
import { MoreHorizontal } from 'lucide-react';

function formatDob(dob: string) {
  const d = new Date(dob + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  referrals: Referral[];
  total?: number;
}

const statusConfig: Record<ReferralStatus, { label: string; className: string }> = {
  new: {
    label: 'New',
    className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
  },
};

const patientInitialColors = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
];

export default function ReferralTable({ referrals, total }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Referral From</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Referred To</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Treatment</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
            <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Received</th>
            <th className="px-5 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {referrals.map((referral, i) => {
            const { patient, referralFrom, referredTo, treatment, status, receivedAt } = referral;
            const initials = `${patient.firstName[0]}${patient.lastName[0]}`;
            const colorClass = patientInitialColors[i % patientInitialColors.length];
            const statusStyle = statusConfig[status];

            return (
              <tr
                key={referral.id}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer"
              >
                {/* Patient */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0 ${colorClass}`}>
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{patient.firstName} {patient.lastName}</p>
                      <p className="text-slate-400 text-xs">{formatDob(patient.dob)}</p>
                    </div>
                  </div>
                </td>

                {/* Referral From */}
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-700">{referralFrom.practice}</p>
                  <p className="text-slate-400 text-xs">{referralFrom.name}</p>
                </td>

                {/* Referred To */}
                <td className="px-5 py-3.5">
                  <p className="font-medium text-slate-700">{referredTo.practice}</p>
                  <p className="text-slate-400 text-xs">{referredTo.name}</p>
                </td>

                {/* Treatment */}
                <td className="px-5 py-3.5">
                  <span className="text-slate-600">{treatment}</span>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle.className}`}>
                    {statusStyle.label}
                  </span>
                </td>

                {/* Received */}
                <td className="px-5 py-3.5">
                  <span className="text-slate-500 text-xs">{receivedAt}</span>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5">
                  <button className="p-1.5 rounded-md text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
        <p className="text-xs text-slate-400">Showing 1 to {referrals.length} of {total ?? referrals.length} referrals</p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">Previous</button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={`w-7 h-7 text-xs rounded-md transition-colors font-medium ${
                p === 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
          <span className="px-1 text-slate-300 text-xs">...</span>
          <button className="w-7 h-7 text-xs text-slate-500 hover:bg-slate-100 rounded-md transition-colors">15</button>
          <button className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
