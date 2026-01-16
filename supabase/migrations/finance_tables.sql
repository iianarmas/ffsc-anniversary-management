-- ============================================
-- FINANCE TABLES MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Income Sources Table
-- ============================================
CREATE TABLE IF NOT EXISTS income_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL CHECK (source_type IN ('pledge', 'shirt_sales', 'offering', 'donation', 'other')),
  source_name TEXT,
  pledged_amount DECIMAL(10,2) DEFAULT 0,
  received_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'fulfilled')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Expense Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Expenses Table
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  paid_by TEXT,
  notes TEXT,
  is_planned BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Add finance_manager flag to profiles
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_finance_manager BOOLEAN DEFAULT FALSE;

-- ============================================
-- 5. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Income Sources Policies
CREATE POLICY "Allow read for authenticated users" ON income_sources
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for admin and finance_manager" ON income_sources
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_finance_manager = true)
    )
  );

CREATE POLICY "Allow update for admin and finance_manager" ON income_sources
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_finance_manager = true)
    )
  );

CREATE POLICY "Allow delete for admin and finance_manager" ON income_sources
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_finance_manager = true)
    )
  );

-- Expense Categories Policies
CREATE POLICY "Allow read for authenticated users" ON expense_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for admin and finance_manager" ON expense_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_finance_manager = true)
    )
  );

CREATE POLICY "Allow update for admin and finance_manager" ON expense_categories
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_finance_manager = true)
    )
  );

CREATE POLICY "Allow delete for admin and finance_manager" ON expense_categories
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_finance_manager = true)
    )
  );

-- Expenses Policies
CREATE POLICY "Allow read for authenticated users" ON expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert for admin and finance_manager" ON expenses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_finance_manager = true)
    )
  );

CREATE POLICY "Allow update for admin and finance_manager" ON expenses
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_finance_manager = true)
    )
  );

CREATE POLICY "Allow delete for admin and finance_manager" ON expenses
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_finance_manager = true)
    )
  );

-- ============================================
-- 6. Create default expense categories
-- ============================================
INSERT INTO expense_categories (name, description) VALUES
  ('Venue', 'Venue rental and related costs'),
  ('Food', 'Catering and food supplies'),
  ('Decorations', 'Event decorations and setup'),
  ('Prizes', 'Games and raffle prizes'),
  ('Shirts', 'Anniversary shirt production costs'),
  ('Sound/AV', 'Sound system and audio-visual equipment'),
  ('Transportation', 'Vehicle and transportation costs'),
  ('Miscellaneous', 'Other miscellaneous expenses')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_income_sources_type ON income_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_income_sources_status ON income_sources(status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_is_planned ON expenses(is_planned);
