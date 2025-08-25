# GridGhost

A legal, safety-first motorsport community and matchup platform.

## Project Structure

- `apps/web` - Next.js 14 web application
- `apps/mobile` - Expo React Native mobile app
- `apps/api` - Node.js backend API
- `packages/ui` - Shared UI components
- `packages/core` - Business logic and utilities
- `packages/ml` - Machine learning simulation engine
- `packages/types` - Shared TypeScript types
- `packages/config` - Shared configuration

## Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## Safety & Compliance

GridGhost is designed with safety as the top priority:
- Geofenced to sanctioned venues only
- No public road tracking or racing facilitation
- Comprehensive moderation and reporting tools
- Legal disclaimers and safety education

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Radix UI
- **Mobile**: Expo React Native
- **Backend**: Node.js, Fastify, Prisma, PostgreSQL
- **Real-time**: WebSockets, Redis
- **ML**: Physics-based simulation with ML augmentation
- **Maps**: Mapbox with geofencing
- **Auth**: OAuth (Apple, Google), email links