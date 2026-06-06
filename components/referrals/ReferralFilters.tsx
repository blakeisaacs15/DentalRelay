'use client';

import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function ReferralFilters() {
  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
        <input
          type="text"
          placeholder="Search referrals, patients, or providers..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
        />
      </div>

      {/* Status */}
      <button className="flex items-center gap-2 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors">
        <span>Status</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {/* Providers */}
      <button className="flex items-center gap-2 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors">
        <span>All Providers</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      <div className="flex-1" />

      {/* Sort */}
      <button className="flex items-center gap-2 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors">
        <SlidersHorizontal size={14} className="text-slate-400" />
        <span>Sort / Filter</span>
      </button>
    </div>
  );
}
