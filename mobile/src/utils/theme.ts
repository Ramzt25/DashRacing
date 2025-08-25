export const colors = {
  // Main racing theme - Black and Red
  primary: '#FF0000',        // Racing Red
  secondary: '#CC0000',      // Dark Red
  accent: '#FF3333',         // Light Red
  warning: '#FF6600',        // Orange warning
  
  // Dark gunmetal theme - Improved contrast
  background: '#000000',     // Pure Black for better contrast
  surface: '#1A1A1A',        // Dark Grey
  surfaceSecondary: '#2A2A2A', // Medium Dark Grey
  surfaceElevated: '#3A3A3A', // Elevated Grey
  
  // Text - Better contrast
  textPrimary: '#FFFFFF',    // White
  textSecondary: '#E0E0E0',  // Brighter Light Gray
  textTertiary: '#A0A0A0',   // Medium Gray
  
  // Gradients
  gradientPrimary: ['#FF0000', '#CC0000'],     // Red gradient
  gradientSecondary: ['#CC0000', '#990000'],   // Dark red gradient
  gradientAccent: ['#FF3333', '#FF0000'],      // Light to dark red
  gradientDark: ['#1A1A1A', '#000000'],        // Improved Black gradient
  gradientMap: ['rgba(0,0,0,0.9)', 'rgba(26,26,26,0.7)'],
  
  // Racing colors
  racingRed: '#FF0000',      // Primary Red
  racingRedDark: '#CC0000',  // Dark Red
  racingRedLight: '#FF3333', // Light Red
  racingOrange: '#FF6600',   // Orange accents
  racingYellow: '#FFCC00',   // Warning/caution
  racingWhite: '#FFFFFF',    // Clean white
  
  // Transparencies
  overlay: 'rgba(0,0,0,0.8)',
  overlayLight: 'rgba(0,0,0,0.4)',
  glass: 'rgba(255,255,255,0.1)',
  glassStrong: 'rgba(255,255,255,0.2)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.textPrimary,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    color: colors.textTertiary,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    letterSpacing: 0.25,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
};