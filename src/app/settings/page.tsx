'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Bell, Brain, Shield, ExternalLink, Globe, DollarSign, 
  Percent, Check, Save, Download, AlertTriangle, RefreshCw, Plus, Lock, Server, Key
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type TabType = 'account' | 'trading' | 'ai' | 'notifications' | 'data' | 'connections';

export default function SettingsPage() {
  const { user, updateUserMetadata } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState({
    default_risk_percent: 1.0,
    currency: 'USD',
    timezone: 'UTC',
    ai_feedback_style: 'Coaching',
    ai_strictness: 'Balanced',
    notifications_daily_summary: true,
    notifications_ai_insights: true,
  });

  // Account State
  const [name, setName] = useState(user?.user_metadata?.display_name || user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');

  // MT5 State
  const [isMT5ModalOpen, setIsMT5ModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mt5Account, setMt5Account] = useState({ account_id: '', account_password: '', server: '', api_key: '' });
  const [connection, setConnection] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchMT5Connection();
    }
  }, [user]);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', user?.id).single();
    if (!error && data) setSettings(data);
  };

  const fetchMT5Connection = async () => {
    const { data, error } = await supabase.from('mt5_connections').select('*').eq('user_id', user?.id).single();
    if (!error && data) {
      setConnection(data);
      setMt5Account({ account_id: data.account_id, account_password: '••••••••', server: data.server, api_key: data.api_key || '' });
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      if (name !== (user?.user_metadata?.display_name || user?.user_metadata?.full_name)) {
        await updateUserMetadata({ display_name: name, full_name: name });
        await supabase.from('profiles').update({ display_name: name, full_name: name }).eq('id', user?.id);
      }
      const { error } = await supabase.from('user_settings').upsert({ user_id: user?.id, ...settings, updated_at: new Date().toISOString() });
      if (error) throw error;
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectMT5 = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('mt5_connections').upsert({ user_id: user?.id, ...mt5Account, status: 'Connected' }).select().single();
      if (error) throw error;
      setConnection(data);
      setIsMT5ModalOpen(false);
      alert("MT5 Connected!");
    } catch (error: any) {
      alert("Failed: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncTrades = async () => {
    if (!connection) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/mt5/sync', { method: 'POST', body: JSON.stringify({ userId: user?.id, connectionId: connection.id }) });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchMT5Connection();
      } else throw new Error(data.error);
    } catch (error: any) {
      alert("Sync failed: " + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetHistory = async () => {
    if (window.confirm("Are you sure you want to delete ALL your trading data? This cannot be undone.")) {
      setIsSaving(true);
      try {
        const { error } = await supabase
          .from('trades')
          .delete()
          .eq('user_id', user?.id);
        
        if (error) throw error;
        alert("Trading history reset successfully.");
      } catch (error: any) {
        alert("Failed to reset history: " + error.message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'trading', label: 'Trading', icon: Settings },
    { id: 'ai', label: 'AI Coach', icon: Brain },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'connections', label: 'Connections', icon: ExternalLink },
    { id: 'data', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex flex-col gap-2">
          <h2 className="text-xl font-bold mb-4 px-4">Settings</h2>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gold/10 text-gold border border-gold/20' : 'text-zinc-500 hover:bg-white/5'}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <Card variant="glass" className="p-8 min-h-[500px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8">
                
                {activeTab === 'account' && (
                  <div className="flex flex-col gap-6">
                    <div><h3 className="text-xl font-bold mb-1">Account Details</h3><p className="text-zinc-500 text-sm">Manage your personal information.</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2"><label className="text-xs font-bold uppercase text-zinc-500">Display Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-gold/50" /></div>
                      <div className="flex flex-col gap-2"><label className="text-xs font-bold uppercase text-zinc-500">Email</label><input type="email" value={email} disabled className="bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-zinc-500" /></div>
                    </div>
                  </div>
                )}

                {activeTab === 'trading' && (
                  <div className="flex flex-col gap-6">
                    <div><h3 className="text-xl font-bold mb-1">Trading Preferences</h3><p className="text-zinc-500 text-sm">Set your default parameters.</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2"><Percent size={12}/> Default Risk %</label>
                        <input type="number" step="0.1" value={settings.default_risk_percent} onChange={(e) => setSettings({...settings, default_risk_percent: parseFloat(e.target.value)})} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2"><DollarSign size={12}/> Currency</label>
                        <select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3">
                          <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-2"><Globe size={12}/> Timezone</label>
                        <select value={settings.timezone} onChange={(e) => setSettings({...settings, timezone: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl px-4 py-3">
                          <option value="UTC">UTC (London)</option><option value="EST">EST (New York)</option><option value="PST">PST (Los Angeles)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="flex flex-col gap-6">
                    <div><h3 className="text-xl font-bold mb-1">AI Coaching Tuning</h3><p className="text-zinc-500 text-sm">Fine-tune the AI feedback engine.</p></div>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-4">
                        <label className="text-xs font-bold uppercase text-zinc-500">Feedback Style</label>
                        <div className="flex gap-4">
                          {['Coaching', 'Summary'].map((s) => (
                            <button key={s} onClick={() => setSettings({...settings, ai_feedback_style: s})} className={`flex-1 py-4 rounded-xl border ${settings.ai_feedback_style === s ? 'bg-gold/10 border-gold/50 text-gold' : 'bg-black/50 border-white/5 text-zinc-500'}`}>{s === 'Coaching' ? 'Deep Coaching' : 'Quick Summary'}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <label className="text-xs font-bold uppercase text-zinc-500">Strictness Level</label>
                        <div className="flex gap-4">
                          {['Gentle', 'Balanced', 'Strict'].map((l) => (
                            <button key={l} onClick={() => setSettings({...settings, ai_strictness: l})} className={`flex-1 py-4 rounded-xl border ${settings.ai_strictness === l ? 'bg-gold/10 border-gold/50 text-gold' : 'bg-black/50 border-white/5 text-zinc-500'}`}>{l}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="flex flex-col gap-6">
                    <div><h3 className="text-xl font-bold mb-1">Notification Controls</h3><p className="text-zinc-500 text-sm">Choose what insights we send you.</p></div>
                    <div className="flex flex-col gap-4">
                      {[
                        { id: 'notifications_daily_summary', label: 'Daily Trading Summary' },
                        { id: 'notifications_ai_insights', label: 'Real-time AI Insights' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5">
                          <span className="font-medium">{item.label}</span>
                          <button onClick={() => setSettings({...settings, [item.id]: !settings[item.id as keyof typeof settings]})} className={`w-12 h-6 rounded-full transition-colors relative ${settings[item.id as keyof typeof settings] ? 'bg-gold' : 'bg-zinc-800'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[item.id as keyof typeof settings] ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'connections' && (
                  <div className="flex flex-col gap-6">
                    <div><h3 className="text-xl font-bold mb-1">Platform Connections</h3><p className="text-zinc-500 text-sm">Sync your broker data automatically.</p></div>
                    <div className="p-6 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><RefreshCw className="text-blue-500" size={24} /></div>
                        <div><h4 className="font-bold text-lg">MetaTrader 5</h4><p className="text-xs text-zinc-500">{connection ? `Connected Account: ${connection.account_id}` : 'Not connected to any broker'}</p></div>
                      </div>
                      <div className="flex gap-2">
                        {connection ? (
                          <Button variant="outline" size="sm" className="gap-2" onClick={handleSyncTrades} disabled={isSyncing}><RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Syncing...' : 'Sync Now'}</Button>
                        ) : (
                          <Button variant="gold" size="sm" className="gap-2" onClick={() => setIsMT5ModalOpen(true)}><Plus size={16} /> Connect MT5</Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="flex flex-col gap-6">
                    <div><h3 className="text-xl font-bold mb-1">Privacy & Data</h3></div>
                    <div className="flex flex-col gap-4">
                      <div className="p-6 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between">
                        <div><h4 className="font-bold">Export History</h4><p className="text-xs text-zinc-500">Download all your trades in CSV format.</p></div>
                        <Button variant="outline" size="sm"><Download size={16} className="mr-2"/> Export</Button>
                      </div>
                      <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                        <div><h4 className="font-bold text-red-500">Reset Trading History</h4><p className="text-xs text-zinc-500">Delete all your trades and start fresh. This cannot be undone.</p></div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:bg-red-500/10 border border-red-500/20" 
                          onClick={handleResetHistory}
                        >
                          Delete All Trades
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
              <AnimatePresence>{showSuccess && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-green-500 text-sm flex items-center gap-2"><Check size={16} /> Settings Saved</motion.div>}</AnimatePresence>
              <Button variant="gold" className="min-w-[140px] gap-2" onClick={handleSaveSettings} disabled={isSaving}><Save size={18} /> Save All Changes</Button>
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isMT5ModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-bold">MT5 Connection</h3><button onClick={() => setIsMT5ModalOpen(false)}>✕</button></div>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2"><label className="text-xs font-bold text-zinc-500 uppercase">Account Login</label><input type="text" placeholder="123456" value={mt5Account.account_id} onChange={(e) => setMt5Account({...mt5Account, account_id: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" /></div>
                <div className="flex flex-col gap-2"><label className="text-xs font-bold text-zinc-500 uppercase">Investor Password</label><input type="password" placeholder="••••••••" value={mt5Account.account_password} onChange={(e) => setMt5Account({...mt5Account, account_password: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" /></div>
                <div className="flex flex-col gap-2"><label className="text-xs font-bold text-zinc-500 uppercase">Broker Server</label><input type="text" placeholder="ICMarkets-SC-MT5-1" value={mt5Account.server} onChange={(e) => setMt5Account({...mt5Account, server: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" /></div>
                <Button variant="gold" className="w-full py-4 mt-4" onClick={handleConnectMT5} disabled={isSaving}>Verify & Connect</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
