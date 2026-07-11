-- SQL Script to foolproof the Supabase database schema
-- Run this in your Supabase SQL Editor to enforce strict data integrity rules at the database level.

-- 1. Enforce that short_json has correct types for essential fields
ALTER TABLE public.companies_json
DROP CONSTRAINT IF EXISTS check_short_json_types;

ALTER TABLE public.companies_json
ADD CONSTRAINT check_short_json_types
CHECK (
  -- logo_url must be string, null, or absent
  (short_json -> 'logo_url' IS NULL OR jsonb_typeof(short_json -> 'logo_url') IN ('string', 'null')) AND
  
  -- name must be a string (cannot be null or absent)
  (short_json -> 'name' IS NOT NULL AND jsonb_typeof(short_json -> 'name') = 'string') AND
  
  -- category must be string or null
  (short_json -> 'category' IS NULL OR jsonb_typeof(short_json -> 'category') IN ('string', 'null')) AND
  
  -- office_locations must be string or null
  (short_json -> 'office_locations' IS NULL OR jsonb_typeof(short_json -> 'office_locations') IN ('string', 'null')) AND
  
  -- operating_countries must be string or null
  (short_json -> 'operating_countries' IS NULL OR jsonb_typeof(short_json -> 'operating_countries') IN ('string', 'null'))
);

-- 2. Enforce that innovx_json has correct types for essential fields
ALTER TABLE public.innovx_json
DROP CONSTRAINT IF EXISTS check_innovx_json_types;

ALTER TABLE public.innovx_json
ADD CONSTRAINT check_innovx_json_types
CHECK (
  (json_data -> 'innovx_master' IS NULL OR jsonb_typeof(json_data -> 'innovx_master') = 'object') AND
  (json_data -> 'strategic_pillars' IS NULL OR jsonb_typeof(json_data -> 'strategic_pillars') = 'array') AND
  (json_data -> 'industry_trends' IS NULL OR jsonb_typeof(json_data -> 'industry_trends') = 'array')
);
