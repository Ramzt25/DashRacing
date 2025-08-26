// Essential React Native Jest setup
import 'react-native-gesture-handler/jestSetup';

// Global test configuration
global.__DEV__ = true;

// Set timeout for longer running tests
jest.setTimeout(30000);

// Mock expo modules and native dependencies
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 0,
      accuracy: 5,
      heading: 90,
      speed: 25,
    },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({
    remove: jest.fn(),
  })),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  FontAwesome: 'FontAwesome',
  MaterialIcons: 'MaterialIcons',
}));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => View(props);
  const MockMarker = (props) => View(props);
  const MockPolyline = (props) => View(props);
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1,
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: 'mock response' }),
  })
);

// Mock native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Process environment mocks
global.process = {
  ...global.process,
  env: {
    ...global.process?.env,
    EXPO_OS: 'ios',
    NODE_ENV: 'test',
  },
};