import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import {
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
} from '@env';

interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail';
  message: string;
  details?: string;
}

export default function SupabaseConnectionTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Environment Variables', status: 'pending', message: 'Checking...' },
    { name: 'Supabase Client', status: 'pending', message: 'Checking...' },
    { name: 'Auth Service', status: 'pending', message: 'Checking...' },
    { name: 'Database Connection', status: 'pending', message: 'Checking...' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    console.log('TEST_START Starting Supabase Connection Tests...');

    // Test 1: Environment Variables
    try {
      console.log('TEST_1 Test 1: Environment Variables');
      console.log('  - EXPO_PUBLIC_SUPABASE_URL:', EXPO_PUBLIC_SUPABASE_URL);
      console.log('  - EXPO_PUBLIC_SUPABASE_ANON_KEY length:', EXPO_PUBLIC_SUPABASE_ANON_KEY?.length);

      if (!EXPO_PUBLIC_SUPABASE_URL) {
        throw new Error('EXPO_PUBLIC_SUPABASE_URL is not defined');
      }
      if (!EXPO_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('EXPO_PUBLIC_SUPABASE_ANON_KEY is not defined');
      }
      if (!EXPO_PUBLIC_SUPABASE_URL.includes('supabase.co')) {
        throw new Error('Invalid Supabase URL format');
      }

      updateTest(0, 'pass', 'Environment variables loaded successfully', 
        `URL: ${EXPO_PUBLIC_SUPABASE_URL}\nKey Length: ${EXPO_PUBLIC_SUPABASE_ANON_KEY.length}`);
    } catch (error) {
      console.error('TEST_1_FAIL Test 1 failed:', error);
      updateTest(0, 'fail', 'Environment variables failed', (error as Error).message);
    }

    // Test 2: Supabase Client
    try {
      console.log('TEST_2 Test 2: Supabase Client');
      
      if (!supabase) {
        throw new Error('Supabase client is not defined');
      }
      if (typeof supabase !== 'object') {
        throw new Error('Supabase client is not an object');
      }
      if (!supabase.auth) {
        throw new Error('Supabase auth is not available');
      }
      if (!supabase.from) {
        throw new Error('Supabase from method is not available');
      }

      updateTest(1, 'pass', 'Supabase client initialized successfully', 
        `Client type: ${typeof supabase}\nHas auth: ${!!supabase.auth}\nHas from: ${!!supabase.from}`);
    } catch (error) {
      console.error('TEST_2_FAIL Test 2 failed:', error);
      updateTest(1, 'fail', 'Supabase client initialization failed', (error as Error).message);
    }

    // Test 3: Auth Service
    try {
      console.log('TEST_3 Test 3: Auth Service');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error && !error.message.includes('session')) {
        throw new Error(`Auth service error: ${error.message}`);
      }

      updateTest(2, 'pass', 'Auth service is accessible', 
        `Session: ${data?.session ? 'Active' : 'None'}\nError: ${error?.message || 'None'}`);
    } catch (error) {
      console.error('TEST_3_FAIL Test 3 failed:', error);
      updateTest(2, 'fail', 'Auth service failed', (error as Error).message);
    }

    // Test 4: Database Connection
    try {
      console.log('TEST_4 Test 4: Database Connection');
      
      // Try a simple query that should work even without authentication
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      // We expect either success or a permission error (both indicate connection works)
      if (error && !error.message.includes('permission') && !error.message.includes('RLS')) {
        throw new Error(`Database connection error: ${error.message}`);
      }

      updateTest(3, 'pass', 'Database connection successful', 
        `Query result: ${data ? 'Success' : 'Permission-protected (expected)'}\nError: ${error?.message || 'None'}`);
    } catch (error) {
      console.error('TEST_4_FAIL Test 4 failed:', error);
      updateTest(3, 'fail', 'Database connection failed', (error as Error).message);
    }

    setIsRunning(false);
    console.log('[COMPLETE] Supabase Connection Tests Completed');
  };

  useEffect(() => {
    // Auto-run tests when component mounts
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'pass': return 'PASS';
      case 'fail': return 'FAIL';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'pass': return '#00AA00';
      case 'fail': return '#FF0000';
    }
  };

  const allTestsPassed = tests.every(test => test.status === 'pass');
  const hasFailures = tests.some(test => test.status === 'fail');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Supabase Connection Test</Text>
        <Text style={styles.subtitle}>Verify your Supabase configuration</Text>
      </View>

      <View style={styles.summary}>
        {allTestsPassed && (
          <Text style={[styles.summaryText, { color: '#00AA00' }]}>
            [SUCCESS] All tests passed! Your Supabase configuration is working correctly.
          </Text>
        )}
        {hasFailures && (
          <Text style={[styles.summaryText, { color: '#FF0000' }]}>
            [WARNING] Some tests failed. Please check the details below.
          </Text>
        )}
        {!allTestsPassed && !hasFailures && (
          <Text style={[styles.summaryText, { color: '#FFA500' }]}>
            ⏳ Running tests...
          </Text>
        )}
      </View>

      {tests.map((test, index) => (
        <View key={index} style={styles.testItem}>
          <View style={styles.testHeader}>
            <Text style={styles.testIcon}>{getStatusIcon(test.status)}</Text>
            <Text style={styles.testName}>{test.name}</Text>
          </View>
          <Text style={[styles.testMessage, { color: getStatusColor(test.status) }]}>
            {test.message}
          </Text>
          {test.details && (
            <Text style={styles.testDetails}>{test.details}</Text>
          )}
        </View>
      ))}

      <TouchableOpacity 
        style={[styles.button, isRunning && styles.buttonDisabled]} 
        onPress={runTests}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Running Tests...' : 'Run Tests Again'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          If all tests pass, your app is ready for authentication!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  testItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  testName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  testMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  testDetails: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});