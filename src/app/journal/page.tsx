'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Zap, 
  Info,
  Brain,
  ArrowUpRight,
  TrendingUp,
  Activity,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function JournalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [assetPair, setAssetPair] = React.useState('BTC/USDT');
  const [type, setType] = React.useState('Long');
  const [entryPrice, setEntryPrice] = React.useState('');
  const [exitPrice, setExitPrice] = React.useState('');
  const [result, setResult] = React.useState('Win');
  const [mood, setMood] = React.useState('Confident');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    
    // Calculate P/L based on entry/exit and type
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    let pl = 0;
    
    if (type === 'Long') {
      pl = exit - entry;
    } else {
      pl = entry - exit;
    }

    const { error } = await supabase.from('trades').insert({
      user_id: user.id,
      asset_pair: assetPair,
      type,
      entry_price: entry,
      exit_price: exit,
      result,
      profit_loss: pl,
      mood,
      notes
    });

    setIsSubmitting(false);
    if (!error) {
      router.push('/dashboard');
    } else {
      alert('Error logging trade: ' + error.message);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-500 hover:text-white -ml-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Log <span className="gold-gradient italic">Performance</span></h1>
          <p className="text-zinc-500 max-w-2xl">Capture your execution and psychological state. Our AI will analyze these inputs to find your edge.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Execution Card */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card variant="glass" className="p-8 border-zinc-800/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                <Activity className="text-gold" size={20} />
              </div>
              <h3 className="text-xl font-bold">Execution Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Asset Pair</label>
                <select 
                  value={assetPair}
                  onChange={(e) => setAssetPair(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-gold/50 transition-all text-white"
                  required
                >
                  <option value="" disabled>Select Instrument</option>
                  <optgroup label="Crypto">
                    <option>BTC/USDT</option>
                    <option>ETH/USDT</option>
                    <option>SOL/USDT</option>
                    <option>XRP/USDT</option>
                  </optgroup>
                  <optgroup label="Forex">
                    <option>EUR/USD</option>
                    <option>GBP/USD</option>
                    <option>USD/JPY</option>
                    <option>AUD/USD</option>
                  </optgroup>
                  <optgroup label="Commodities">
                    <option>XAU/USD (Gold)</option>
                    <option>WTI/USD (Oil)</option>
                    <option>XAG/USD (Silver)</option>
                  </optgroup>
                  <optgroup label="Indices">
                    <option>NAS100</option>
                    <option>US30</option>
                    <option>SPX500</option>
                    <option>GER40</option>
                  </optgroup>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Direction</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setType('Long')}
                    className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${type === 'Long' ? 'bg-green-500/10 border-green-500/50 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    Long
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('Short')}
                    className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${type === 'Short' ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    Short
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Entry Price</label>
                <input 
                  type="number" 
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="0.00" 
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-gold/50 transition-all"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Exit Price</label>
                <input 
                  type="number" 
                  step="any"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="0.00" 
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-gold/50 transition-all"
                  required
                />
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-8 border-zinc-800/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                <MessageSquare className="text-gold" size={20} />
              </div>
              <h3 className="text-xl font-bold">Trading Notes</h3>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was the confluence for this setup? How did you manage the trade while it was live?" 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-sm focus:outline-none focus:border-gold/50 transition-all min-h-[250px] resize-none leading-relaxed"
            />
          </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="flex flex-col gap-8">
          <Card variant="gold" className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-xl">
                <Brain className="text-gold" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">Psychology</h3>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Outcome</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Win', 'Loss', 'Breakeven'].map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setResult(res)}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${result === res ? 'bg-gold text-black shadow-lg scale-105' : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10'}`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Mindset</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Confident', 'Calm', 'Anxious', 'Bored', 'FOMO', 'Revenge'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${mood === m ? 'bg-gold text-black shadow-lg scale-105' : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-6 border-gold/20 bg-gold/5">
            <div className="flex items-center gap-2 text-gold mb-4">
              <Info size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">AI Tip</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed italic">
              "Being honest about your 'FOMO' or 'Revenge' moods allows me to find patterns that the charts won't show. Be ruthless with your honesty."
            </p>
          </Card>

          <Button 
            variant="gold" 
            size="lg" 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-8 text-lg font-bold gap-3 shadow-[0_20px_50px_rgba(212,175,55,0.2)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.3)] transition-all group"
          >
            {isSubmitting ? 'Syncing...' : 'Log Execution'} 
            <TrendingUp size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>
      </form>
    </div>
  );
}
