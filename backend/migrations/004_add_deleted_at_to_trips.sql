-- Migration: 004_add_deleted_at_to_trips
-- Adds deleted_at column to the trips table for soft delete & trash recovery support

ALTER TABLE trips
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
