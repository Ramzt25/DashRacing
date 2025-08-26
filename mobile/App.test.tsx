import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SupabaseConnectionTest from './src/components/SupabaseConnectionTest';
import { colors } from './src/utils/theme';

/**
 * Test version of App.tsx for Supabase connection testing
 * Replace the main App.tsx with this temporarily to run connection tests
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SupabaseConnectionTest />
      </View>
    </SafeAreaProvider>
  );
}