-- Create system_settings table for storing application-wide settings
-- This table should only have one row and only be editable by admins

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  allow_add_person BOOLEAN DEFAULT true NOT NULL,
  allow_shirt_size_change BOOLEAN DEFAULT true NOT NULL,
  allow_print_change BOOLEAN DEFAULT true NOT NULL,
  allow_payment_change BOOLEAN DEFAULT true NOT NULL,
  allow_distribution_change BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings (all enabled)
INSERT INTO system_settings (
  allow_add_person,
  allow_shirt_size_change,
  allow_print_change,
  allow_payment_change,
  allow_distribution_change
) VALUES (true, true, true, true, true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read settings
CREATE POLICY "Anyone can read system settings"
  ON system_settings
  FOR SELECT
  USING (true);

-- Policy: Only admins can update settings
CREATE POLICY "Only admins can update system settings"
  ON system_settings
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Policy: Only admins can insert settings (if table is empty)
CREATE POLICY "Only admins can insert system settings"
  ON system_settings
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Create index for faster lookups (though there's only one row)
CREATE INDEX IF NOT EXISTS idx_system_settings_id ON system_settings(id);

-- Add comment to table
COMMENT ON TABLE system_settings IS 'Application-wide settings that control feature availability. Should only contain one row.';

-- Enable realtime for this table so changes propagate immediately
ALTER PUBLICATION supabase_realtime ADD TABLE system_settings;
