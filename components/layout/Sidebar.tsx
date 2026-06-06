'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  ArrowLeftRight,
  Users,
  Building2,
  LayoutTemplate,
  BarChart3,
  Plug2,
  Settings,
} from 'lucide-react';

const navItems = [
  { label: 'Inbox', href: '/', icon: Inbox, badge: 18 },
  { label: 'Referrals', href: '/referrals', icon: ArrowLeftRight },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Providers', href: '/providers', icon: Building2 },
  { label: 'Templates', href: '/templates', icon: LayoutTemplate },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Integrations', href: '/integrations', icon: Plug2 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[#0d1b2e] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 4 5 3 3.5 3C2 3 1 4.5 1.5 6.5C2 8.5 3.5 10 5 11C5.5 13 6 16 7 18C7.5 19.5 8.5 22 10 22C11 22 11.5 21 12 19.5C12.5 21 13 22 14 22C15.5 22 16.5 19.5 17 18C18 16 18.5 13 19 11C20.5 10 22 8.5 22.5 6.5C23 4.5 22 3 20.5 3C19 3 17.5 4 17 5.5C16.5 3.5 14.5 2 12 2Z" />
          </svg>
        </div>
        <span className="text-white font-semibold text-[15px] tracking-tight">DentalRelay</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                }`}
                size={18}
              />
              <span className="flex-1">{label}</span>
              {badge !== undefined && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-semibold rounded-full bg-blue-500 text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Practice + User */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/10 pt-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-700 shrink-0">
            <span className="text-white text-[10px] font-bold">BS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Bright Smiles Dental</p>
            <p className="text-slate-500 text-[11px] truncate">Austin, TX</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-600 shrink-0">
            <span className="text-white text-[10px] font-semibold">AB</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Ashley Brown, DM</p>
            <p className="text-slate-500 text-[11px] truncate">General Dentist</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
