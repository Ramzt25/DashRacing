# DASH MOBILE APP - COMPONENT DOCUMENTATION

## 📱 OVERVIEW
This document provides comprehensive documentation for all React Native components in the GridGhost Dash mobile application.

---

## 🎨 CORE COMPONENTS

### DashIcon
**Location:** `src/components/DashIcon.tsx`

Custom icon component that displays either custom PNG icons or Ionicons fallbacks.

#### Props
```typescript
interface DashIconProps {
  name: 'home' | 'live-race' | 'events' | 'garage' | 'map' | 'profile' | 'settings' | 'back' | 'timer' | 'car' | 'nearby';
  size?: number;          // Default: 24
  color?: string;         // Default: '#fff'
  focused?: boolean;      // Default: false
}
```

#### Usage
```tsx
import { DashIcon } from '../components/DashIcon';

// Basic usage
<DashIcon name="home" size={24} />

// With focus state (shows red accent)
<DashIcon name="profile" size={32} focused={true} />

// Custom color
<DashIcon name="settings" size={20} color="#FF0000" />
```

#### Features
- ✅ Custom PNG icons for main navigation
- ✅ Ionicons fallback for utility icons
- ✅ Focus state with red accent bar
- ✅ Automatic color tinting
- ✅ Responsive sizing

---

### TopNavigation
**Location:** `src/components/TopNavigation.tsx`

Main navigation header component with logo and navigation controls.

#### Props
```typescript
interface TopNavigationProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}
```

#### Usage
```tsx
import { TopNavigation } from '../components/TopNavigation';

// Basic header
<TopNavigation title="Dashboard" />

// With back button
<TopNavigation 
  title="Race Details"
  showBack={true}
  onBackPress={() => navigation.goBack()}
/>

// With custom right component
<TopNavigation 
  title="Profile"
  rightComponent={<TouchableOpacity><Text>Edit</Text></TouchableOpacity>}
/>
```

#### Features
- ✅ Dash logo integration
- ✅ Optional back button
- ✅ Custom right component slot
- ✅ Consistent styling across app

---

### WheelNavigation
**Location:** `src/components/WheelNavigation.tsx`

Circular navigation wheel for the main dashboard.

#### Props
```typescript
interface WheelNavigationProps {
  onNavigate: (screen: string) => void;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}
```

#### Usage
```tsx
import { WheelNavigation } from '../components/WheelNavigation';

<WheelNavigation 
  onNavigate={(screen) => navigation.navigate(screen)}
  currentLocation={{
    latitude: 34.0522,
    longitude: -118.2437
  }}
/>
```

#### Features
- ✅ Circular layout with 8 navigation options
- ✅ Animated press interactions
- ✅ Custom icon integration
- ✅ Location-aware nearby races

---

### SmartNavigation
**Location:** `src/components/SmartNavigation.tsx`

Intelligent navigation component that adapts based on user context.

#### Props
```typescript
interface SmartNavigationProps {
  userState: 'racing' | 'idle' | 'searching';
  nearbyRaces: Race[];
  onQuickAction: (action: string) => void;
}
```

#### Usage
```tsx
import { SmartNavigation } from '../components/SmartNavigation';

<SmartNavigation 
  userState="idle"
  nearbyRaces={nearbyRaces}
  onQuickAction={(action) => handleQuickAction(action)}
/>
```

#### Features
- ✅ Context-aware navigation options
- ✅ Quick action buttons
- ✅ Nearby race integration
- ✅ Dynamic content based on user state

---

## 🏎️ RACING COMPONENTS

### RaceCard
**Location:** `src/components/racing/RaceCard.tsx`

Displays race information in a card format.

#### Props
```typescript
interface RaceCardProps {
  race: Race;
  onJoin?: () => void;
  onView?: () => void;
  showJoinButton?: boolean;
}
```

#### Usage
```tsx
import { RaceCard } from '../components/racing/RaceCard';

<RaceCard 
  race={raceData}
  showJoinButton={true}
  onJoin={() => joinRace(raceData.id)}
  onView={() => viewRaceDetails(raceData.id)}
/>
```

#### Features
- ✅ Race status indicators
- ✅ Participant count
- ✅ Distance and location display
- ✅ Join/View action buttons
- ✅ Time remaining countdown

---

### LiveRaceMap
**Location:** `src/components/racing/LiveRaceMap.tsx`

Real-time map component for active races.

#### Props
```typescript
interface LiveRaceMapProps {
  raceId: string;
  participants: RaceParticipant[];
  userPosition?: Location;
  onPositionUpdate: (position: Location) => void;
}
```

#### Usage
```tsx
import { LiveRaceMap } from '../components/racing/LiveRaceMap';

<LiveRaceMap 
  raceId={currentRace.id}
  participants={raceParticipants}
  userPosition={userLocation}
  onPositionUpdate={(pos) => updatePosition(pos)}
/>
```

#### Features
- ✅ Real-time participant tracking
- ✅ Route visualization
- ✅ Position markers
- ✅ Speed and direction indicators

---

### RaceTimer
**Location:** `src/components/racing/RaceTimer.tsx`

Countdown and elapsed time display for races.

#### Props
```typescript
interface RaceTimerProps {
  startTime: Date;
  status: 'pending' | 'active' | 'finished';
  onStart?: () => void;
  onFinish?: () => void;
}
```

#### Usage
```tsx
import { RaceTimer } from '../components/racing/RaceTimer';

<RaceTimer 
  startTime={race.startTime}
  status={race.status}
  onStart={() => handleRaceStart()}
  onFinish={() => handleRaceFinish()}
/>
```

#### Features
- ✅ Countdown to race start
- ✅ Elapsed time during race
- ✅ Visual status indicators
- ✅ Automatic state transitions

---

## 🚗 VEHICLE COMPONENTS

### VehicleCard
**Location:** `src/components/vehicle/VehicleCard.tsx`

Vehicle information display card.

#### Props
```typescript
interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  showStats?: boolean;
}
```

#### Usage
```tsx
import { VehicleCard } from '../components/vehicle/VehicleCard';

<VehicleCard 
  vehicle={userVehicle}
  isSelected={selectedVehicle?.id === userVehicle.id}
  showStats={true}
  onSelect={() => selectVehicle(userVehicle)}
  onEdit={() => editVehicle(userVehicle.id)}
/>
```

#### Features
- ✅ Vehicle specifications display
- ✅ Performance statistics
- ✅ Selection state indicator
- ✅ Edit functionality
- ✅ Racing history

---

### VehicleSelector
**Location:** `src/components/vehicle/VehicleSelector.tsx`

Component for selecting a vehicle from user's garage.

#### Props
```typescript
interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  onVehicleSelect: (vehicle: Vehicle) => void;
  onAddVehicle?: () => void;
}
```

#### Usage
```tsx
import { VehicleSelector } from '../components/vehicle/VehicleSelector';

<VehicleSelector 
  vehicles={userVehicles}
  selectedVehicle={currentVehicle}
  onVehicleSelect={(vehicle) => setCurrentVehicle(vehicle)}
  onAddVehicle={() => navigation.navigate('AddVehicle')}
/>
```

#### Features
- ✅ Horizontal scrollable vehicle list
- ✅ Add new vehicle option
- ✅ Vehicle comparison
- ✅ Quick selection

---

## 📄 COMMON COMPONENTS

### LoadingSpinner
**Location:** `src/components/common/LoadingSpinner.tsx`

Animated loading indicator.

#### Props
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
}
```

#### Usage
```tsx
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Basic spinner
<LoadingSpinner size="large" />

// Full-screen overlay
<LoadingSpinner overlay={true} />
```

---

### ErrorBoundary
**Location:** `src/components/common/ErrorBoundary.tsx`

Error boundary component for handling component errors.

#### Props
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error: Error}>;
}
```

#### Usage
```tsx
import { ErrorBoundary } from '../components/common/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

### Button
**Location:** `src/components/common/Button.tsx`

Standardized button component.

#### Props
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}
```

#### Usage
```tsx
import { Button } from '../components/common/Button';

<Button 
  title="Join Race"
  variant="primary"
  size="large"
  onPress={handleJoinRace}
  loading={isJoining}
/>
```

---

## 📚 HOOKS

### useLocation
**Location:** `src/hooks/useLocation.tsx`

Hook for managing user location services.

#### Usage
```tsx
import { useLocation } from '../hooks/useLocation';

const MyComponent = () => {
  const { 
    location, 
    error, 
    isLoading, 
    requestPermission,
    startTracking,
    stopTracking 
  } = useLocation();

  // Use location data
};
```

#### Returns
```typescript
{
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  startTracking: () => void;
  stopTracking: () => void;
}
```

---

### useRaceData
**Location:** `src/hooks/useRaceData.tsx`

Hook for managing race data and real-time updates.

#### Usage
```tsx
import { useRaceData } from '../hooks/useRaceData';

const RaceScreen = () => {
  const { 
    races, 
    activeRace, 
    isLoading, 
    joinRace, 
    leaveRace,
    refreshRaces 
  } = useRaceData();

  // Use race data and functions
};
```

#### Returns
```typescript
{
  races: Race[];
  activeRace: Race | null;
  nearbyRaces: Race[];
  isLoading: boolean;
  error: string | null;
  joinRace: (raceId: string) => Promise<void>;
  leaveRace: (raceId: string) => Promise<void>;
  createRace: (raceData: CreateRaceData) => Promise<Race>;
  refreshRaces: () => Promise<void>;
}
```

---

## 🎨 STYLING GUIDE

### Theme System
**Location:** `src/utils/theme.ts`

Centralized theme configuration.

#### Colors
```typescript
export const colors = {
  primary: '#FF0000',        // Dash Red
  secondary: '#1A1A1A',      // Dark Gray
  background: '#000000',     // Black
  surface: '#2A2A2A',        // Light Gray
  text: '#FFFFFF',           // White
  textSecondary: '#CCCCCC',  // Light Gray
  success: '#00FF00',        // Green
  warning: '#FFD700',        // Gold
  error: '#FF4444',          // Red
  transparent: 'rgba(0,0,0,0.5)'
};
```

#### Typography
```typescript
export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' }
};
```

#### Spacing
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};
```

---

## 🧪 TESTING

### Component Testing
All components should include:
- ✅ Render tests
- ✅ Props validation
- ✅ User interaction tests
- ✅ State management tests

### Example Test
```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { DashIcon } from '../DashIcon';

describe('DashIcon', () => {
  test('renders correctly', () => {
    const { getByTestId } = render(
      <DashIcon name="home" size={24} />
    );
    expect(getByTestId('dash-icon')).toBeTruthy();
  });

  test('handles press events', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <DashIcon name="home" onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('dash-icon'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

---

## 📋 BEST PRACTICES

### Component Structure
1. **Props Interface**: Always define TypeScript interfaces
2. **Default Props**: Use default parameters in function signature
3. **Memoization**: Use React.memo for performance-critical components
4. **Error Boundaries**: Wrap complex components in error boundaries
5. **Accessibility**: Include accessibility props (accessibilityLabel, etc.)

### Styling
1. **Theme Usage**: Always use theme colors and spacing
2. **StyleSheet**: Use StyleSheet.create for performance
3. **Responsive Design**: Support different screen sizes
4. **Platform Differences**: Handle iOS/Android differences

### Performance
1. **Lazy Loading**: Implement for non-critical components
2. **Image Optimization**: Use appropriate image formats and sizes
3. **List Optimization**: Use FlatList for large datasets
4. **State Management**: Minimize unnecessary re-renders

---

## 🔄 COMPONENT LIFECYCLE

### Typical Component Flow
1. **Mount**: Component initialization
2. **Props Update**: Handle prop changes
3. **State Update**: Manage internal state
4. **Re-render**: Optimize rendering cycles
5. **Unmount**: Cleanup subscriptions and timers

---

*Last updated: August 24, 2025*
*This documentation is automatically updated with component changes*