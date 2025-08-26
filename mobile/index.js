/**
 * @format
 * Pure React Native Entry Point (NO MORE EXPO BULLSHIT!)
 */

import {AppRegistry} from 'react-native';
import App from './App';

// Register the app component with the exact name from MainActivity.kt
AppRegistry.registerComponent('GridGhostMobile', () => App);