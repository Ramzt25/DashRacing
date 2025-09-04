-- ========================================
-- DASH PLATFORM - SEED DATA
-- ========================================
-- Initial data for development and testing

-- Insert feature flags
INSERT INTO public.feature_flags (key, value) VALUES
('map_clustering', 'true'),
('ai_suggestions', 'true'),
('push_notifications', 'true'),
('premium_features', 'true'),
('meet_verification', 'true'),
('pin_voting', 'true'),
('live_presence', 'true'),
('background_location', 'false'),
('beta_features', 'false')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insert some demo data (for development only)
-- Demo user profile
INSERT INTO public.profiles (
  id,
  display_name,
  handle,
  bio,
  terms_version,
  terms_accepted_at,
  live_sharing_enabled,
  live_sharing_scope
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo User',
  'demo_user',
  'Demo user for testing the Dash platform',
  1,
  NOW(),
  true,
  'friends'
) ON CONFLICT (id) DO NOTHING;

-- Demo premium user
INSERT INTO public.profiles (
  id,
  display_name,
  handle,
  bio,
  terms_version,
  terms_accepted_at,
  live_sharing_enabled,
  live_sharing_scope
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Premium User',
  'premium_user',
  'Premium demo user with full features',
  1,
  NOW(),
  true,
  'events'
) ON CONFLICT (id) DO NOTHING;

-- Demo entitlements
INSERT INTO public.entitlements (user_id, plan, source, expires_at) VALUES
('00000000-0000-0000-0000-000000000001', 'free', 'admin', NOW() + INTERVAL '1 year'),
('00000000-0000-0000-0000-000000000002', 'premium', 'admin', NOW() + INTERVAL '1 year')
ON CONFLICT (user_id) DO UPDATE SET
  plan = EXCLUDED.plan,
  expires_at = EXCLUDED.expires_at;

-- Demo vehicles
INSERT INTO public.vehicles (
  user_id,
  make,
  model,
  year,
  trim,
  specs
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Honda',
  'Civic',
  2022,
  'Si',
  '{"engine": {"type": "Turbocharged I4", "displacement": 1.5, "cylinders": 4, "horsepower": 200, "torque": 192}, "transmission": {"type": "manual", "speeds": 6}, "drivetrain": "fwd"}'::jsonb
),
(
  '00000000-0000-0000-0000-000000000002',
  'Subaru',
  'WRX',
  2023,
  'STI',
  '{"engine": {"type": "Turbocharged Boxer", "displacement": 2.4, "cylinders": 4, "horsepower": 271, "torque": 258}, "transmission": {"type": "manual", "speeds": 6}, "drivetrain": "awd"}'::jsonb
),
(
  '00000000-0000-0000-0000-000000000002',
  'BMW',
  'M3',
  2023,
  'Competition',
  '{"engine": {"type": "Twin-Turbo I6", "displacement": 3.0, "cylinders": 6, "horsepower": 503, "torque": 479}, "transmission": {"type": "automatic", "speeds": 8}, "drivetrain": "rwd"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Demo meets (Los Angeles area)
INSERT INTO public.meets (
  host_id,
  title,
  description,
  start_at,
  end_at,
  location,
  radius_meters,
  visibility,
  rules
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Sunday Cars & Coffee',
  'Weekly gathering for car enthusiasts in Santa Monica',
  DATE_TRUNC('week', NOW()) + INTERVAL '6 days' + INTERVAL '8 hours',
  DATE_TRUNC('week', NOW()) + INTERVAL '6 days' + INTERVAL '11 hours',
  ST_Point(-118.4912, 34.0195),
  1000,
  'public',
  'Respectful behavior required. No revving engines. Clean up after yourself.'
),
(
  '00000000-0000-0000-0000-000000000001',
  'JDM Meetup',
  'Japanese car enthusiasts monthly gathering',
  NOW() + INTERVAL '1 week',
  NOW() + INTERVAL '1 week' + INTERVAL '3 hours',
  ST_Point(-118.2437, 34.0522),
  2000,
  'public',
  'JDM vehicles only. No street racing discussion.'
) ON CONFLICT DO NOTHING;

-- Demo pins (various types around LA)
INSERT INTO public.pins (
  user_id,
  type,
  location,
  description,
  expires_at,
  status
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'police',
  ST_Point(-118.2437, 34.0522),
  'Speed trap on I-405',
  NOW() + INTERVAL '45 minutes',
  'verified'
),
(
  '00000000-0000-0000-0000-000000000002',
  'hazard',
  ST_Point(-118.4912, 34.0195),
  'Pothole in right lane',
  NOW() + INTERVAL '2 hours',
  'pending'
),
(
  '00000000-0000-0000-0000-000000000001',
  'construction',
  ST_Point(-118.3262, 34.0928),
  'Lane closure for road work',
  NOW() + INTERVAL '1 day',
  'verified'
) ON CONFLICT DO NOTHING;

-- Demo pin votes
INSERT INTO public.pin_votes (pin_id, user_id, vote)
SELECT 
  p.id,
  '00000000-0000-0000-0000-000000000002',
  'up'
FROM public.pins p
WHERE p.user_id = '00000000-0000-0000-0000-000000000001'
LIMIT 2
ON CONFLICT DO NOTHING;

-- Demo friendship
INSERT INTO public.friendships (user_id, friend_id, status) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'accepted'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'accepted')
ON CONFLICT DO NOTHING;