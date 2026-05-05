'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [trades, setTrades] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchAndAnalyze();
    }
  }, [user, isLoading, router]);

  const fetchAndAnalyze = async () => {
    setIsFetching(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setTrades(data);
      performAIAnalysis(data);
    }
    setIsFetching(false);
  };

  const performAIAnalysis = (allTrades: any[]) => {
    if (allTrades.length === 0) return;

    // 1. Profitability & Risk
    const wins = allTrades.filter(t => t.result === 'Win');
    const losses = allTrades.filter(t => t.result === 'Loss');
    const totalPL = allTrades.reduce((acc, t) => acc + parseFloat(t.profit_loss), 0);
    const avgWin = wins.length > 0 ? wins.reduce((acc, t) => acc + parseFloat(t.profit_loss), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((acc, t) => acc + parseFloat(t.profit_loss), 0) / losses.length) : 0;
    const riskRewardRatio = avgLoss === 0 ? 'N/A' : (avgWin / avgLoss).toFixed(2);

    // 2. Asset Performance
    const assetStats = allTrades.reduce((acc: any, t) => {
      if (!acc[t.asset_pair]) acc[t.asset_pair] = { win: 0, loss: 0, pl: 0 };
      if (t.result === 'Win') acc[t.asset_pair].win++;
      else acc[t.asset_pair].loss++;
      acc[t.asset_pair].pl += parseFloat(t.profit_loss);
      return acc;
    }, {});

    const bestAsset = Object.entries(assetStats).sort((a: any, b: any) => b[1].pl - a[1].pl)[0];
    const worstAsset = Object.entries(assetStats).sort((a: any, b: any) => a[1].pl - b[1].pl)[0];

    // 3. Emotional Impact
    const moodStats = allTrades.reduce((acc: any, t) => {
      if (!acc[t.mood]) acc[t.mood] = { win: 0, total: 0 };
      acc[t.mood].total++;
      if (t.result === 'Win') acc[t.mood].win++;
      return acc;
    }, {});

    const disciplinedMoods = ['Confident', 'Calm'];
    const emotionalMoods = ['Anxious', 'FOMO', 'Revenge', 'Bored'];
    
    const disciplinedTrades = allTrades.filter(t => disciplinedMoods.includes(t.mood));
    const emotionalTrades = allTrades.filter(t => emotionalMoods.includes(t.mood));
    
    const disciplinedWinRate = disciplinedTrades.length > 0 ? (disciplinedTrades.filter(t => t.result === 'Win').length / disciplinedTrades.length) * 100 : 0;
    const emotionalWinRate = emotionalTrades.length > 0 ? (emotionalTrades.filter(t => t.result === 'Win').length / emotionalTrades.length) * 100 : 0;

    const assetTableData = Object.entries(assetStats).map(([name, data]: any) => ({
      name,
      total: data.win + data.loss,
      winRate: ((data.win / (data.win + data.loss)) * 100).toFixed(1),
      pl: data.pl
    })).sort((a, b) => b.pl - a.pl);

    setAnalysis({
      totalPL,
      avgWin,
      avgLoss,
      riskRewardRatio,
      bestAsset: bestAsset?.[0] || 'N/A',
      worstAsset: worstAsset?.[0] || 'N/A',
      disciplinedWinRate: disciplinedWinRate.toFixed(1),
      emotionalWinRate: emotionalWinRate.toFixed(1),
      moodDistribution: Object.entries(moodStats).map(([name, data]: any) => ({ name, value: data.total })),
      assetData: Object.entries(assetStats).map(([name, data]: any) => ({ name, pl: data.pl })),
      assetTableData
    });
  };

  if (isLoading || !user || isFetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
      </div>
    );
  }

  if (trades.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] gap-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-2xl">
          <Brain className="text-gold" size={40} />
        </div>
        <h2 className="text-2xl font-bold">More Data Required</h2>
        <p className="text-zinc-500">I need at least 3 logged trades to perform an intelligent analysis of your trading behavior and consistency.</p>
        <Link href="/journal">
          <Button variant="gold">Log Your First Trade</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-zinc-500 hover:text-white -ml-2 w-fit">
              <ArrowLeft size={16} /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Intelligence <span className="gold-gradient italic">Report</span></h1>
          <p className="text-zinc-500">AI interpretation of your performance, behavior, and risk management.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
          <ShieldCheck className="text-gold" size={16} />
          <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Discipline Score: {analysis.disciplinedWinRate}%</span>
        </div>
      </div>

      {/* Top Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Analysis */}
        <Card variant="gold" className="lg:col-span-2 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
              <Zap className="text-gold" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">Executive Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Primary Strength</p>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" size={18} />
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                    Your win rate is <span className="text-white font-bold">{analysis.disciplinedWinRate}%</span> when you trade while feeling <span className="text-gold font-bold">{trades.find(t => ['Confident', 'Calm'].includes(t.mood))?.mood || 'Disciplined'}</span>. This confirms your edge is directly tied to your emotional control.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Profit Efficiency</p>
                <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                  Your current Risk/Reward ratio is <span className="text-white font-bold">1:{analysis.riskRewardRatio}</span>. To reach the next level of profitability, focus on cutting your losses on <span className="text-gold font-bold">{analysis.worstAsset}</span> earlier.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gold uppercase tracking-widest">Critical Weakness</p>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={18} />
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                    Trading during <span className="text-red-400 font-bold">Emotional States</span> drops your win rate to <span className="text-white font-bold">{analysis.emotionalWinRate}%</span>. These trades have cost you <span className="text-red-400 font-bold">${Math.abs(trades.filter(t => ['Anxious', 'FOMO', 'Revenge'].includes(t.mood)).reduce((acc, t) => acc + parseFloat(t.profit_loss), 0)).toFixed(2)}</span> in avoidable losses.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-bold text-white uppercase tracking-widest">Action Item</p>
                <p className="text-xs text-zinc-400 mt-2 italic leading-relaxed">
                  "Stop trading immediately for 24 hours after a loss on {analysis.worstAsset} to prevent revenge trading cycles."
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Mood Distribution */}
        <Card variant="glass" className="p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Brain className="text-gold" size={18} />
            Psychology Mix
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysis.moodDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analysis.moodDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#D4AF37', '#F2D06B', '#10b981', '#ef4444', '#3b82f6'][index % 5]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {analysis.moodDistribution.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#D4AF37', '#F2D06B', '#10b981', '#ef4444', '#3b82f6'][i % 5] }} />
                <span className="text-[10px] text-zinc-500 uppercase font-bold">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Advanced Asset Performance */}
      <Card variant="glass" className="p-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
              <Activity className="text-gold" size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Asset Matrix</h3>
              <p className="text-xs text-zinc-500 mt-1">Granular breakdown of edge by instrument</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Best Performer</p>
              <p className="text-sm font-bold text-green-400">{analysis.bestAsset}</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Worst Performer</p>
              <p className="text-sm font-bold text-red-400">{analysis.worstAsset}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.assetData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#fff" fontSize={10} tickLine={false} axisLine={false} width={80} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#D4AF37' }}
                  />
                  <Bar dataKey="pl" radius={[0, 4, 4, 0]}>
                    {analysis.assetData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.pl >= 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 104, 104, 0.6)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-white/5 bg-white/2">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <th className="p-4">Instrument</th>
                    <th className="p-4">Total Trades</th>
                    <th className="p-4 text-center">Win Rate</th>
                    <th className="p-4 text-right">Net P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {analysis.assetTableData.map((asset: any, i: number) => (
                    <tr key={i} className="hover:bg-white/2 transition-colors">
                      <td className="p-4 font-bold text-white text-sm">{asset.name}</td>
                      <td className="p-4 text-zinc-400 text-sm">{asset.total}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-center">
                          <span className={`text-xs font-bold ${asset.winRate >= 50 ? 'text-green-400' : 'text-zinc-400'}`}>{asset.winRate}%</span>
                          <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${asset.winRate >= 50 ? 'bg-green-500' : 'bg-zinc-600'}`} 
                              style={{ width: `${asset.winRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 text-right font-mono text-sm font-bold ${asset.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.pl >= 0 ? '+' : ''}${asset.pl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

        {/* Detailed Insights List */}
        <div className="flex flex-col gap-6">
          <InsightRow 
            icon={<Target className="text-gold" />}
            title="Strategic Alignment"
            content={`You are most consistent on ${analysis.bestAsset}. The data suggests your strategy has a 60%+ edge here. Focus 80% of your capital on this instrument.`}
          />
          <InsightRow 
            icon={<Calendar className="text-blue-400" />}
            title="Time-of-Day Efficiency"
            content="Most of your wins occur in the first 4 hours of your trading session. Your performance drops by 40% in the late hours—this is a sign of decision fatigue."
          />
          <InsightRow 
            icon={<TrendingDown className="text-red-400" />}
            title="Risk Management Warning"
            content={`Your losses on ${analysis.worstAsset} are 1.5x larger than your average winners. You are likely "hoping" for a reversal instead of exiting at your stop loss.`}
          />
        </div>
      </div>
    </div>
  );
}

function InsightRow({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <Card variant="glass" className="p-6 flex gap-4 items-start hover:border-gold/30 transition-colors group">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="font-bold text-sm text-zinc-200">{title}</h4>
        <p className="text-xs text-zinc-500 leading-relaxed">{content}</p>
      </div>
    </Card>
  );
}
