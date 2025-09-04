-- ========================================
-- DASH PLATFORM - DATABASE SCHEMA
-- ========================================
-- Complete database setup with RLS policies and indexes
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ========================================
-- CORE TABLES
-- ========================================

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    bio TEXT,
    home_geo GEOGRAPHY(POINT),
    terms_version INTEGER NOT NULL DEFAULT 0,
    terms_accepted_at TIMESTAMPTZ,
    live_sharing_enabled BOOLEAN DEFAULT FALSE,
    live_sharing_scope TEXT DEFAULT 'nobody' CHECK (live_sharing_scope IN ('friends', 'events', 'nobody')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vin TEXT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    trim TEXT,
    specs JSONB,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle AI cache table
CREATE TABLE public.vehicle_ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL, -- Format: vin:1HGCM82633A004352 or mmy:subaru:wrx:2019:us
    provider TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendships table
CREATE TABLE public.friendships (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Meets table
CREATE TABLE public.meets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    location GEOGRAPHY(POINT) NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 1000,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'club')),
    rules TEXT,
    max_attendees INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meet attendees table
CREATE TABLE public.meet_attendees (
    meet_id UUID NOT NULL REFERENCES public.meets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rsvp TEXT NOT NULL CHECK (rsvp IN ('going', 'interested')),
    checked_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (meet_id, user_id)
);

-- Pins table
CREATE TABLE public.pins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('police', 'hazard', 'construction', 'camera', 'pothole')),
    location GEOGRAPHY(POINT) NOT NULL,
    description TEXT,
    photo TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pin votes table
CREATE TABLE public.pin_votes (
    pin_id UUID NOT NULL REFERENCES public.pins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (pin_id, user_id)
);

-- User locations table (for live presence)
CREATE TABLE public.user_locations (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT) NOT NULL,
    heading REAL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table (for abuse reporting)
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'pin', 'meet', 'user', 'message'
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE public.feature_flags (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT 'true',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entitlements table
CREATE TABLE public.entitlements (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    source TEXT NOT NULL CHECK (source IN ('purchase', 'promo', 'admin')),
    renewed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Admin actions table (audit log)
CREATE TABLE public.admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Profiles indexes
CREATE INDEX idx_profiles_handle ON public.profiles(handle);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- Vehicles indexes
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX idx_vehicles_make_model_year ON public.vehicles(make, model, year);
CREATE INDEX idx_vehicles_vin ON public.vehicles(vin) WHERE vin IS NOT NULL;

-- Vehicle AI cache indexes
CREATE INDEX idx_vehicle_ai_cache_key ON public.vehicle_ai_cache(key);
CREATE INDEX idx_vehicle_ai_cache_created_at ON public.vehicle_ai_cache(created_at);

-- Friendships indexes
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);

-- Meets indexes
CREATE INDEX idx_meets_host_id ON public.meets(host_id);
CREATE INDEX idx_meets_start_at ON public.meets(start_at);
CREATE INDEX idx_meets_location ON public.meets USING GIST(location);
CREATE INDEX idx_meets_visibility ON public.meets(visibility);

-- Meet attendees indexes
CREATE INDEX idx_meet_attendees_meet_id ON public.meet_attendees(meet_id);
CREATE INDEX idx_meet_attendees_user_id ON public.meet_attendees(user_id);

-- Pins indexes
CREATE INDEX idx_pins_user_id ON public.pins(user_id);
CREATE INDEX idx_pins_type ON public.pins(type);
CREATE INDEX idx_pins_location ON public.pins USING GIST(location);
CREATE INDEX idx_pins_expires_at ON public.pins(expires_at);
CREATE INDEX idx_pins_status ON public.pins(status);

-- Pin votes indexes
CREATE INDEX idx_pin_votes_pin_id ON public.pin_votes(pin_id);
CREATE INDEX idx_pin_votes_user_id ON public.pin_votes(user_id);

-- User locations indexes
CREATE INDEX idx_user_locations_location ON public.user_locations USING GIST(location);
CREATE INDEX idx_user_locations_updated_at ON public.user_locations(updated_at);

-- Reports indexes
CREATE INDEX idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX idx_reports_target_type_id ON public.reports(target_type, target_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- Entitlements indexes
CREATE INDEX idx_entitlements_plan ON public.entitlements(plan);
CREATE INDEX idx_entitlements_expires_at ON public.entitlements(expires_at);

-- Admin actions indexes
CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_target_type_id ON public.admin_actions(target_type, target_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meets_updated_at BEFORE UPDATE ON public.meets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCTIONS AND VIEWS
-- ========================================

-- Function to get nearby pins
CREATE OR REPLACE FUNCTION get_nearby_pins(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 25000
)
RETURNS TABLE (
    id UUID,
    type TEXT,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    description TEXT,
    photo TEXT,
    expires_at TIMESTAMPTZ,
    status TEXT,
    upvotes BIGINT,
    downvotes BIGINT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.type,
        ST_Y(p.location::geometry) as location_lat,
        ST_X(p.location::geometry) as location_lng,
        p.description,
        p.photo,
        p.expires_at,
        p.status,
        COALESCE(upvote_counts.count, 0) as upvotes,
        COALESCE(downvote_counts.count, 0) as downvotes,
        p.created_at
    FROM public.pins p
    LEFT JOIN (
        SELECT pin_id, COUNT(*) as count
        FROM public.pin_votes
        WHERE vote = 'up'
        GROUP BY pin_id
    ) upvote_counts ON p.id = upvote_counts.pin_id
    LEFT JOIN (
        SELECT pin_id, COUNT(*) as count
        FROM public.pin_votes
        WHERE vote = 'down'
        GROUP BY pin_id
    ) downvote_counts ON p.id = downvote_counts.pin_id
    WHERE 
        p.status != 'hidden'
        AND p.expires_at > NOW()
        AND ST_DWithin(
            p.location::geography,
            ST_Point(user_lng, user_lat)::geography,
            radius_meters
        )
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;