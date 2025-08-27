/**
 * @format
 * Pure React Native Entry Point (NO MORE EXPO BULLSHIT!)
 */

// CRITICAL: Polyfills for Hermes engine - must be first imports
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

import {AppRegistry} from 'react-native';
import App from './App';

// Register the app component with the exact name from MainActivity.kt
AppRegistry.registerComponent('GridGhostMobile', () => App);