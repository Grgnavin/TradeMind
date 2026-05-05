-- Create Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_pair TEXT NOT NULL,
  type TEXT CHECK (type IN ('Long', 'Short')),
  timeframe TEXT,
  entry_price DECIMAL,
  exit_price DECIMAL,
  risk_percent DECIMAL,
  result TEXT CHECK (result IN ('Win', 'Loss', 'Breakeven')),
  profit_loss DECIMAL,
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Analytics table for AI Insights
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_text TEXT NOT NULL,
  category TEXT, -- e.g., 'Psychology', 'Performance', 'Strategy'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can only view their own trades" 
  ON trades FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own trades" 
  ON trades FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own trades" 
  ON trades FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own insights" 
  ON ai_insights FOR SELECT 
  USING (auth.uid() = user_id);

-- Create Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create User Settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_risk_percent DECIMAL DEFAULT 1.0,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  ai_feedback_style TEXT DEFAULT 'Coaching', -- 'Coaching' or 'Summary'
  ai_strictness TEXT DEFAULT 'Balanced', -- 'Gentle', 'Balanced', 'Strict'
  notifications_daily_summary BOOLEAN DEFAULT TRUE,
  notifications_ai_insights BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to create profile and settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'display_name'
  );

  -- Insert into user_settings
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create MT5 Connections table
CREATE TABLE IF NOT EXISTS mt5_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  account_password TEXT, -- In production, this should be encrypted
  server TEXT NOT NULL,
  api_key TEXT, -- MetaApi or similar service key
  status TEXT DEFAULT 'Disconnected', -- 'Connected', 'Disconnected', 'Syncing', 'Error'
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for MT5 connections
ALTER TABLE mt5_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MT5 connections"
  ON mt5_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MT5 connections"
  ON mt5_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MT5 connections"
  ON mt5_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MT5 connections"
  ON mt5_connections FOR DELETE
  USING (auth.uid() = user_id);



