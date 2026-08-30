-- Migration: 003_add_default_travel_style_to_users
-- Adds default_travel_style column to the users table for smart itinerary auto-fill

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS default_travel_style VARCHAR(50) DEFAULT 'Family';
