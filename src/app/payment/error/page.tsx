'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[80vh] px-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.03)_0%,_transparent_70%)] pointer-events-none" />
      
      <Card variant="glass" className="max-w-md w-full p-8 border-red-500/20">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
            <motion.div 
              initial={{ rotate: -20, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <XCircle className="text-red-500" size={48} />
            </motion.div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2">Payment <span className="text-red-500">Failed</span></h2>
            <p className="text-zinc-400 text-sm">We couldn't process your transaction with eSewa. Your account has not been charged.</p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="w-full h-12 gap-2 border-zinc-800 hover:bg-white/5" 
              onClick={() => router.push('/#pricing')}
            >
              <RefreshCw size={18} /> Try Again
            </Button>
            <Button 
              variant="ghost" 
              className="w-full h-12 gap-2 text-zinc-500 hover:text-white"
              onClick={() => window.open('https://esewa.com.np/#/contact-us', '_blank')}
            >
              <MessageSquare size={18} /> Contact Support
            </Button>
          </div>

          <div className="w-full h-px bg-zinc-900 my-2" />

          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-zinc-500 hover:text-gold transition-colors text-sm font-medium"
          >
            <ArrowLeft size={14} /> Back to Free Dashboard
          </button>
        </div>
      </Card>

      <p className="mt-8 text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-bold">
        TradeMind Secure Payment Gateway
      </p>
    </motion.div>
  );
}
