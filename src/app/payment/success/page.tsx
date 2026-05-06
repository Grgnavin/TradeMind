'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateUserMetadata } = useAuth();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const data = searchParams.get('data');
      
      if (!data) {
        setStatus('error');
        setError('No payment data found. Please contact support if you were charged.');
        return;
      }

      try {
        const res = await fetch('/api/payment/esewa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data })
        });

        const result = await res.json();

        if (result.success) {
          // Determine plan based on amount or transaction_uuid prefix
          // For now, we'll look at the amount or just set a 'Pro' flag
          const isElite = result.total_amount >= 2999;
          const plan = isElite ? 'Elite' : 'Pro';

          await updateUserMetadata({ 
            subscription_status: 'active',
            plan: plan,
            payment_date: new Date().toISOString(),
            transaction_id: result.transaction_uuid
          });

          setDetails(result);
          setStatus('success');
        } else {
          setStatus('error');
          setError(result.error || 'Payment verification failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setError('A server error occurred during verification.');
      }
    };

    verifyPayment();
  }, [searchParams, updateUserMetadata]);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border-4 border-gold/20 border-t-gold"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="text-gold animate-pulse" size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold gold-gradient tracking-widest uppercase">Verifying Transaction</h2>
        <p className="text-zinc-500 max-w-sm">Please do not refresh the page while we confirm your payment with eSewa.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/50">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <Loader2 className="text-red-500 animate-spin" size={40} />
          </motion.div>
        </div>
        <h2 className="text-3xl font-bold text-red-500 uppercase">Verification Failed</h2>
        <p className="text-zinc-400 max-w-md">{error}</p>
        <Button variant="outline" onClick={() => router.push('/')} className="mt-4">
          Return to Pricing
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)] pointer-events-none" />
      
      <Card variant="glass" className="max-w-md w-full p-8 border-gold/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck size={120} className="text-gold" />
        </div>

        <div className="flex flex-col items-center text-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center border border-gold/50 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            >
              <CheckCircle2 className="text-gold" size={40} />
            </motion.div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2">Payment <span className="gold-gradient">Successful</span></h2>
            <p className="text-zinc-400 text-sm">Your account has been upgraded to <span className="text-gold font-bold">{details?.total_amount >= 2999 ? 'Elite' : 'Pro'}</span>.</p>
          </div>

          <div className="w-full h-px bg-zinc-800 my-2" />

          <div className="w-full flex flex-col gap-3 text-left">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs uppercase tracking-widest">Transaction ID</span>
              <span className="text-zinc-300 font-mono text-sm">{details?.transaction_uuid.split('-')[1]}...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs uppercase tracking-widest">Amount Paid</span>
              <span className="text-white font-bold">Rs. {details?.total_amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs uppercase tracking-widest">Status</span>
              <span className="text-green-500 font-bold text-xs uppercase bg-green-500/10 px-2 py-1 rounded">Completed</span>
            </div>
          </div>

          <div className="w-full mt-6">
            <Button variant="gold" className="w-full h-14 text-lg gap-2 group" onClick={() => router.push('/dashboard')}>
              Go to Dashboard <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-zinc-500 text-sm"
      >
        A confirmation email has been sent to your registered address.
      </motion.p>
    </motion.div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
