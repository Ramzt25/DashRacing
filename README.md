# Dash - Mobile Community Platform

> **Connect. Share. Discover.** - The ultimate mobile platform for automotive enthusiasts

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74+-61DAFB.svg)](https://reactnative.dev/)

## 🚗 About Dash

Dash is a production-grade mobile community platform built for automotive enthusiasts. Connect with fellow car lovers, discover local meets, share your garage, and explore automotive culture - all while maintaining privacy and safety.

### ✨ Key Features

- **🗺️ Interactive Maps** - Discover meets, events, and community pins with Mapbox integration
- **🤝 Community Meets** - Create and attend local automotive gatherings
- **🚗 Smart Garage** - AI-powered vehicle management and upgrade suggestions
- **📍 Safety Pins** - Report and share road conditions, hazards, and points of interest
- **👥 Friend Network** - Connect with local enthusiasts and track their activity
- **🔒 Privacy First** - Granular location sharing controls and home geofencing
- **⭐ Premium Features** - Advanced tools and unlimited vehicle management

## 🏗️ Architecture

Dash uses a modern monorepo architecture:

- **Mobile**: React Native bare app with TypeScript
- **Admin**: Next.js admin panel for moderation and management
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Maps**: Mapbox for interactive mapping
- **Realtime**: Ably for live presence and location sharing
- **Push**: OneSignal for notifications
- **Analytics**: Sentry + PostHog for monitoring and insights
- **AI**: Pluggable AI backend for vehicle resolution and suggestions

## 🚀 Prerequisites

- Node.js 18+
- pnpm (package manager)
- Xcode (for iOS development)
- Android Studio (for Android development)
- Supabase CLI
- CocoaPods (for iOS)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-org/dash.git
cd dash

# Install dependencies
pnpm install

# Copy environment files
cp apps/mobile/.env.example apps/mobile/.env
cp apps/admin/.env.local.example apps/admin/.env.local

# Setup Supabase
npx supabase init
npx supabase start
npx supabase db reset
```

## 🛠️ Development

### Mobile App

```bash
# Start Metro bundler
pnpm --filter @dash/mobile start

# Run on iOS
pnpm --filter @dash/mobile ios

# Run on Android
pnpm --filter @dash/mobile android
```

### Admin Panel

```bash
# Start development server
pnpm --filter @dash/admin dev
```

### Supabase Functions

```bash
# Deploy functions
npx supabase functions deploy
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run mobile tests
pnpm --filter @dash/mobile test

# Run admin tests
pnpm --filter @dash/admin test
```

## 🚀 Deployment

### Mobile App

```bash
# Build iOS
pnpm --filter @dash/mobile ios --configuration Release

# Build Android
pnpm --filter @dash/mobile android --variant release
```

### Admin Panel

```bash
# Build for production
pnpm --filter @dash/admin build
```

## 🔒 Security & Privacy

Dash prioritizes user safety and privacy:

- No racing features or speed tracking
- Opt-in location sharing with granular controls
- Home geofencing to protect private locations
- Comprehensive abuse reporting system
- Shadow ban support for problematic users
- Terms and privacy disclaimers required

## 📋 Environment Variables

### Mobile App (.env)

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ONESIGNAL_APP_ID=your_onesignal_app_id
MAPBOX_ACCESS_TOKEN=your_mapbox_token
ABLY_API_KEY=your_ably_key
SENTRY_DSN=your_sentry_dsn
POSTHOG_API_KEY=your_posthog_key
AI_API_BASE=https://api.your-ai-gateway.example
AI_API_KEY=your_ai_api_key
FEATURE_FLAGS_TABLE=feature_flags
```

### Admin Panel (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

## 📚 Documentation

- [Setup Instructions](./docs/setup.md)
- [API Documentation](./docs/api.md)
- [Mobile Development](./apps/mobile/README.md)
- [Admin Panel](./apps/admin/README.md)
- [Supabase Schema](./supabase/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, create an issue in this repository or contact the development team.

---

**Built with ❤️ for the automotive community**