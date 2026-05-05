'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Zap, 
  Shield, 
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Loader2,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EsewaButton from '@/components/payment/EsewaButton';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Generate a unique order ID for eSewa
  const generateOrderId = () => `TM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const handleStartJournal = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const startDemo = () => {
    setShowDemo(true);
    setDemoStep(1);
    setTimeout(() => setDemoStep(2), 1500);
    setTimeout(() => setDemoStep(3), 3000);
    setTimeout(() => setDemoStep(4), 5000);
  };

  return (
    <div className="flex flex-col gap-24 pb-24 relative">
      {/* Crazy Demo Overlay */}
      <AnimatePresence>
        {showDemo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
            {/* Background matrix-like effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="grid grid-cols-10 h-full w-full">
                {Array.from({ length: 50 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 1000, opacity: [0, 1, 0] }}
                    transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 2 }}
                    className="text-gold text-[8px] font-mono flex flex-col items-center"
                  >
                    {Math.random().toString(36).substring(7)}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative z-10 text-center max-w-lg px-6">
              {demoStep === 1 && (
                <motion.div key="step1" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center border border-gold/50 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                    <Cpu className="text-gold animate-pulse" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-widest uppercase">Initializing TradeMind AI Core...</h2>
                  <div className="w-64 h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2 }} className="h-full bg-gold shadow-[0_0_10px_#D4AF37]" />
                  </div>
                </motion.div>
              )}

              {demoStep === 2 && (
                <motion.div key="step2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex flex-col items-center gap-6">
                  <div className="flex gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-bounce delay-75"><TrendingUp className="text-green-500" /></div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-bounce delay-150"><Brain className="text-gold" /></div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-bounce delay-300"><Target className="text-blue-500" /></div>
                  </div>
                  <h2 className="text-3xl font-bold">Scanning Your Psychology...</h2>
                  <p className="text-zinc-500 font-mono text-sm">Detecting FOMO patterns in history_v2.csv</p>
                </motion.div>
              )}

              {demoStep === 3 && (
                <motion.div key="step3" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gold blur-[100px] opacity-40" />
                    <Card className="p-8 border-gold shadow-[0_0_50px_rgba(212,175,55,0.5)] gold-bg-gradient">
                      <div className="flex items-center gap-4 mb-4">
                        <Sparkles className="text-black" />
                        <span className="text-black font-extrabold uppercase text-xs tracking-widest">AI Edge Discovered</span>
                      </div>
                      <h3 className="text-5xl font-black text-black mb-4 tracking-tighter">+42.5% Profitability</h3>
                      <p className="text-black/80 text-base font-bold leading-relaxed max-w-sm">
                        "Your win rate spikes to 85% when you wait for the NY session rejection after a London sweep."
                      </p>
                    </Card>
                  </div>
                  <h2 className="text-2xl font-bold italic text-gold drop-shadow-lg">This is the power of TradeMind AI.</h2>
                </motion.div>
              )}

              {demoStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
                  <h2 className="text-4xl font-bold">Ready to Master Your Edge?</h2>
                  <div className="flex flex-col gap-4 w-full">
                    <Button variant="gold" size="lg" onClick={handleStartJournal} className="w-full h-16 text-lg">Start Free Trial</Button>
                    <button onClick={() => setShowDemo(false)} className="text-zinc-500 hover:text-white text-sm transition-colors">Close Demo</button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold text-gold text-sm font-medium mb-8">
              <Zap size={16} />
              AI-Powered Trading Intelligence
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
              Stop Trading with <br />
              <span className="gold-gradient italic">Blind Spots</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
              TradeMind isn't just a journal. It's an AI trading coach that analyzes your psychology, 
              detects revenge trading, and helps you master your edge.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button variant="gold" size="lg" onClick={handleStartJournal} className="w-full sm:w-auto gap-2">
                Start Your Journal <ArrowRight size={20} />
              </Button>
              <Button variant="outline" size="lg" onClick={startDemo} className="w-full sm:w-auto gap-2 group">
                Watch Demo <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="group-hover:text-gold transition-colors"><Zap size={18} /></motion.div>
              </Button>
            </div>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <Card variant="glass" className="p-2 overflow-hidden">
              <div className="bg-zinc-950 rounded-xl p-8 flex flex-col md:flex-row items-center gap-12 justify-between">
                <div className="text-left">
                  <p className="text-zinc-500 text-sm mb-1 uppercase tracking-widest">Global Performance</p>
                  <h3 className="text-3xl font-bold text-white">+24.8% <span className="text-green-500 text-sm font-normal">avg. growth</span></h3>
                </div>
                <div className="flex gap-8">
                  <Stat label="Win Rate" value="68%" color="text-gold" />
                  <Stat label="Profit Factor" value="2.4" color="text-white" />
                  <Stat label="Discipline" value="94/100" color="text-blue-400" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Built for the <span className="gold-gradient">Elite</span></h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Traditional journals track numbers. We track the mind behind the trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
          <FeatureCard 
            icon={<Brain className="text-gold" size={24} />}
            title="Psychology Insights"
            description="AI connects your mood, sleep, and confidence to your win rate. Find out exactly when you're prone to errors."
          />
          <FeatureCard 
            icon={<Target className="text-gold" size={24} />}
            title="Mistake Detection"
            description="Automatically flags revenge trades, early exits, and over-leveraging before they wipe your account."
          />
          <FeatureCard 
            icon={<MessageSquare className="text-gold" size={24} />}
            title="AI Trading Coach"
            description="Chat with an AI that knows your trading history. Ask why you're losing and get data-backed answers."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Choose Your <span className="gold-gradient">Edge</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-white">
          <PricingCard 
            tier="Free"
            price="Rs. 0"
            priceValue={0}
            description="For beginners starting their journey."
            features={["20 Trades / month", "Basic Statistics", "Manual Entry", "Public Community"]}
          />
          <PricingCard 
            tier="Pro"
            price="Rs. 1499"
            priceValue={1499}
            description="For serious traders refining their edge."
            features={["Unlimited Trades", "AI Psychology Analysis", "Advanced Dashboard", "MT5 Sync Support", "eSewa Payment Support"]}
            popular
            orderId={generateOrderId()}
          />
          <PricingCard 
            tier="Elite"
            price="Rs. 2999"
            priceValue={2999}
            description="For professionals scaling their capital."
            features={["24/7 AI Trading Coach", "Personal Strategy Optimizer", "Priority Support", "Whale Pattern Alerts", "eSewa Payment Support"]}
            orderId={generateOrderId()}
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="text-center">
      <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card variant="glass" className="hover:border-gold/30 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

function PricingCard({ tier, price, priceValue, description, features, popular, orderId }: { tier: string, price: string, priceValue: number, description: string, features: string[], popular?: boolean, orderId?: string }) {
  return (
    <Card variant={popular ? 'gold' : 'glass'} className={`relative flex flex-col ${popular ? 'scale-105 z-10' : ''}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 gold-bg-gradient text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">{tier}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-zinc-500">/mo</span>
        </div>
        <p className="text-zinc-400 text-sm mt-4">{description}</p>
      </div>
      <div className="flex flex-col gap-4 mb-10 flex-grow">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
            <CheckCircle2 size={16} className={popular ? 'text-gold' : 'text-zinc-500'} />
            {feature}
          </div>
        ))}
      </div>
      
      {priceValue > 0 && orderId ? (
        <EsewaButton amount={priceValue} productId={orderId} planName={tier} />
      ) : (
        <Button variant={popular ? 'gold' : 'outline'} className="w-full">
          Get Started
        </Button>
      )}
    </Card>
  );
}
