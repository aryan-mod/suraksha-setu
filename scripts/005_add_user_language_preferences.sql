-- Add user language preferences to database
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS number_format VARCHAR(20) DEFAULT 'US';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency_preference VARCHAR(10) DEFAULT 'USD';

-- Add language preferences to notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Create index for language-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(preferred_language);
CREATE INDEX IF NOT EXISTS idx_notifications_language ON notifications(language);

-- Update existing profiles with browser language detection (if available)
-- This would typically be handled by the application layer
