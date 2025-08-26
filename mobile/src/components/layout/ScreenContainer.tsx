import React from 'react';
import { View, ScrollView, StatusBar, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../utils/theme';

type Props = {
  children?: React.ReactNode;
  scroll?: boolean; // use ScrollView when page content should scroll
  contentContainerStyle?: ViewStyle;
  statusBarStyle?: 'dark-content' | 'light-content';
  backgroundColor?: string;
  hideTopInset?: boolean; // for screens that intentionally overlay header
  showsVerticalScrollIndicator?: boolean;
};

export default function ScreenContainer({
  children,
  scroll = true,
  contentContainerStyle,
  statusBarStyle = 'light-content',
  backgroundColor = colors.background,
  hideTopInset = false,
  showsVerticalScrollIndicator = false,
}: Props) {
  
  // Base padding: consistent across all screens
  const baseContentStyle: ViewStyle = {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  };

  if (scroll) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[baseContentStyle, contentContainerStyle]}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      <View style={[styles.content, baseContentStyle]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});