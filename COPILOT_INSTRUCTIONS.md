# COPILOT INSTRUCTIONS

## Purpose
Authoritative build guidance for Dash during active development. All coding agents must follow these instructions before writing code, during PRs, and when migrating features.

## Golden Rules

### 1. Architecture Integrity
- **Monorepo Structure**: Always maintain /apps/mobile, /apps/admin, /packages/*, /supabase/* structure
- **Use Recommended Stack**: Follow the exact technology stack specified in the master prompt - no substitutions without explicit approval
- **pnpm Workspaces**: Use pnpm for all package management, never npm or yarn
- **TypeScript Strict Mode**: All code must be TypeScript with strict mode enabled

### 2. Security & Privacy
- **No Hardcoded Secrets**: All configuration via .env files only - never commit keys or tokens
- **Server-Side Verification**: All AI tasks and premium features must use server verification - never trust client-side checks
- **RLS Enforcement**: All database access must go through Row Level Security policies
- **Privacy First**: Location sharing is opt-in only with granular controls

### 3. AI Integration
- **Feature Prompts**: Use specific, purpose-built prompts - never inline generic AI prompts
- **Aggressive Caching**: Cache all AI results in vehicle_ai_cache when possible
- **Cost Control**: Implement per-feature token budgets and abort on excess
- **Server-Side Only**: AI calls must go through Edge Functions, never direct from client

### 4. Feature Gating
- **Server Verification**: All premium features must re-verify entitlements with backend
- **Never Trust Client**: Local checks are for UI only - server is source of truth
- **Graceful Degradation**: Free users get helpful upgrade prompts, not broken features

## Deliverables Checklist

Before any PR, verify ALL items:

### Core Infrastructure
- [ ] Monorepo with /apps/mobile, /apps/admin, /packages/*, /supabase/*
- [ ] pnpm workspaces configured and working
- [ ] TypeScript strict mode enabled across all packages
- [ ] Shared packages (@dash/types, @dash/utils, @dash/config) properly configured

### Supabase Backend
- [ ] Database migrations in /supabase/migrations with proper numbering
- [ ] RLS policies defined and tested in /supabase/policies
- [ ] Storage buckets configured with proper access policies
- [ ] Edge Functions implemented and tested:
  - [ ] create-pin (with cooldown and duplicate prevention)
  - [ ] vote-pin (with threshold-based status updates)
  - [ ] sync-location-snapshot (for presence updates)
  - [ ] garage-ai-resolve (with caching and cost control)
  - [ ] verify-purchase (for entitlement validation)
  - [ ] feature-flags-get (for remote configuration)

### Mobile App Features
- [ ] Navigation structure with bottom tabs (Map, Meets, Garage, Activity, Profile)
- [ ] Authentication flow with Supabase (magic link and phone OTP)
- [ ] Onboarding screens (splash, sign-in, terms, permissions)
- [ ] Feature gating service with server verification
- [ ] Zustand stores for state management
- [ ] React Query for API caching
- [ ] Theme system using design tokens

### AI Integration
- [ ] AI client abstraction with pluggable backends
- [ ] Master prompt and feature-specific prompts in /apps/mobile/ai/
- [ ] Vehicle AI cache reads/writes working
- [ ] Cost controls and token budgets implemented
- [ ] Premium-only features properly gated

### Admin Panel
- [ ] Next.js app in /apps/admin with Supabase integration
- [ ] Dashboard with metrics and quick actions
- [ ] Moderation tools for meets, pins, and reports
- [ ] Feature flags management interface
- [ ] User entitlements management

### Configuration & Documentation
- [ ] .env.example files with all required variables
- [ ] README.md with setup instructions
- [ ] COPILOT_INSTRUCTIONS.md kept up to date
- [ ] AI prompts documented and versioned

## Testing Protocol

### Unit Tests
- [ ] Component rendering and interaction tests
- [ ] FeatureService gating logic tests
- [ ] AI prompt loader functionality tests
- [ ] Store state management tests

### Integration Tests
- [ ] garage_ai_resolve cache hit/miss behavior
- [ ] Pin voting threshold calculations
- [ ] Authentication flow end-to-end
- [ ] Database RLS policy enforcement

### Manual Verification
- [ ] Mobile app builds and runs without errors
- [ ] Admin panel builds and runs without errors
- [ ] Database migrations apply cleanly
- [ ] Edge Functions deploy successfully

## Security Checklist

### Authentication & Authorization
- [ ] RLS enabled on all tables
- [ ] Service role permissions properly scoped
- [ ] User tokens validated in all Edge Functions
- [ ] Storage bucket policies configured correctly

### Data Protection
- [ ] No personal information in logs
- [ ] Location data properly anonymized
- [ ] User consent flows implemented
- [ ] GDPR-compliant data export/deletion

### Code Security
- [ ] No secrets in code or environment variables committed
- [ ] SQL injection prevention via parameterized queries
- [ ] Input validation with Zod schemas
- [ ] Rate limiting on create operations

## Cost Discipline

### AI Usage
- [ ] Per-feature token budgets defined and enforced
- [ ] Cache-first strategy for deterministic queries
- [ ] Graceful degradation when budget exceeded
- [ ] Analytics tracking for AI costs

### Infrastructure
- [ ] Database queries optimized with proper indexes
- [ ] Image assets optimized and CDN-ready
- [ ] Edge Function cold start times minimized
- [ ] Unnecessary API calls eliminated

## Branching & PR Guidelines

### Branch Naming
- `feature/description` for new features
- `fix/description` for bug fixes
- `refactor/description` for code improvements
- `docs/description` for documentation updates

### PR Requirements
- [ ] Conventional commit messages
- [ ] Migration IDs in PR title when schema changes
- [ ] Updated .env.example when configs change
- [ ] No breaking changes without migration path
- [ ] All tests passing

### Code Review Focus
- [ ] Security implications reviewed
- [ ] Performance impact assessed
- [ ] AI cost impact calculated
- [ ] Mobile-first responsive design verified
- [ ] Accessibility standards met

## Emergency Procedures

### Production Issues
1. Check Sentry for error details
2. Review PostHog for user impact
3. Verify Edge Function logs
4. Rollback via feature flags if needed
5. Apply hotfix through separate branch

### Security Incidents
1. Immediately revoke compromised credentials
2. Update affected .env.example files
3. Force re-authentication of affected users
4. Document incident and prevention measures

## Success Metrics

### Development Velocity
- Features delivered on time with quality
- Minimal production bugs and rollbacks
- Fast CI/CD pipeline execution
- High developer satisfaction scores

### User Experience
- App performance above 90th percentile
- Crash-free sessions above 99.5%
- Feature adoption rates meeting targets
- User feedback scores consistently positive

### Business Impact
- Premium conversion rates meeting targets
- User retention above industry benchmarks
- Community engagement growing month-over-month
- Revenue per user trending upward

Remember: Quality over speed. It's better to ship fewer features that work perfectly than many features that work poorly.