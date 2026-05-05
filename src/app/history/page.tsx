'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  History, 
  Filter, 
  Download, 
  TrendingUp,
  Brain,
  Search,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function HistoryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchHistory();
    }
  }, [user, isLoading, router]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTrades(data);
    }
    setIsFetching(false);
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-zinc-500 hover:text-white -ml-2 w-fit">
              <ArrowLeft size={16} /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gold-bg-gradient flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <History className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Execution <span className="gold-gradient italic">History</span></h1>
              <p className="text-zinc-500 text-sm">Review all your manual logs and MT5 synced trades.</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-gold transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gold/50 transition-all min-w-[200px]"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={16} /> Filters
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      <Card variant="glass" className="p-0 overflow-hidden border-zinc-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="p-5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Date & Time</th>
                <th className="p-5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Instrument</th>
                <th className="p-5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Type</th>
                <th className="p-5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Result</th>
                <th className="p-5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Net Profit</th>
                <th className="p-5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Psychology</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  key={trade.id} 
                  className="border-b border-white/5 hover:bg-white/2 transition-all cursor-pointer group"
                >
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{new Date(trade.created_at).toLocaleDateString()}</span>
                      <span className="text-[10px] text-zinc-500">{new Date(trade.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${trade.result === 'Win' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trade.asset_pair.slice(0, 2)}
                      </div>
                      <span className="font-bold text-zinc-200">{trade.asset_pair}</span>
                    </div>
                  </td>
                  <td className="p-5 text-zinc-400 text-sm">{trade.type}</td>
                  <td className="p-5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${trade.result === 'Win' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                      {trade.result}
                    </span>
                  </td>
                  <td className={`p-5 font-mono text-sm font-bold ${trade.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.profit_loss >= 0 ? '+' : ''}${Math.abs(trade.profit_loss).toLocaleString()}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                      <span className="text-xs text-zinc-400">{trade.mood}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <TrendingUp className="text-zinc-600" size={32} />
                      </div>
                      <p className="text-zinc-500 font-medium italic">Your execution history is empty. Start journaling or sync from MT5.</p>
                      <Link href="/journal">
                        <Button variant="gold" size="sm">Log First Trade</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
