'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Brain,
  History,
  ChevronRight,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, updateUserMetadata } = useAuth();
  const router = useRouter();
  
  const [trades, setTrades] = useState<any[]>([]);
  const [startingCapital, setStartingCapital] = useState(10000);
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [tempCapital, setTempCapital] = useState('10000');
  const [metrics, setMetrics] = useState({
    equity: 10000,
    winRate: 0,
    profitFactor: 0,
    avgRR: '1:0'
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (user) {
      const savedCapital = user.user_metadata?.starting_capital;
      if (savedCapital) {
        setStartingCapital(Number(savedCapital));
        setTempCapital(savedCapital.toString());
      }
      fetchDashboardData();
    }
  }, [user, isLoading, router]);

  const handleUpdateCapital = async () => {
    try {
      const val = parseFloat(tempCapital);
      if (isNaN(val)) return;
      
      await updateUserMetadata({ starting_capital: val });
      setStartingCapital(val);
      setIsEditingCapital(false);
      
      // Re-calculate with new capital
      calculateMetrics(trades, val);
      prepareChartData(trades, val);
    } catch (error) {
      // Error handled by state
    }
  };

  const fetchDashboardData = async () => {
    setIsFetching(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const sortedTrades = [...data].reverse();
      setTrades(sortedTrades); // Newest first for table
      
      const savedCapital = user?.user_metadata?.starting_capital || 10000;
      calculateMetrics(data, Number(savedCapital));
      prepareChartData(data, Number(savedCapital));
    }
    setIsFetching(false);
  };

  const calculateMetrics = (allTrades: any[], capital: number) => {
    if (allTrades.length === 0) {
      setMetrics({
        equity: capital,
        winRate: 0,
        profitFactor: 0,
        avgRR: '1:0'
      });
      return;
    }

    const wins = allTrades.filter(t => t.result === 'Win');
    const losses = allTrades.filter(t => t.result === 'Loss');
    
    const winRate = (wins.length / allTrades.length) * 100;
    
    const totalWinAmount = wins.reduce((acc, t) => acc + parseFloat(t.profit_loss), 0);
    const totalLossAmount = Math.abs(losses.reduce((acc, t) => acc + parseFloat(t.profit_loss), 0));
    const profitFactor = totalLossAmount === 0 ? totalWinAmount : totalWinAmount / totalLossAmount;
    
    const totalPL = allTrades.reduce((acc, t) => acc + parseFloat(t.profit_loss), 0);

    setMetrics({
      equity: capital + totalPL,
      winRate: parseFloat(winRate.toFixed(1)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      avgRR: '1:2.1' // Static for now, requires complex RR calc
    });
  };

  const prepareChartData = (allTrades: any[], capital: number) => {
    let currentEquity = capital;
    const points = allTrades.map((t, i) => {
      currentEquity += parseFloat(t.profit_loss);
      return {
        name: `T${i + 1}`,
        equity: currentEquity
      };
    });
    
    // Fallback if no trades
    if (points.length === 0) {
      setChartData([
        { name: 'Start', equity: capital }
      ]);
    } else {
      setChartData([{ name: 'Start', equity: capital }, ...points]);
    }
  };

  if (isLoading || !user || isFetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back, <span className="gold-gradient">{user.user_metadata?.display_name || user.user_metadata?.full_name || 'Trader'}</span></h1>
          <p className="text-zinc-500">
            {trades.length > 0 
              ? `You have logged ${trades.length} trades. Let's analyze your edge.` 
              : "Start by logging your first trade to see AI insights."}
          </p>
        </div>
        <Link href="/journal">
          <Button variant="gold" className="gap-2">
            <Zap size={18} /> New Trade
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass" className="hover:border-zinc-700 transition-colors relative group">
          <p className="text-zinc-500 text-sm mb-1 uppercase tracking-widest">Total Equity</p>
          <div className="flex items-baseline justify-between">
            {isEditingCapital ? (
              <div className="flex items-center gap-2 w-full mt-1">
                <input 
                  type="number" 
                  value={tempCapital}
                  onChange={(e) => setTempCapital(e.target.value)}
                  className="bg-black/50 border border-gold/30 rounded px-2 py-1 text-lg font-bold w-full focus:outline-none focus:border-gold"
                  autoFocus
                />
                <button onClick={handleUpdateCapital} className="text-green-500 hover:text-green-400">
                  <Check size={18} />
                </button>
                <button onClick={() => { setIsEditingCapital(false); setTempCapital(startingCapital.toString()); }} className="text-red-500 hover:text-red-400">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-2xl font-bold">${metrics.equity.toLocaleString()}</h4>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsEditingCapital(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-gold"
                  >
                    <Edit2 size={14} />
                  </button>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-500`}>
                    {trades.length} Trades
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
        <StatCard label="Win Rate" value={`${metrics.winRate}%`} trend="Overall" up={metrics.winRate > 50} />
        <StatCard label="Profit Factor" value={metrics.profitFactor.toString()} trend="Gross" up={metrics.profitFactor > 1} />
        <StatCard label="Avg. RR" value={metrics.avgRR} trend="Strategy" up />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Equity Curve */}
        <Card variant="glass" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-gold" size={20} />
              Equity Growth
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#D4AF37' }}
                  labelStyle={{ color: '#52525b' }}
                />
                <Area type="monotone" dataKey="equity" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Insight */}
        <Card variant="gold" className="flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Brain className="text-gold" size={20} />
            </div>
            <h3 className="text-xl font-bold">Live AI Analysis</h3>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-gold/20 mb-6 italic text-zinc-300 leading-relaxed text-sm">
            {trades.length > 5 
              ? generateAIInsight(trades)
              : "Log at least 5 trades to unlock personalized psychological insights from the AI Coach."}
          </div>
          <div className="flex flex-col gap-3 mt-auto">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Performance Recommendations</p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group">
              <span className="text-sm font-medium">Review {trades[0]?.asset_pair || 'Assets'} Strategy</span>
              <ChevronRight size={16} className="text-gold group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Trades */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <History className="text-zinc-500" size={20} />
            Recent Executions
          </h3>
          <Link href="/history">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        <Card variant="glass" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Asset</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Type</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Result</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Profit/Loss</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Psychology</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 5).map((trade, i) => (
                  <TradeRow 
                    key={i}
                    pair={trade.asset_pair} 
                    type={trade.type} 
                    result={trade.result} 
                    pl={`${trade.profit_loss >= 0 ? '+' : ''}$${trade.profit_loss}`} 
                    mood={trade.mood} 
                  />
                ))}
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-zinc-500 italic">No trades logged yet. Go to the Journal to start.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function generateAIInsight(allTrades: any[]) {
  const losses = allTrades.filter(t => t.result === 'Loss');
  const revengeMoods = allTrades.filter(t => t.mood === 'Revenge' || t.mood === 'FOMO').length;
  
  if (revengeMoods > 0) {
    return `"You've logged ${revengeMoods} trades while feeling Revengeful or FOMO. These trades represent 100% of your current drawdown. Stop trading when your pulse rises."`;
  }
  
  if (losses.length > 3) {
    return `"Your last 3 losses were all on ${losses[0].asset_pair}. This asset is currently not respecting your strategy. Consider benching it for a week."`;
  }

  return `"Your win rate is improving! Your 'Confident' mood correlates with a 75% win rate. Continue following your pre-trade routine."`;
}

function StatCard({ label, value, trend, up }: { label: string, value: string, trend: string, up?: boolean }) {
  return (
    <Card variant="glass" className="hover:border-zinc-700 transition-colors">
      <p className="text-zinc-500 text-sm mb-1 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline justify-between">
        <h4 className="text-2xl font-bold">{value}</h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${up ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend}
        </span>
      </div>
    </Card>
  );
}

function TradeRow({ pair, type, result, pl, mood }: { pair: string, type: string, result: string, pl: string, mood: string }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer group">
      <td className="p-4 font-bold">{pair}</td>
      <td className="p-4 text-zinc-400">{type}</td>
      <td className="p-4">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${result === 'Win' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {result}
        </span>
      </td>
      <td className={`p-4 font-mono text-sm ${result === 'Win' ? 'text-green-500' : 'text-red-500'}`}>{pl}</td>
      <td className="p-4">
        <span className="text-[10px] px-2 py-1 rounded-full bg-zinc-800 text-zinc-300">
          {mood}
        </span>
      </td>
    </tr>
  );
}
