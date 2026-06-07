'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { ReferralStatus } from '@/types/referral';

const STATUS_OPTIONS: { value: ReferralStatus; label: string; dot: string }[] = [
  { value: 'new', label: 'New', dot: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', dot: 'bg-amber-400' },
  { value: 'completed', label: 'Completed', dot: 'bg-emerald-500' },
  { value: 'archived', label: 'Archived', dot: 'bg-slate-400' },
];

interface Props {
  referralId: string;
  initialStatus: ReferralStatus;
}

export default function ReferralStatusControl({ referralId, initialStatus }: Props) {
  const router = useRouter();
  const supabase = useRef(createSupabaseClient()).current;
  const [status, setStatus] = useState(initialStatus);
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleSelect(next: ReferralStatus) {
    setOpen(false);
    if (next === status || updating) return;

    const previous = status;
    setStatus(next);
    setUpdating(true);

    const { error } = await supabase.rpc('update_referral_status', {
      p_referral_id: referralId,
      p_status: next,
    });

    setUpdating(false);
    if (error) {
      setStatus(previous);
      return;
    }
    router.refresh();
  }

  const current = STATUS_OPTIONS.find((s) => s.value === status)!;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={updating}
        className="flex items-center gap-2 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 transition-colors disabled:opacity-60"
      >
        {updating ? (
          <Loader2 size={13} className="animate-spin text-slate-400" />
        ) : (
          <span className={`w-2 h-2 rounded-full ${current.dot}`} />
        )}
        <span className="font-medium">{current.label}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors ${
                  opt.value === status ? 'text-slate-900 font-medium bg-slate-50/80' : 'text-slate-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
