'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  BrainCircuit, 
  BarChart2, 
  Settings, 
  LogOut,
  TrendingUp
} from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: BookOpen, label: 'Journal', href: '/journal' },
  { icon: BrainCircuit, label: 'AI Coach', href: '/coach' },
  { icon: BarChart2, label: 'Analytics', href: '/analytics' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-black/30 backdrop-blur-xl h-[calc(100vh-80px)] sticky top-20 flex flex-col p-6">
      <div className="flex-grow flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive 
                  ? 'bg-gold/10 text-gold shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]' 
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={20} className={isActive ? 'text-gold' : 'group-hover:text-gold transition-colors'} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all mt-auto">
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </aside>
  );
}
