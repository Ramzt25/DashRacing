-- ========================================
-- DASH PLATFORM - ROW LEVEL SECURITY POLICIES
-- ========================================
-- Apply comprehensive RLS policies for data security

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROFILES POLICIES
-- ========================================

-- Users can view their own profile
CREATE POLICY "users_can_view_own_profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_can_update_own_profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can view public profiles
CREATE POLICY "users_can_view_public_profiles" ON public.profiles
    FOR SELECT USING (true);

-- Service role can manage profiles
CREATE POLICY "service_role_can_manage_profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- VEHICLES POLICIES
-- ========================================

-- Users can manage their own vehicles
CREATE POLICY "users_can_manage_own_vehicles" ON public.vehicles
    FOR ALL USING (auth.uid() = user_id);

-- Users can view public vehicles
CREATE POLICY "users_can_view_public_vehicles" ON public.vehicles
    FOR SELECT USING (true);

-- ========================================
-- VEHICLE AI CACHE POLICIES
-- ========================================

-- Anyone can read AI cache (for performance)
CREATE POLICY "anyone_can_read_ai_cache" ON public.vehicle_ai_cache
    FOR SELECT USING (true);

-- Only service role can write to AI cache
CREATE POLICY "service_role_can_write_ai_cache" ON public.vehicle_ai_cache
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- FRIENDSHIPS POLICIES
-- ========================================

-- Users can view their own friendships
CREATE POLICY "users_can_view_own_friendships" ON public.friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friend requests
CREATE POLICY "users_can_create_friend_requests" ON public.friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update friendships they're involved in
CREATE POLICY "users_can_update_own_friendships" ON public.friendships
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete their own friendships
CREATE POLICY "users_can_delete_own_friendships" ON public.friendships
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ========================================
-- MEETS POLICIES
-- ========================================

-- Users can view public meets
CREATE POLICY "users_can_view_public_meets" ON public.meets
    FOR SELECT USING (
        visibility = 'public' 
        OR auth.uid() = host_id
        OR auth.uid() IN (
            SELECT user_id FROM public.meet_attendees WHERE meet_id = id
        )
    );

-- Users can create meets
CREATE POLICY "users_can_create_meets" ON public.meets
    FOR INSERT WITH CHECK (auth.uid() = host_id);

-- Hosts can update their own meets
CREATE POLICY "hosts_can_update_own_meets" ON public.meets
    FOR UPDATE USING (auth.uid() = host_id);

-- Hosts can delete their own meets
CREATE POLICY "hosts_can_delete_own_meets" ON public.meets
    FOR DELETE USING (auth.uid() = host_id);

-- ========================================
-- MEET ATTENDEES POLICIES
-- ========================================

-- Users can view attendees of meets they can see
CREATE POLICY "users_can_view_meet_attendees" ON public.meet_attendees
    FOR SELECT USING (
        meet_id IN (
            SELECT id FROM public.meets 
            WHERE visibility = 'public' 
               OR auth.uid() = host_id
               OR id IN (SELECT meet_id FROM public.meet_attendees WHERE user_id = auth.uid())
        )
    );

-- Users can manage their own attendance
CREATE POLICY "users_can_manage_own_attendance" ON public.meet_attendees
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- PINS POLICIES
-- ========================================

-- Users can view public pins
CREATE POLICY "users_can_view_public_pins" ON public.pins
    FOR SELECT USING (status != 'hidden');

-- Users can create pins (rate limiting handled in Edge Functions)
CREATE POLICY "users_can_create_pins" ON public.pins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pins
CREATE POLICY "users_can_update_own_pins" ON public.pins
    FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- PIN VOTES POLICIES
-- ========================================

-- Users can view pin votes
CREATE POLICY "users_can_view_pin_votes" ON public.pin_votes
    FOR SELECT USING (true);

-- Users can vote on pins (one vote per pin per user)
CREATE POLICY "users_can_vote_on_pins" ON public.pin_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "users_can_update_own_votes" ON public.pin_votes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "users_can_delete_own_votes" ON public.pin_votes
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- USER LOCATIONS POLICIES
-- ========================================

-- Users can view their own location
CREATE POLICY "users_can_view_own_location" ON public.user_locations
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can update user locations
CREATE POLICY "service_role_can_update_locations" ON public.user_locations
    FOR ALL USING (auth.role() = 'service_role');

-- Users can view friends' locations (if live sharing enabled)
CREATE POLICY "users_can_view_friends_locations" ON public.user_locations
    FOR SELECT USING (
        user_id IN (
            SELECT friend_id FROM public.friendships 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
        AND user_id IN (
            SELECT id FROM public.profiles 
            WHERE live_sharing_enabled = true 
            AND live_sharing_scope IN ('friends', 'events')
        )
    );

-- ========================================
-- REPORTS POLICIES
-- ========================================

-- Users can create reports
CREATE POLICY "users_can_create_reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "users_can_view_own_reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- ========================================
-- FEATURE FLAGS POLICIES
-- ========================================

-- Anyone can read feature flags
CREATE POLICY "anyone_can_read_feature_flags" ON public.feature_flags
    FOR SELECT USING (true);

-- Only service role can modify feature flags
CREATE POLICY "service_role_can_manage_feature_flags" ON public.feature_flags
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- ENTITLEMENTS POLICIES
-- ========================================

-- Users can view their own entitlements
CREATE POLICY "users_can_view_own_entitlements" ON public.entitlements
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage entitlements
CREATE POLICY "service_role_can_manage_entitlements" ON public.entitlements
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- ADMIN ACTIONS POLICIES
-- ========================================

-- Only service role can access admin actions
CREATE POLICY "service_role_can_access_admin_actions" ON public.admin_actions
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- STORAGE POLICIES (for file uploads)
-- ========================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-photos', 'vehicle-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('pin-photos', 'pin-photos', true);

-- Avatar policies
CREATE POLICY "users_can_upload_own_avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "users_can_view_avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "users_can_update_own_avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "users_can_delete_own_avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Vehicle photo policies
CREATE POLICY "users_can_upload_vehicle_photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'vehicle-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "users_can_view_vehicle_photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'vehicle-photos');

CREATE POLICY "users_can_update_own_vehicle_photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'vehicle-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "users_can_delete_own_vehicle_photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'vehicle-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Pin photo policies
CREATE POLICY "users_can_upload_pin_photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'pin-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "users_can_view_pin_photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'pin-photos');

CREATE POLICY "users_can_update_own_pin_photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'pin-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "users_can_delete_own_pin_photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'pin-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );