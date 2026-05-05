'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform">
            <img src="/logo.png" alt="TradeMind Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Trade<span className="gold-gradient">Mind</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</Link>
          <Link href="/#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          {user && (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/journal" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Journal</Link>
              <Link href="/analytics" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Analytics</Link>
              <Link href="/coach" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">AI Coach</Link>
            </>
          )}
          
          <div className="flex items-center gap-4 border-l border-white/10 pl-8">
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div 
                  key="user-menu"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-4">
                    <Link href="/settings" className="p-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-gold hover:border-gold/50 transition-all">
                      <Settings size={18} />
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <User size={16} className="text-gold" />
                      <span className="text-xs font-medium text-zinc-300">
                        {user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                      <LogOut size={16} /> Logout
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="auth-buttons"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="gold" size="sm">Start Free</Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-950 border-b border-white/10 overflow-hidden"
          >
            <div className="p-6 flex flex-col gap-6">
              <Link href="/#features" className="text-lg font-medium text-zinc-400" onClick={() => setIsOpen(false)}>Features</Link>
              <Link href="/#pricing" className="text-lg font-medium text-zinc-400" onClick={() => setIsOpen(false)}>Pricing</Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-lg font-medium text-zinc-400" onClick={() => setIsOpen(false)}>Dashboard</Link>
                  <Button variant="outline" className="w-full gap-2" onClick={() => { logout(); setIsOpen(false); }}>
                    <LogOut size={18} /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="gold" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
