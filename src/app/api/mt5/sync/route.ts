import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a server-side client with the service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Mock function to simulate MT5 trade data
const mockMT5Trades = (userId: string) => [
  {
    user_id: userId,
    asset_pair: 'EURUSD',
    type: 'Long',
    timeframe: 'H1',
    entry_price: 1.0850,
    exit_price: 1.0920,
    risk_percent: 1.0,
    result: 'Win',
    profit_loss: 700.0,
    mood: 'Confident',
    notes: 'MT5 Auto-sync: Bullish engulfing on H1 support.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    user_id: userId,
    asset_pair: 'BTCUSD',
    type: 'Short',
    timeframe: 'M15',
    entry_price: 65200,
    exit_price: 64800,
    risk_percent: 2.0,
    result: 'Win',
    profit_loss: 1200.0,
    mood: 'Neutral',
    notes: 'MT5 Auto-sync: Scalp on resistance rejection.',
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    user_id: userId,
    asset_pair: 'XAUUSD',
    type: 'Long',
    timeframe: 'D1',
    entry_price: 2320,
    exit_price: 2310,
    risk_percent: 1.5,
    result: 'Loss',
    profit_loss: -500.0,
    mood: 'Fearful',
    notes: 'MT5 Auto-sync: Stopped out on news volatility.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  }
];

export async function POST(request: Request) {
  try {
    const { userId, connectionId } = await request.json();

    if (!userId || !connectionId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Fetch connection details
    const { data: connection, error: connError } = await supabaseAdmin
      .from('mt5_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', userId) // Security check: Ensure user owns this connection
      .single();

    if (connError || !connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // 2. Update status to 'Syncing'
    await supabaseAdmin
      .from('mt5_connections')
      .update({ status: 'Syncing' })
      .eq('id', connectionId);

    // 3. Simulate API call to MT5 Cloud Bridge (e.g., MetaApi)
    await new Promise(resolve => setTimeout(resolve, 2000)); 

    const tradesToSync = mockMT5Trades(userId);

    // 4. Insert trades into the database
    const { error: syncError } = await supabaseAdmin
      .from('trades')
      .insert(tradesToSync);

    if (syncError) throw syncError;

    // 5. Update connection status
    await supabaseAdmin
      .from('mt5_connections')
      .update({ 
        status: 'Connected', 
        last_sync_at: new Date().toISOString() 
      })
      .eq('id', connectionId);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${tradesToSync.length} trades from MT5.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
