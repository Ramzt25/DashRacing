import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function App() {
  console.log('🚀 Debug App started');
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🏁 DashRacing Debug</Text>
        <Text style={styles.subtitle}>App is loading successfully!</Text>
        <Text style={styles.info}>This means React Native is working</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#00ff00',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
});