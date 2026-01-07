-- Migration: Create saved_filter_views table
-- Description: Stores saved filter configurations for different views (shirts, registration, collections)
-- Date: 2026-01-06

-- Create the saved_filter_views table
CREATE TABLE saved_filter_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🔍',
  color TEXT DEFAULT '#0f2a71',

  -- Filter configuration stored as JSONB
  filters JSONB NOT NULL,
  display_options JSONB,

  -- Sharing and permissions
  visibility TEXT CHECK (visibility IN ('private', 'shared', 'team')) DEFAULT 'private',
  shared_with UUID[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Usage tracking
  use_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT false,

  -- View type categorization
  view_type TEXT NOT NULL CHECK (view_type IN ('shirts', 'registration', 'collections')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_saved_views_user ON saved_filter_views(created_by);
CREATE INDEX idx_saved_views_type ON saved_filter_views(view_type);
CREATE INDEX idx_saved_views_favorite ON saved_filter_views(is_favorite) WHERE is_favorite = true;

-- Enable Row Level Security
ALTER TABLE saved_filter_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own views, team views, and views shared with them
CREATE POLICY "Users can view own and team views" ON saved_filter_views
  FOR SELECT USING (
    created_by = auth.uid() OR
    visibility = 'team' OR
    (visibility = 'shared' AND auth.uid() = ANY(shared_with))
  );

-- RLS Policy: Users can insert their own views
CREATE POLICY "Users can insert own views" ON saved_filter_views
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- RLS Policy: Users can update their own views
CREATE POLICY "Users can update own views" ON saved_filter_views
  FOR UPDATE USING (created_by = auth.uid());

-- RLS Policy: Users can delete their own views
CREATE POLICY "Users can delete own views" ON saved_filter_views
  FOR DELETE USING (created_by = auth.uid());

-- Create a function to increment view usage (called via RPC)
CREATE OR REPLACE FUNCTION increment_view_usage(view_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE saved_filter_views
  SET
    use_count = COALESCE(use_count, 0) + 1,
    last_used = NOW()
  WHERE id = view_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_view_usage(UUID) TO authenticated;

-- Add comment to table
COMMENT ON TABLE saved_filter_views IS 'Stores user-created saved filter views with sharing capabilities';
