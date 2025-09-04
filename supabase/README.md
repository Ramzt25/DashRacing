# Supabase Backend

This directory contains the Supabase backend configuration for Dash.

## Structure

- `migrations/` - Database schema migrations
- `policies/` - Row Level Security policies
- `functions/` - Edge Functions for server-side logic

## Setup

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize project:
   ```bash
   supabase init
   ```

3. Start local development:
   ```bash
   supabase start
   ```

4. Apply migrations:
   ```bash
   supabase db reset
   ```

5. Deploy functions:
   ```bash
   supabase functions deploy
   ```

## Key Features

- **Authentication**: Magic link and phone OTP via Supabase Auth
- **Database**: PostgreSQL with PostGIS for location data
- **Edge Functions**: Server-side validation and AI integration
- **Storage**: File uploads for vehicle photos and user avatars
- **Realtime**: Live presence and location updates