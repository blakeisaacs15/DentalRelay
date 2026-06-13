'use client';

import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import type { ReferralStatus } from '@/types/referral';

const statusOptions: { value: ReferralStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  status: ReferralStatus | 'all';
  onStatusChange: (value: ReferralStatus | 'all') => void;
  provider: string;
  onProviderChange: (value: string) => void;
  providers: string[];
}

export default function ReferralFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  provider,
  onProviderChange,
  providers,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search referrals, patients, or providers..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        />
      </div>

      {/* Status */}
      <div className="relative">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ReferralStatus | 'all')}
          className="appearance-none pl-3.5 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {/* Providers */}
      <div className="relative">
        <select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="appearance-none pl-3.5 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer max-w-[180px]"
        >
          <option value="all">All Providers</option>
          {providers.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      <div className="flex-1" />

      {/* Sort */}
      <button className="flex items-center gap-2 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors">
        <SlidersHorizontal size={14} className="text-slate-400" />
        <span>Sort / Filter</span>
      </button>
    </div>
  );
}
