import type { ReferralStats } from '@/types/referral';

interface Props {
  stats: ReferralStats;
}

const statConfig = [
  {
    key: 'new' as const,
    label: 'New',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    dot: 'bg-blue-500',
  },
  {
    key: 'inProgress' as const,
    label: 'In Progress',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    dot: 'bg-amber-400',
  },
  {
    key: 'completed' as const,
    label: 'Completed',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
  },
  {
    key: 'archived' as const,
    label: 'Archived',
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    dot: 'bg-slate-400',
  },
];

export default function ReferralStatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {statConfig.map(({ key, label, color, bg, dot }) => (
        <div
          key={key}
          className={`flex items-center gap-3 ${bg} rounded-xl px-5 py-4 border border-black/5`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
          <div>
            <p className={`text-2xl font-bold ${color} leading-none`}>{stats[key]}</p>
            <p className="text-slate-500 text-xs mt-1 font-medium">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
