/**
 * Debug Logs Screen for GridGhost Mobile App
 * Provides real-time log viewing and error analysis
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Share,
  Modal,
  TextInput,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { mobileLogger } from '../utils/logger';
import { colors } from '../utils/theme';

export const DebugLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = useCallback(() => {
    const recentLogs = mobileLogger.getRecentLogs(200);
    let filtered = recentLogs;

    // Apply level filter
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(log => log.category === filterCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(query) ||
        log.category.toLowerCase().includes(query) ||
        JSON.stringify(log.context || {}).toLowerCase().includes(query)
      );
    }

    setLogs(filtered.reverse()); // Show newest first
  }, [filterLevel, filterCategory, searchQuery]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLogs();
    setRefreshing(false);
  }, [loadLogs]);

  const shareLogs = async () => {
    try {
      const logsText = mobileLogger.exportLogs();
      await Share.share({
        message: logsText,
        title: 'GridGhost Debug Logs'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share logs');
    }
  };

  const clearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await mobileLogger.clearLogs();
            loadLogs();
          }
        }
      ]
    );
  };

  const sendLogsToServer = async () => {
    try {
      await mobileLogger.sendLogsToServer();
      Alert.alert('Success', 'Logs sent to server for analysis');
    } catch (error) {
      Alert.alert('Error', 'Failed to send logs to server');
    }
  };

  const generateErrorReport = async () => {
    try {
      const report = await mobileLogger.generateErrorReport();
      const reportText = JSON.stringify(report, null, 2);
      await Share.share({
        message: reportText,
        title: 'GridGhost Error Report'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate error report');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return colors.textSecondary;
      case 'info': return colors.primary;
      case 'warn': return colors.warning;
      case 'error': return colors.racingRed;
      case 'critical': return '#8B0000';
      default: return colors.textPrimary;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'debug': return '🔍';
      case 'info': return 'i';
      case 'warn': return '!';
      case 'error': return '❌';
      case 'critical': return '🚨';
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const categories = ['all', ...new Set(mobileLogger.getRecentLogs(500).map(log => log.category))];
  const levels = ['all', 'debug', 'info', 'warn', 'error', 'critical'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Debug Logs</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowFilters(true)}>
            <Text style={styles.headerButtonText}>Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={shareLogs}>
            <Text style={styles.headerButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search logs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {logs.length} logs • Errors: {logs.filter(l => l.level === 'error' || l.level === 'critical').length}
        </Text>
      </View>

      {/* Logs List */}
      <ScrollView
        style={styles.logsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {logs.map((log, index) => (
          <View key={index} style={styles.logEntry}>
            <View style={styles.logHeader}>
              <Text style={styles.logTime}>{formatTimestamp(log.timestamp)}</Text>
              <Text style={[styles.logLevel, { color: getLevelColor(log.level) }]}>
                {getLevelIcon(log.level)} {log.level.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.logContent}>
              <Text style={styles.logCategory}>[{log.category}]</Text>
              <Text style={styles.logMessage}>{log.message}</Text>
              
              {log.screen && (
                <Text style={styles.logMeta}>Screen: {log.screen}</Text>
              )}
              
              {log.userId && (
                <Text style={styles.logMeta}>User: {log.userId}</Text>
              )}
              
              {log.context && Object.keys(log.context).length > 0 && (
                <Text style={styles.logContext}>
                  {JSON.stringify(log.context, null, 2)}
                </Text>
              )}
            </View>
          </View>
        ))}
        
        {logs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No logs match your filters</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={sendLogsToServer}>
          <Text style={styles.actionButtonText}>Send to Server</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={generateErrorReport}>
          <Text style={styles.actionButtonText}>Error Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={clearLogs}>
          <Text style={styles.actionButtonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Logs</Text>
            
            <Text style={styles.filterLabel}>Level:</Text>
            <ScrollView horizontal style={styles.filterOptions}>
              {levels.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterOption,
                    filterLevel === level && styles.filterOptionActive
                  ]}
                  onPress={() => setFilterLevel(level)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterLevel === level && styles.filterOptionTextActive
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.filterLabel}>Category:</Text>
            <ScrollView horizontal style={styles.filterOptions}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    filterCategory === category && styles.filterOptionActive
                  ]}
                  onPress={() => setFilterCategory(category)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterCategory === category && styles.filterOptionTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setFilterLevel('all');
                  setFilterCategory('all');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.modalButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logEntry: {
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logTime: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  logContent: {
    gap: 4,
  },
  logCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  logMessage: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  logMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  logContext: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: colors.racingRed,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    margin: 20,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterOption: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceSecondary,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DebugLogsScreen;