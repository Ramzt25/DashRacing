# CannaBalance - Wellness & T-Break Companion

> **ECS Support First** - The ultimate wellness platform for daily THC users managing tolerance, mood, sleep and T-breaks

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

## 🌿 About CannaBalance

CannaBalance is a cross-platform PWA that helps daily THC users manage tolerance, mood, sleep and T-breaks, while offering evidence-based supplement guidance and ECS (Endocannabinoid System) support.

### ✨ Key Features

- **🧬 ECS Foundation Stacks** - Core, Premium, and Elite supplement bundles for endocannabinoid support
- **📊 ECS Impact Score** - Real-time scoring based on Absorption (40%), Antioxidant (25%), Neuro/Stress (20%), Gut (10%), Sleep (5%)
- **🎯 Gamified Progress** - Points, streaks, and badges for consistency and wellness goals
- **🚫 T-Break Support** - Dedicated tolerance break tracking with milestone rewards
- **📱 Daily Check-ins** - Supplement and mood logging with AI-powered insights
- **🛒 Smart Shop** - Evidence-based supplement recommendations with subscription options

## 🧬 ECS Support - Our Main Focus

The Endocannabinoid System (ECS) is central to everything we do:

### **CannaBalance Core — ECS Foundation** ($69/month subscription)
- **Goal**: Daily endocannabinoid support that improves cannabinoid absorption and baseline signaling
- **Includes**: Omega-3 Fish Oil, Magnesium Glycinate, Multivitamin, Probiotic 40B CFU
- **Timing**: AM — Omega-3 + Multi + Probiotic (with food); PM — Mag Glycinate

### **CannaBalance Premium — Absorb & Resilience** ($109/month subscription)  
- **Goal**: Add absorption (MCT) + adaptogen & neuro support to stabilize mood and sensitivity
- **Includes**: Core + Ashwagandha, Mushroom Immune Booster, MCT Oil
- **Timing**: AM — Omega-3, Multi, Probiotic, Mushroom; Midday — Ashwagandha, MCT; PM — Mag

### **CannaBalance Elite — Reset & Protect** ($149/month subscription)
- **Goal**: Full recovery stack with antioxidant/phase-II detox + sleep for nightly receptor maintenance  
- **Includes**: Premium + NAC, Glutathione Complex, Sleep Formula
- **Timing**: Complete daily protocol for optimal ECS function and tolerance management

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Docker (for local development)
- Azure CLI (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/cannabalance.git
   cd cannabalance
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd admin-portal
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   ```bash
   # Backend API
   npm run dev

   # Web app (in another terminal)
   cd admin-portal
   npm run dev
   ```

## 🏗️ Architecture

CannaBalance uses a modern, scalable architecture focused on ECS support:

- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL with Prisma ORM  
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Infrastructure**: Azure Container Apps + Static Web Apps
- **Real-time**: WebSocket integration for live gamification features

## 📱 PWA Features

The web app is built as a Progressive Web App featuring:

- Mobile-first responsive design
- Offline supplement tracking
- Push notifications for supplement reminders
- Install prompt for home screen access
- ECS Impact Score calculator

### Running the Mobile App

```bash
cd gridghost-mobile-v2

# Start Expo development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `POST /auth/upgrade` - Upgrade to premium

### Racing
- `GET /races` - List races
- `POST /races` - Create race
- `POST /races/:id/join` - Join race
- `POST /races/:id/start` - Start race

### Events
- `GET /events` - List events
- `POST /events` - Create event
- `POST /events/:id/join` - Join event

### Social
- `GET /friends` - List friends
- `POST /friends/request` - Send friend request
- `POST /friends/accept` - Accept friend request

Full API documentation is available in `/documents/PROJECT_DOCUMENTATION.md`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

GridGhost is designed for Azure deployment using Azure Developer CLI (azd):

```bash
# Login to Azure
az login

# Deploy to Azure
azd up

# Monitor deployment
azd logs
```

### Infrastructure

The Azure infrastructure includes:
- **Azure Container Apps** for the API server
- **Azure Database for PostgreSQL** for data storage
- **Azure Static Web Apps** for the mobile app
- **Azure Key Vault** for secrets management
- **Application Insights** for monitoring

## 📊 Monitoring

Production monitoring includes:
- Application performance metrics
- Error tracking and logging
- User analytics and usage patterns
- Infrastructure health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [📚 Documentation](./documents/PROJECT_DOCUMENTATION.md)
- [🐛 Issues](https://github.com/your-org/gridghost/issues)
- [💬 Discussions](https://github.com/your-org/gridghost/discussions)

## 📞 Support

For support, email support@gridghost.com or create an issue in this repository.

---

**Built with ❤️ by the GridGhost Team**