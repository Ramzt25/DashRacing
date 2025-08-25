# 🚀 DASH RACING APP - SETUP INSTRUCTIONS

## 📋 PREREQUISITES

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: Latest version
- **VS Code**: Recommended IDE
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)

### Development Tools
```bash
# Install global dependencies
npm install -g @expo/cli
npm install -g typescript
npm install -g turbo
```

---

## 🛠️ LOCAL DEVELOPMENT SETUP

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dash-racing-app
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install mobile app dependencies
cd gridghost-mobile-v2
npm install
cd ..
```

### 3. Environment Configuration
Create environment files in the root directory:

**`.env` (Development)**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dash_dev"
DIRECT_URL="postgresql://username:password@localhost:5432/dash_dev"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-for-development"

# API Configuration
PORT=3000
NODE_ENV=development
ORIGIN="http://localhost:3000"

# External Services (Development)
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Azure Services (Optional for development)
AZURE_STORAGE_CONNECTION_STRING=""
AZURE_SIGNALR_CONNECTION_STRING=""
```

**`.env.example` (Template)**
```env
# Copy this file to .env and fill in your values
DATABASE_URL="postgresql://username:password@localhost:5432/dash_dev"
JWT_SECRET="your-jwt-secret-here"
PORT=3000
GOOGLE_MAPS_API_KEY="your-api-key"
OPENAI_API_KEY="your-api-key"
```

### 4. Database Setup

#### Install PostgreSQL
```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Windows (using Chocolatey)
choco install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE dash_dev;
CREATE USER dash_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dash_dev TO dash_user;
\q
```

#### Run Migrations
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed
```

### 5. Mobile App Environment
Create `.env` in `gridghost-mobile-v2/`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3000/ws
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key
```

---

## 🚀 RUNNING THE APPLICATION

### Development Mode

#### Start Backend API
```bash
# From root directory
npm run dev

# Or specifically
cd src
npm run dev
```

#### Start Mobile App
```bash
# From gridghost-mobile-v2 directory
cd gridghost-mobile-v2
npm start

# Or with cache reset
npm start -- --reset-cache
```

#### Start Both (Recommended)
```bash
# From root directory (uses Turbo)
npm run dev
```

### Testing the Setup

#### Backend API Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-24T10:00:00Z",
  "version": "1.0.0"
}
```

#### Mobile App QR Code
1. After running `npm start`, scan the QR code with Expo Go app
2. Or press `w` to open in web browser
3. Or press `a` to open Android emulator

---

## 📱 MOBILE DEVELOPMENT

### Android Setup

#### Install Android Studio
1. Download from [Android Developer website](https://developer.android.com/studio)
2. Install Android SDK and emulator
3. Add Android SDK to PATH

#### Environment Variables
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Run on Android
```bash
cd gridghost-mobile-v2
npx expo run:android
```

### iOS Setup (macOS only)

#### Install Xcode
1. Install from Mac App Store
2. Install Xcode Command Line Tools:
```bash
xcode-select --install
```

#### Install CocoaPods
```bash
sudo gem install cocoapods
```

#### Run on iOS
```bash
cd gridghost-mobile-v2
npx expo run:ios
```

---

## 🧪 TESTING SETUP

### Backend API Tests
```bash
# Install test dependencies
npm install

# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run tests with coverage
npm test -- --coverage

# Watch mode for development
npm test -- --watch
```

### Mobile App Tests
```bash
cd gridghost-mobile-v2

# Run component tests
npm run test

# Run with coverage
npm run test:coverage
```

### E2E Testing (Optional)
```bash
# Install Detox for E2E testing
npm install -g detox-cli

# Setup and run E2E tests
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug
```

---

## 🐳 DOCKER DEVELOPMENT (Optional)

### Docker Compose Setup
```bash
# Start all services (API + Database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Docker Commands
```bash
# Build API image
docker build -t dash-api .

# Run API container
docker run -p 3000:3000 --env-file .env dash-api

# Database container
docker run -d \
  --name postgres-dash \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=dash_dev \
  -p 5432:5432 \
  postgres:15
```

---

## 🔧 DEVELOPMENT TOOLS

### VS Code Extensions
Install these recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "expo.vscode-expo-tools",
    "ms-vscode.vscode-eslint"
  ]
}
```

### VS Code Settings
Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.useAliasesForRenames": false,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  }
}
```

### Debug Configuration
Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug API",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "sourceMaps": true
    }
  ]
}
```

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Metro Bundler Issues
```bash
# Clear Metro cache
cd gridghost-mobile-v2
npx expo start --clear

# Reset npm cache
npm start -- --reset-cache
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql

# Check connection
psql -U dash_user -d dash_dev -h localhost -p 5432
```

#### Expo/React Native Issues
```bash
# Clear Expo cache
expo r -c

# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install

# Update Expo CLI
npm install -g @expo/cli@latest
```

### Environment Issues

#### Node Version Problems
```bash
# Check Node version
node --version

# Use nvm to manage versions
nvm install 18
nvm use 18
```

#### Permission Errors
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Windows - run as administrator
```

### Mobile Development Issues

#### Android Emulator
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd <emulator_name>

# Cold boot
emulator -avd <emulator_name> -cold-boot
```

#### iOS Simulator Issues
```bash
# Reset iOS Simulator
Device > Erase All Content and Settings

# Reinstall app
npx expo run:ios --device
```

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)

### Community
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Tools
- [Expo Snack](https://snack.expo.dev/) - Online React Native playground
- [Reactotron](https://github.com/infinitered/reactotron) - Debugging tool
- [Flipper](https://fbflipper.com/) - Mobile app debugger

---

## ✅ VERIFICATION CHECKLIST

Before starting development, verify:

- [ ] Node.js v18+ installed
- [ ] npm packages installed successfully
- [ ] PostgreSQL running and accessible
- [ ] Environment files configured
- [ ] Database migrations completed
- [ ] Backend API running on port 3000
- [ ] Mobile app starts without errors
- [ ] QR code scannable with Expo Go
- [ ] Hot reload working in development
- [ ] Tests passing (npm test)

---

## 🎯 NEXT STEPS

After successful setup:

1. **Explore the Codebase**: Start with `App.tsx` and `src/index.ts`
2. **Run Tests**: Ensure all tests pass
3. **Check Documentation**: Review API and Component docs
4. **Start Development**: Create your first feature branch
5. **Deploy to Azure**: Follow deployment instructions

---

*Last updated: August 24, 2025*
*Setup instructions validated on macOS, Windows, and Linux*