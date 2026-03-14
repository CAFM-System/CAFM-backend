-- Migration: User Management & Resident Profile Schema Extensions
-- Run this in the Supabase SQL Editor

-- 1. Extend profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email VARCHAR,
  ADD COLUMN IF NOT EXISTS nic_passport VARCHAR UNIQUE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill is_active for existing rows
UPDATE profiles SET is_active = TRUE WHERE is_active IS NULL;

-- 2. Extend residents table
ALTER TABLE residents
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender VARCHAR,
  ADD COLUMN IF NOT EXISTS marital_status VARCHAR,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Create apartment_residents table
CREATE TABLE IF NOT EXISTS apartment_residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_no VARCHAR UNIQUE NOT NULL,
  resident_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Backfill email in profiles from auth.users for existing users
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.user_id = auth.users.id
  AND profiles.email IS NULL;
