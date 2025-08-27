/**
 * Test API connection to local backend
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { API_CONFIG } from './config/api';

export default function TestApiConnection() {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const url = API_CONFIG.BASE_URL;
      setApiUrl(url);
      
      console.log('🧪 Testing API connection to:', url);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiStatus(`✅ Connected! Version: ${data.version}`);
        console.log('✅ API Connection successful:', data);
      } else {
        setApiStatus(`❌ HTTP ${response.status}: ${response.statusText}`);
        console.log('❌ API Connection failed:', response.status, response.statusText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiStatus(`❌ Error: ${errorMessage}`);
      console.log('❌ API Connection error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      <Text style={styles.url}>URL: {apiUrl}</Text>
      <Text style={styles.status}>{apiStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  url: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
});