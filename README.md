# GridGhost Racing Platform

> **Race Anywhere, Meet Anywhere** - The ultimate social racing platform for car enthusiasts

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79-61DAFB.svg)](https://reactnative.dev/)

## 🏎️ About GridGhost

GridGhost is a revolutionary mobile racing platform that combines real-world GPS locations with social gaming mechanics. Race anywhere in the world, create custom events, and connect with the global racing community.

### ✨ Key Features

- **🗺️ Live Racing Map** - Real-time player tracking with friend differentiation
- **🏁 Race Creation** - Create races anywhere on Earth (Drag, Circuit, Drift, Time Trial)
- **🎉 Social Events** - Host car meets, cruises, and photo sessions
- **👥 Friend System** - Connect with racers and challenge friends
- **🚗 Vehicle Garage** - Manage your car collection with real vehicle data
- **📊 Racing Analytics** - Track performance and improve your skills

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Docker (for local development)
- Azure CLI (for deployment)
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/gridghost.git
   cd gridghost
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd gridghost-mobile-v2
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

   # Mobile app (in another terminal)
   cd gridghost-mobile-v2
   npm start
   ```

## 🏗️ Architecture

GridGhost uses a modern, scalable architecture:

- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Mobile**: React Native + Expo
- **Infrastructure**: Azure Container Apps + Static Web Apps
- **Real-time**: WebSocket integration for live features

## 📱 Mobile App

The mobile app is built with React Native and Expo, featuring:

- Cross-platform compatibility (iOS/Android)
- Real-time GPS tracking
- Interactive maps with racing venues
- Social features and friend system
- Vehicle management and customization

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