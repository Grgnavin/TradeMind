'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Send, 
  Sparkles, 
  User, 
  ArrowRight,
  TrendingDown,
  Target,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function CoachPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [trades, setTrades] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchTradesAndInitialize();
    }
  }, [user, isLoading, router]);

  const fetchTradesAndInitialize = async () => {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user?.id);
    
    if (data) {
      setTrades(data);
      const wins = data.filter(t => t.result === 'Win').length;
      const total = data.length;
      const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0';

      setMessages([
        { 
          role: 'assistant', 
          content: `Hello ${user?.user_metadata?.full_name?.split(' ')[0] || 'Trader'}. I've synchronized with your database. You have logged ${total} trades with a ${winRate}% win rate. How can I help you optimize your psychology today?` 
        }
      ]);
    }
  };

  const handleSend = () => {
    if (!input) return;
    const userMsg = input;
    setMessages([...messages, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);
    
    // AI Logic based on real trades
    setTimeout(() => {
      let response = `I hear you, and it's great that you're looking into this. Self-reflection is what separates the top 1% of traders from the rest! 

Based on my analysis of your journey so far, I've noticed that your execution is actually quite sharp when you're in a 'Calm' state of mind. In fact, your success rate during those periods is significantly higher than when you feel rushed. 

My best advice for you today? Try taking three deep breaths before you hit the 'Execute' button on your next setup. It sounds simple, but your data shows that a calm mind is your biggest edge. How does that sound for a plan?`;
      
      if (userMsg.toLowerCase().includes('why') || userMsg.toLowerCase().includes('loss')) {
        const lastLoss = trades.filter(t => t.result === 'Loss').pop();
        if (lastLoss) {
          response = `It's completely normal to feel frustrated after a loss, but let's look at what the data is trying to tell us! 📈

Looking at your most recent trade on **${lastLoss.asset_pair}**, you noted that you were feeling **${lastLoss.mood}**. When we look at your history, we see a recurring pattern: your discipline tends to slip when this specific emotion takes over. 

You mentioned in your notes: "${lastLoss.notes || 'No notes provided'}". This tells me you knew something was off even then. For your next session, let's try a 'Hard Stop' rule—if you feel ${lastLoss.mood}, step away from the charts for at least 30 minutes. You've got the skill, we just need to protect your capital from those emotional spikes! 🛡️`;
        }
      } else if (userMsg.toLowerCase().includes('best') || userMsg.toLowerCase().includes('setup')) {
        const assetStats = trades.reduce((acc: any, t) => {
          if (!acc[t.asset_pair]) acc[t.asset_pair] = { win: 0, total: 0 };
          acc[t.asset_pair].total++;
          if (t.result === 'Win') acc[t.asset_pair].win++;
          return acc;
        }, {});
        
        const top = Object.entries(assetStats).sort((a: any, b: any) => (b[1].win/b[1].total) - (a[1].win/a[1].total))[0];
        
        if (top) {
          const winRate = ((top[1] as any).win / (top[1] as any).total * 100).toFixed(1);
          response = `I love looking for your 'Superpowers'! 🌟 

Statistically speaking, you are a bit of a specialist when it comes to **${top[0]}**. You currently hold a **${winRate}% win rate** on this instrument. That is an incredible baseline to build upon!

While it's tempting to trade everything, the data suggests that your 'Edge' is most refined here. If you focus more of your energy on mastering ${top[0]} and slightly increase your position size there while being more conservative elsewhere, your equity curve will likely see a much smoother climb. What do you think about becoming the 'Master of ${top[0].split('/')[0]}'?`;
        } else {
          response = "I'm so excited to help you find your best setups! Right now, we're still in the 'Data Gathering' phase. Once you log a few more winners in the Journal, I'll be able to pinpoint exactly which asset and mood combo is your secret weapon. Keep up the great work—consistency is the key! 🚀";
        }
      } else if (userMsg.toLowerCase().includes('hello') || userMsg.toLowerCase().includes('hi')) {
        response = `Hello! It's great to see you back at the terminal. 👋 

I've been reviewing your latest executions, and I'm ready to help you navigate today's markets. We've got all your trade data synced up, so whether you want to dive into your psychology or find out which assets are paying you best, I'm here to support you. 

What's on your mind today? Let's make some progress together!`;
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 text-zinc-500 hover:text-white -ml-2 w-fit">
          <ArrowLeft size={16} /> Back to Dashboard
        </Button>
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-220px)]">
        {/* Suggestions Sidebar */}
        <div className="hidden lg:flex flex-col gap-6 col-span-1">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 w-fit">
            <Sparkles className="text-gold" size={14} />
            <span className="text-[10px] font-bold text-gold uppercase tracking-widest text-white">AI Analysis Active</span>
          </div>
          
          <h3 className="text-xl font-bold flex items-center gap-2">
            Data-Driven Prompts
          </h3>
          <div className="flex flex-col gap-3">
            <button onClick={() => setInput("Why am I losing?")} className="text-left">
              <SuggestionCard 
                icon={<TrendingDown className="text-red-400" />}
                label="Why am I losing?" 
              />
            </button>
            <button onClick={() => setInput("What is my best asset?")} className="text-left">
              <SuggestionCard 
                icon={<Target className="text-green-400" />}
                label="What is my best asset?" 
              />
            </button>
            <button onClick={() => setInput("Review my psychology")} className="text-left">
              <SuggestionCard 
                icon={<Brain className="text-blue-400" />}
                label="Review my psychology" 
              />
            </button>
          </div>
          
          <Card variant="glass" className="mt-auto p-4 border-gold/20 bg-gold/5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Coach Status</p>
            <div className="flex items-center gap-2 text-gold text-sm font-bold">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              Analyzed {trades.length} trades
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <Card variant="glass" className="lg:col-span-3 flex flex-col p-0 overflow-hidden border-zinc-800 shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gold-bg-gradient flex items-center justify-center shadow-lg">
                <Brain className="text-black" size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">TradeMind AI Coach</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-tighter font-medium">Synced with Supabase</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMessages([])}>Clear Chat</Button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 scrollbar-premium">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-800' : 'gold-bg-gradient shadow-lg'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Brain size={16} className="text-black" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-zinc-900 border border-zinc-800 text-white shadow-xl' : 'bg-white/5 border border-white/10 text-zinc-300'}`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 p-4">
                  <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.4s' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="p-6 bg-black/40 border-t border-white/5">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your losses, best setups, or psychology..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 pr-16 text-sm focus:outline-none focus:border-gold/50 transition-all shadow-inner text-white"
              />
              <button 
                onClick={handleSend}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl gold-bg-gradient flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SuggestionCard({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-gold/50 transition-all cursor-pointer group flex items-center gap-3 hover:bg-zinc-900 shadow-lg">
      <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-white/5 group-hover:border-gold/20 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-bold text-zinc-500 group-hover:text-white transition-colors uppercase tracking-widest">{label}</span>
      <ArrowRight size={14} className="ml-auto text-zinc-700 group-hover:text-gold transition-colors" />
    </div>
  );
}
