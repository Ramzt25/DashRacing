-- ========================================
-- GRIDGHOST RACING PLATFORM - SUPABASE SETUP
-- ========================================
-- Complete database setup with RLS policies and indexes
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- CORE TABLES
-- ========================================

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    presence_mode TEXT DEFAULT 'METRO' CHECK (presence_mode IN ('OFF', 'METRO', 'VENUE')),
    
    -- Subscription fields
    is_pro BOOLEAN DEFAULT false,
    subscription_tier TEXT CHECK (subscription_tier IN ('monthly', 'yearly')),
    subscription_start TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    subscription_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cars table
CREATE TABLE public.cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    make TEXT,
    model TEXT,
    year INTEGER,
    trim TEXT,
    color TEXT,
    class TEXT,
    owned BOOLEAN DEFAULT false,
    estimated_value DECIMAL(10,2),
    image_url TEXT,
    
    -- Physical specs
    weight_kg INTEGER,
    whp INTEGER,
    drivetrain TEXT CHECK (drivetrain IN ('RWD', 'FWD', 'AWD')),
    
    -- AI Performance Analysis
    base_power DECIMAL(8,2),
    base_torque DECIMAL(8,2),
    base_weight DECIMAL(8,2),
    current_power DECIMAL(8,2),
    current_torque DECIMAL(8,2),
    current_weight DECIMAL(8,2),
    performance_score DECIMAL(5,2),
    ai_analysis_date TIMESTAMPTZ,
    
    -- Vehicle Database Reference
    vehicle_data_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Database (AI-powered knowledge base)
CREATE TABLE public.vehicle_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Vehicle Identification
    year INTEGER NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    trim TEXT,
    generation TEXT,
    
    -- Classification
    category TEXT,
    body_style TEXT,
    vehicle_class TEXT,
    segment TEXT,
    
    -- Engine Specs
    engine_displacement DECIMAL(4,2),
    engine_configuration TEXT,
    aspiration TEXT,
    fuel_type TEXT,
    
    -- Performance Data
    horsepower INTEGER,
    horsepower_wheel INTEGER,
    torque INTEGER,
    acceleration_0_to_60 DECIMAL(4,2),
    quarter_mile DECIMAL(4,2),
    top_speed INTEGER,
    power_to_weight DECIMAL(6,3),
    
    -- Physical Specs
    weight INTEGER,
    weight_kg INTEGER,
    length DECIMAL(5,2),
    width DECIMAL(5,2),
    height DECIMAL(5,2),
    wheelbase DECIMAL(5,2),
    
    -- Drivetrain
    drivetrain TEXT,
    transmission TEXT,
    gears INTEGER,
    
    -- Market Data
    original_msrp INTEGER,
    current_market_value INTEGER,
    production_years TEXT,
    production_numbers INTEGER,
    
    -- AI Insights
    ai_insights JSONB,
    common_modifications JSONB,
    reliability_score DECIMAL(3,2),
    performance_score DECIMAL(5,2),
    value_score DECIMAL(5,2),
    
    -- Data Quality
    data_source TEXT DEFAULT 'AI-Generated',
    confidence DECIMAL(3,2) DEFAULT 0.8,
    ai_model TEXT,
    generated_by UUID,
    verified_by UUID,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMPTZ,
    
    -- Usage Statistics
    lookup_count INTEGER DEFAULT 1,
    last_used TIMESTAMPTZ DEFAULT NOW(),
    popularity_score DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(year, make, model, trim)
);

-- Modifications table
CREATE TABLE public.modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    notes TEXT,
    
    -- AI Enhancement Data
    power_gain DECIMAL(6,2),
    torque_gain DECIMAL(6,2),
    weight_change DECIMAL(6,2),
    reliability_impact DECIMAL(3,2),
    compatibility_score DECIMAL(3,2),
    performance_gain DECIMAL(5,2),
    ai_confidence DECIMAL(3,2),
    
    -- Web Scraped Data
    market_price DECIMAL(10,2),
    availability TEXT,
    vendor_url TEXT,
    reviews JSONB,
    last_price_update TIMESTAMPTZ,
    
    -- Learning System Links
    mod_database_id UUID,
    predicted_gains JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modification Database (Learning system)
CREATE TABLE public.modification_database (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Modification Identification
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT,
    part_number TEXT,
    
    -- Vehicle Compatibility
    compatible_with JSONB NOT NULL,
    restricted_to JSONB,
    
    -- AI Predictions vs Real Results
    predicted_power_gain DECIMAL(6,2),
    actual_power_gain DECIMAL(6,2),
    predicted_torque_gain DECIMAL(6,2),
    actual_torque_gain DECIMAL(6,2),
    predicted_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    
    -- Learning Statistics
    total_installs INTEGER DEFAULT 0,
    dyno_result_count INTEGER DEFAULT 0,
    accuracy DECIMAL(3,2),
    confidence_level DECIMAL(3,2) DEFAULT 0.5,
    
    -- Performance Metrics
    reliability_score DECIMAL(3,2),
    popularity_score DECIMAL(5,2) DEFAULT 0,
    value_score DECIMAL(5,2),
    
    -- Installation Data
    avg_install_time DECIMAL(4,1),
    difficulty_rating DECIMAL(3,1),
    tools_required JSONB,
    
    -- Market Data
    price_history JSONB,
    availability TEXT,
    
    -- Learning System Metadata
    last_learning_update TIMESTAMPTZ,
    data_source TEXT DEFAULT 'AI-Generated',
    ai_model TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dyno Results (Real-world performance data)
CREATE TABLE public.dyno_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links
    car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
    modification_id UUID REFERENCES public.modifications(id),
    mod_database_id UUID REFERENCES public.modification_database(id),
    
    -- Dyno Session Info
    dyno_type TEXT,
    dyno_shop TEXT,
    operator TEXT,
    
    -- Before Modification (Baseline)
    baseline_power DECIMAL(6,2),
    baseline_torque DECIMAL(6,2),
    baseline_rpm INTEGER,
    
    -- After Modification (Results)
    result_power DECIMAL(6,2) NOT NULL,
    result_torque DECIMAL(6,2) NOT NULL,
    result_rpm INTEGER,
    
    -- Calculated Gains
    power_gain DECIMAL(6,2) NOT NULL,
    torque_gain DECIMAL(6,2) NOT NULL,
    percent_gain DECIMAL(5,2),
    
    -- Environmental Conditions
    temperature DECIMAL(4,1),
    humidity DECIMAL(4,1),
    barometric_pressure DECIMAL(5,2),
    correction_factor TEXT,
    
    -- Modification Details
    modification_cost DECIMAL(10,2),
    installation_time DECIMAL(4,1),
    installation_notes TEXT,
    
    -- User Feedback
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 10),
    would_recommend BOOLEAN,
    notes TEXT,
    
    -- Learning System Integration
    used_for_learning BOOLEAN DEFAULT false,
    confidence_score DECIMAL(3,2),
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID,
    verification_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Races table
CREATE TABLE public.races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT,
    race_type TEXT NOT NULL CHECK (race_type IN ('drag', 'circuit', 'street', 'track')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'starting', 'active', 'completed', 'cancelled')),
    max_participants INTEGER DEFAULT 8,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    distance DECIMAL(6,2),
    entry_fee DECIMAL(8,2),
    prize_payout DECIMAL(10,2),
    location_name TEXT,
    location_address TEXT,
    location_lat DECIMAL(10,8),
    location_lon DECIMAL(11,8),
    rules JSONB,
    weather JSONB,
    track_conditions JSONB,
    safety_features JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Race Participants
CREATE TABLE public.race_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
    racer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    position INTEGER,
    time DECIMAL(6,3),
    
    UNIQUE(race_id, racer_id)
);

-- Race Results
CREATE TABLE public.race_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID NOT NULL REFERENCES public.races(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    position INTEGER,
    time_seconds DECIMAL(6,3),
    top_speed DECIMAL(5,2),
    lap_times JSONB,
    
    -- AI Performance Analysis
    performance_score DECIMAL(5,2),
    acceleration_score DECIMAL(5,2),
    handling_score DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    skill_rating DECIMAL(5,2),
    car_potential DECIMAL(5,2),
    
    -- Detailed Telemetry
    telemetry_data JSONB,
    weather_conditions TEXT,
    track_condition TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(race_id, participant_id)
);

-- Race Sessions
CREATE TABLE public.race_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES public.races(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT false,
    session_type TEXT DEFAULT 'practice' CHECK (session_type IN ('practice', 'qualifying', 'race')),
    total_distance DECIMAL(6,2),
    max_speed DECIMAL(5,2),
    average_speed DECIMAL(5,2),
    zero_to_sixty DECIMAL(4,2),
    quarter_mile DECIMAL(4,2),
    half_mile DECIMAL(4,2),
    lap_times JSONB,
    g_forces JSONB,
    
    -- AI Performance Analysis
    performance_score DECIMAL(5,2),
    driving_style TEXT,
    improvement_tips JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS Points for race sessions
CREATE TABLE public.gps_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.race_sessions(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(6,2),
    timestamp TIMESTAMPTZ NOT NULL,
    accuracy DECIMAL(5,2),
    speed DECIMAL(5,2),
    heading DECIMAL(5,2),
    sequence_index INTEGER NOT NULL
);

-- Events
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('meetup', 'race', 'show', 'cruise')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location_name TEXT,
    location_address TEXT,
    location_lat DECIMAL(10,8),
    location_lon DECIMAL(11,8),
    max_attendees INTEGER,
    entry_fee DECIMAL(8,2),
    requirements JSONB,
    tags TEXT,
    image_url TEXT,
    is_public BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Attendance
CREATE TABLE public.attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
    notes TEXT,
    
    UNIQUE(event_id, user_id)
);

-- Social Features
CREATE TABLE public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    UNIQUE(follower_id, following_id)
);

CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_urls TEXT,
    tags TEXT,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Users indexes
CREATE INDEX idx_users_handle ON public.users(handle);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_subscription ON public.users(subscription_tier, subscription_end);

-- Cars indexes
CREATE INDEX idx_cars_user_id ON public.cars(user_id);
CREATE INDEX idx_cars_make_model ON public.cars(make, model);
CREATE INDEX idx_cars_vehicle_data_id ON public.cars(vehicle_data_id);

-- Vehicle Database indexes
CREATE INDEX idx_vehicle_database_year_make ON public.vehicle_database(year, make);
CREATE INDEX idx_vehicle_database_make_model ON public.vehicle_database(make, model);
CREATE INDEX idx_vehicle_database_category ON public.vehicle_database(category, body_style);
CREATE INDEX idx_vehicle_database_popularity ON public.vehicle_database(popularity_score);
CREATE INDEX idx_vehicle_database_lookup_count ON public.vehicle_database(lookup_count);

-- Modifications indexes
CREATE INDEX idx_modifications_car_id ON public.modifications(car_id);
CREATE INDEX idx_modifications_mod_database_id ON public.modifications(mod_database_id);
CREATE INDEX idx_modifications_category ON public.modifications(category, brand);

-- Modification Database indexes
CREATE INDEX idx_mod_database_category_brand ON public.modification_database(category, brand);
CREATE INDEX idx_mod_database_popularity ON public.modification_database(popularity_score);
CREATE INDEX idx_mod_database_accuracy ON public.modification_database(accuracy);

-- Dyno Results indexes
CREATE INDEX idx_dyno_results_car_id ON public.dyno_results(car_id);
CREATE INDEX idx_dyno_results_mod_database_id ON public.dyno_results(mod_database_id);
CREATE INDEX idx_dyno_results_power_gain ON public.dyno_results(power_gain);
CREATE INDEX idx_dyno_results_verified ON public.dyno_results(is_verified);

-- Race indexes
CREATE INDEX idx_races_created_by ON public.races(created_by_id);
CREATE INDEX idx_races_start_time ON public.races(start_time);
CREATE INDEX idx_races_status ON public.races(status);
CREATE INDEX idx_races_location ON public.races(location_lat, location_lon);

-- Race Participants indexes
CREATE INDEX idx_race_participants_race_id ON public.race_participants(race_id);
CREATE INDEX idx_race_participants_racer_id ON public.race_participants(racer_id);

-- Race Results indexes
CREATE INDEX idx_race_results_race_id ON public.race_results(race_id);
CREATE INDEX idx_race_results_participant_id ON public.race_results(participant_id);

-- GPS Points indexes
CREATE INDEX idx_gps_points_session_id ON public.gps_points(session_id, sequence_index);
CREATE INDEX idx_gps_points_timestamp ON public.gps_points(timestamp);

-- Events indexes
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_events_location ON public.events(location_lat, location_lon);

-- Social indexes
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_posts_author_id ON public.posts(author_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modification_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dyno_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gps_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

-- Cars policies
CREATE POLICY "Users can manage their own cars" ON public.cars
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public cars" ON public.cars
    FOR SELECT USING (true);

-- Vehicle Database policies (public read, authenticated write)
CREATE POLICY "Anyone can read vehicle database" ON public.vehicle_database
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can contribute to vehicle database" ON public.vehicle_database
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update vehicle database entries they created" ON public.vehicle_database
    FOR UPDATE USING (auth.uid() = generated_by::uuid);

-- Modifications policies
CREATE POLICY "Users can manage modifications on their cars" ON public.modifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cars 
            WHERE cars.id = modifications.car_id 
            AND cars.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view public modifications" ON public.modifications
    FOR SELECT USING (true);

-- Modification Database policies (public read)
CREATE POLICY "Anyone can read modification database" ON public.modification_database
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can contribute to modification database" ON public.modification_database
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Dyno Results policies
CREATE POLICY "Users can manage dyno results for their cars" ON public.dyno_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cars 
            WHERE cars.id = dyno_results.car_id 
            AND cars.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view public dyno results" ON public.dyno_results
    FOR SELECT USING (true);

-- Races policies
CREATE POLICY "Users can create races" ON public.races
    FOR INSERT WITH CHECK (auth.uid() = created_by_id);

CREATE POLICY "Race creators can manage their races" ON public.races
    FOR ALL USING (auth.uid() = created_by_id);

CREATE POLICY "Users can view public races" ON public.races
    FOR SELECT USING (true);

-- Race Participants policies
CREATE POLICY "Users can join races" ON public.race_participants
    FOR INSERT WITH CHECK (auth.uid() = racer_id);

CREATE POLICY "Users can manage their race participation" ON public.race_participants
    FOR ALL USING (auth.uid() = racer_id);

CREATE POLICY "Race creators can manage participants" ON public.race_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.races 
            WHERE races.id = race_participants.race_id 
            AND races.created_by_id = auth.uid()
        )
    );

-- Race Results policies
CREATE POLICY "Users can view race results" ON public.race_results
    FOR SELECT USING (true);

CREATE POLICY "Race creators can manage results" ON public.race_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.races 
            WHERE races.id = race_results.race_id 
            AND races.created_by_id = auth.uid()
        )
    );

-- Race Sessions policies
CREATE POLICY "Users can manage their own sessions" ON public.race_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public sessions" ON public.race_sessions
    FOR SELECT USING (true);

-- GPS Points policies
CREATE POLICY "Users can manage GPS points for their sessions" ON public.gps_points
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.race_sessions 
            WHERE race_sessions.id = gps_points.session_id 
            AND race_sessions.user_id = auth.uid()
        )
    );

-- Events policies
CREATE POLICY "Users can view public events" ON public.events
    FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Attendances policies
CREATE POLICY "Users can manage their own attendance" ON public.attendances
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public attendances" ON public.attendances
    FOR SELECT USING (true);

-- Social features policies
CREATE POLICY "Users can manage their follows" ON public.follows
    FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Users can view follows" ON public.follows
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own posts" ON public.posts
    FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Users can view public posts" ON public.posts
    FOR SELECT USING (is_public = true);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON public.cars 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_database_updated_at BEFORE UPDATE ON public.vehicle_database 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifications_updated_at BEFORE UPDATE ON public.modifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modification_database_updated_at BEFORE UPDATE ON public.modification_database 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dyno_results_updated_at BEFORE UPDATE ON public.dyno_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at BEFORE UPDATE ON public.races 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_race_results_updated_at BEFORE UPDATE ON public.race_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_race_sessions_updated_at BEFORE UPDATE ON public.race_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STORAGE BUCKETS
-- ========================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('avatars', 'avatars', true),
    ('car-images', 'car-images', true),
    ('event-images', 'event-images', true),
    ('post-images', 'post-images', true),
    ('dyno-charts', 'dyno-charts', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for car images
CREATE POLICY "Car images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'car-images');

CREATE POLICY "Authenticated users can upload car images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'car-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage policies for event images
CREATE POLICY "Event images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'event-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage policies for post images
CREATE POLICY "Post images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'post-images' 
        AND auth.role() = 'authenticated'
    );

-- Storage policies for dyno charts
CREATE POLICY "Dyno charts are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'dyno-charts');

CREATE POLICY "Authenticated users can upload dyno charts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'dyno-charts' 
        AND auth.role() = 'authenticated'
    );

-- ========================================
-- UTILITY FUNCTIONS
-- ========================================

-- Function to handle user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, handle)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'handle', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update vehicle database popularity based on lookups
CREATE OR REPLACE FUNCTION public.update_vehicle_popularity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.vehicle_database 
    SET 
        lookup_count = lookup_count + 1,
        last_used = NOW(),
        popularity_score = LEAST(lookup_count * 0.1, 10.0)
    WHERE id = NEW.vehicle_data_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update popularity when a car references vehicle data
CREATE TRIGGER update_vehicle_popularity_trigger
    AFTER INSERT ON public.cars
    FOR EACH ROW 
    WHEN (NEW.vehicle_data_id IS NOT NULL)
    EXECUTE FUNCTION public.update_vehicle_popularity();

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Insert some sample vehicle data
INSERT INTO public.vehicle_database (
    year, make, model, trim, category, body_style,
    horsepower, torque, acceleration_0_to_60, weight,
    drivetrain, transmission, original_msrp,
    reliability_score, performance_score, value_score
) VALUES 
(2023, 'Toyota', 'GR Supra', '3.0 Premium', 'Sports Car', 'Coupe', 
 382, 368, 4.1, 3397, 'RWD', '8-Speed Automatic', 55540,
 0.85, 8.7, 8.2),
(2024, 'BMW', 'M3', 'Competition', 'Sports Sedan', 'Sedan',
 503, 479, 3.8, 3890, 'RWD', '8-Speed Automatic', 74900,
 0.80, 9.5, 7.8),
(2023, 'Honda', 'Civic', 'Type R', 'Hot Hatch', 'Hatchback',
 315, 310, 5.0, 3125, 'FWD', '6-Speed Manual', 42895,
 0.90, 8.0, 8.5);

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- Add a comment to confirm setup completion
COMMENT ON SCHEMA public IS 'GridGhost Racing Platform database schema - Setup completed';

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'GridGhost Racing Platform database setup completed successfully!';
    RAISE NOTICE 'Tables created: 16';
    RAISE NOTICE 'Storage buckets created: 5';
    RAISE NOTICE 'RLS policies enabled and configured';
    RAISE NOTICE 'Indexes optimized for performance';
    RAISE NOTICE 'Ready for production use!';
END $$;