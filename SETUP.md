# Dash Platform - Setup Guide

## Prerequisites

- Node.js 18+
- pnpm (latest version)
- Xcode (for iOS development)
- Android Studio (for Android development)
- Supabase CLI
- Git

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-org/dash.git
cd dash
pnpm install
```

### 2. Environment Configuration

**Mobile App:**
```bash
cp apps/mobile/.env.example apps/mobile/.env
# Edit with your actual credentials
```

**Admin Panel:**
```bash
cp apps/admin/.env.local.example apps/admin/.env.local
# Edit with your actual credentials
```

### 3. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize (if not already done)
supabase init

# Start local development
supabase start

# Apply database migrations
supabase db reset

# Deploy Edge Functions (after setting up remote project)
supabase functions deploy
```

### 4. Development Servers

**Mobile App:**
```bash
# Start Metro bundler
pnpm --filter @dash/mobile start

# Run on iOS (in another terminal)
pnpm --filter @dash/mobile ios

# Run on Android (in another terminal)
pnpm --filter @dash/mobile android
```

**Admin Panel:**
```bash
pnpm --filter @dash/admin dev
```

## Environment Variables

### Required for Mobile App (.env)

```bash
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OneSignal Push Notifications
ONESIGNAL_APP_ID=your_onesignal_app_id

# Mapbox Maps
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Ably Realtime (or Pusher)
ABLY_API_KEY=your_ably_key

# Analytics & Monitoring
SENTRY_DSN=your_sentry_dsn
POSTHOG_API_KEY=your_posthog_key

# AI Integration
AI_API_BASE=https://api.openai.com/v1
AI_API_KEY=your_openai_api_key

# Feature Configuration
FEATURE_FLAGS_TABLE=feature_flags
```

### Required for Admin Panel (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

## Database Setup

The Supabase migrations will create:

- **profiles**: User profiles and settings
- **vehicles**: User vehicle garage
- **vehicle_ai_cache**: AI resolution caching
- **friendships**: Social connections
- **meets**: Community meetups
- **meet_attendees**: RSVP tracking
- **pins**: Community safety pins
- **pin_votes**: Pin validation system
- **user_locations**: Live presence data
- **reports**: Abuse reporting
- **feature_flags**: Remote configuration
- **entitlements**: Premium feature access
- **admin_actions**: Audit logging

## Edge Functions

Deploy these functions to handle server-side logic:

- **create-pin**: Pin creation with cooldown and validation
- **vote-pin**: Pin voting with threshold-based status updates
- **sync-location-snapshot**: Periodic location updates
- **garage-ai-resolve**: Vehicle identification with caching
- **verify-purchase**: In-app purchase validation
- **feature-flags-get**: Remote configuration delivery

## Testing

```bash
# Run all tests
pnpm test

# Run mobile tests only
pnpm --filter @dash/mobile test

# Run admin tests only
pnpm --filter @dash/admin test

# Type checking
pnpm type-check
```

## Building for Production

### Mobile App

```bash
# iOS Release Build
pnpm --filter @dash/mobile ios --configuration Release

# Android Release Build
pnpm --filter @dash/mobile android --variant release
```

### Admin Panel

```bash
# Build for production
pnpm --filter @dash/admin build

# Start production server
pnpm --filter @dash/admin start
```

## Key Features Implemented

### Mobile App
- **Onboarding Flow**: Splash, sign-in, profile completion, terms acceptance
- **Authentication**: Magic link and phone OTP via Supabase
- **Navigation**: Bottom tabs (Map, Meets, Garage, Activity, Profile)
- **Feature Gating**: Server-verified premium features
- **AI Integration**: Vehicle resolution and upgrade suggestions
- **State Management**: Zustand stores with React Query caching

### Backend
- **Database**: PostgreSQL with PostGIS for location data
- **Authentication**: Supabase Auth with JWT tokens
- **Security**: Comprehensive Row Level Security policies
- **Storage**: File uploads for photos with signed URLs
- **Edge Functions**: Server-side validation and AI integration

### Admin Panel
- **Dashboard**: Metrics and activity overview
- **Moderation**: Tools for reviewing meets, pins, and reports
- **User Management**: Entitlements and feature access control
- **Feature Flags**: Remote configuration management

## Architecture Decisions

### Design Patterns
- **Monorepo**: Shared code and consistent dependencies
- **Workspace Packages**: Reusable types, utilities, and configurations
- **Feature-First**: Organized by functionality, not file type
- **Server Verification**: All premium features validated server-side

### Technology Choices
- **React Native**: Cross-platform mobile development
- **Next.js**: Server-side rendered admin panel
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **TypeScript**: Type safety across the entire stack
- **pnpm**: Fast, efficient package management

### Security & Privacy
- **Opt-in Location**: All location sharing requires explicit consent
- **Home Geofencing**: Protect user's home location privacy
- **RLS Policies**: Database-level security enforcement
- **Abuse Reporting**: Comprehensive content moderation system

## Next Steps

1. **API Integration**: Add your actual service credentials
2. **Native Dependencies**: Configure platform-specific features
3. **Push Notifications**: Set up OneSignal with certificates
4. **Maps Integration**: Configure Mapbox with custom styling
5. **Testing**: Add comprehensive test coverage
6. **CI/CD**: Set up automated deployment pipelines

## Support

For issues or questions:
1. Check the COPILOT_INSTRUCTIONS.md for development guidelines
2. Review the comprehensive README.md
3. Consult individual package documentation
4. Open an issue in the repository

---

**Built with ❤️ for the automotive community**