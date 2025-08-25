// Essential React Native Jest setup
import 'react-native-gesture-handler/jestSetup';

// Global test configuration
global.__DEV__ = true;

// Set timeout for longer running tests
jest.setTimeout(30000);