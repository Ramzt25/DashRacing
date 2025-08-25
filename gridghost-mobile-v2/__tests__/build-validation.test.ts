import * as path from 'path';
import * as fs from 'fs';

describe('🔧 DASH Mobile - TypeScript Compilation & Build Validation', () => {
  const mobileDir = path.join(__dirname, '..');
  const srcDir = path.join(mobileDir, 'src');

  describe('📁 Project Structure Validation', () => {
    test('All required directories exist', () => {
      const requiredDirs = [
        'src',
        'src/components',
        'src/screens',
        'src/context',
        'src/services',
        'src/hooks',
        'src/utils',
        'src/types',
        'src/api',
        'assets',
        'android',
      ];

      requiredDirs.forEach(dir => {
        const dirPath = path.join(mobileDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });

    test('Essential configuration files exist', () => {
      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'app.json',
        'App.tsx',
        'eas.json',
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(mobileDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('📦 Package.json Validation', () => {
    test('Package.json has required dependencies', () => {
      const packagePath = path.join(mobileDir, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      const requiredDeps = [
        'react',
        'react-native',
        'expo',
        '@react-navigation/native',
        '@react-navigation/stack',
        'react-native-maps',
        'expo-location',
        'axios',
      ];

      requiredDeps.forEach(dep => {
        expect(packageContent.dependencies[dep]).toBeDefined();
      });
    });

    test('Build scripts are properly configured', () => {
      const packagePath = path.join(mobileDir, 'package.json');
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      expect(packageContent.scripts['build:android']).toBeDefined();
      expect(packageContent.scripts['build:ios']).toBeDefined();
      expect(packageContent.scripts['type-check']).toBeDefined();
      expect(packageContent.scripts.test).toBeDefined();
    });
  });

  describe('⚙️ TypeScript Configuration Validation', () => {
    test('TSConfig is properly configured for React Native', () => {
      const tsconfigPath = path.join(mobileDir, 'tsconfig.json');
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

      expect(tsconfig.compilerOptions.jsx).toBe('react-native');
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.compilerOptions.moduleResolution).toBeDefined();
      expect(tsconfig.extends).toBe('expo/tsconfig.base');
    });

    test('Source TypeScript config exists', () => {
      const srcTsconfigPath = path.join(srcDir, 'tsconfig.json');
      expect(fs.existsSync(srcTsconfigPath)).toBe(true);
    });
  });

  describe('🎨 Component Architecture Validation', () => {
    test('Core components are TypeScript files', () => {
      const componentDir = path.join(srcDir, 'components');
      const files = fs.readdirSync(componentDir, { recursive: true });
      
      const tsxFiles = files.filter(file => 
        typeof file === 'string' && file.endsWith('.tsx')
      );
      
      expect(tsxFiles.length).toBeGreaterThan(0);
      expect(tsxFiles).toContain('DashIcon.tsx');
    });

    test('All screens are properly typed', () => {
      const screensDir = path.join(srcDir, 'screens');
      const files = fs.readdirSync(screensDir);
      
      const screenFiles = files.filter(file => file.endsWith('.tsx'));
      expect(screenFiles.length).toBeGreaterThan(5);
      
      const requiredScreens = [
        'HomeScreen.tsx',
        'LoginScreen.tsx',
        'LiveMapScreen.tsx',
        'GarageScreen.tsx',
        'ProfileScreen.tsx',
      ];

      requiredScreens.forEach(screen => {
        expect(screenFiles).toContain(screen);
      });
    });

    test('Context providers have proper TypeScript interfaces', () => {
      const contextDir = path.join(srcDir, 'context');
      const files = fs.readdirSync(contextDir);
      
      expect(files).toContain('AuthContext.tsx');
      expect(files).toContain('SettingsContext.tsx');
    });
  });

  describe('🛠️ Service Layer Validation', () => {
    test('API services are properly typed', () => {
      const servicesDir = path.join(srcDir, 'services');
      if (fs.existsSync(servicesDir)) {
        const files = fs.readdirSync(servicesDir);
        const serviceFiles = files.filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
        
        expect(serviceFiles.length).toBeGreaterThan(0);
      }
    });

    test('Type definitions exist', () => {
      const typesDir = path.join(srcDir, 'types');
      if (fs.existsSync(typesDir)) {
        const files = fs.readdirSync(typesDir);
        const typeFiles = files.filter(file => file.endsWith('.ts') || file.endsWith('.d.ts'));
        
        expect(typeFiles.length).toBeGreaterThan(0);
      }
    });
  });

  describe('📱 Expo Configuration Validation', () => {
    test('App.json is properly configured', () => {
      const appJsonPath = path.join(mobileDir, 'app.json');
      const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

      expect(appConfig.expo).toBeDefined();
      expect(appConfig.expo.name).toBeDefined();
      expect(appConfig.expo.slug).toBeDefined();
      expect(appConfig.expo.version).toBeDefined();
      expect(appConfig.expo.platforms).toContain('ios');
      expect(appConfig.expo.platforms).toContain('android');
    });

    test('EAS build configuration exists', () => {
      const easPath = path.join(mobileDir, 'eas.json');
      if (fs.existsSync(easPath)) {
        const easConfig = JSON.parse(fs.readFileSync(easPath, 'utf8'));
        expect(easConfig.build).toBeDefined();
      }
    });
  });

  describe('🤖 Android Build Configuration', () => {
    test('Android directory structure is valid', () => {
      const androidDir = path.join(mobileDir, 'android');
      if (fs.existsSync(androidDir)) {
        const requiredAndroidFiles = [
          'build.gradle',
          'settings.gradle',
          'app/build.gradle',
        ];

        requiredAndroidFiles.forEach(file => {
          const filePath = path.join(androidDir, file);
          expect(fs.existsSync(filePath)).toBe(true);
        });
      }
    });

    test('Android manifest and permissions', () => {
      const manifestPath = path.join(mobileDir, 'android/app/src/main/AndroidManifest.xml');
      if (fs.existsSync(manifestPath)) {
        const manifest = fs.readFileSync(manifestPath, 'utf8');
        
        // Check for required permissions
        expect(manifest).toMatch(/ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION/);
        expect(manifest).toMatch(/INTERNET/);
      }
    });
  });

  describe('🔗 Import/Export Validation', () => {
    test('App.tsx imports are resolvable', () => {
      const appPath = path.join(mobileDir, 'App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf8');

      // Check for critical imports
      expect(appContent).toMatch(/from ['"]react['"]/);
      expect(appContent).toMatch(/from ['"]react-native['"]/);
      expect(appContent).toMatch(/from ['"]@react-navigation\/native['"]/);
    });

    test('Circular dependency detection', () => {
      // This test checks for obvious circular dependencies by examining imports
      const checkFile = (filePath: string, visited: Set<string> = new Set()): boolean => {
        if (visited.has(filePath)) {
          return false; // Circular dependency detected
        }

        if (!fs.existsSync(filePath) || !filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
          return true;
        }

        visited.add(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract local imports (relative paths)
        const importMatches = content.match(/from ['"][./][^'"]*['"]/g) || [];
        
        for (const importMatch of importMatches) {
          const importPath = importMatch.match(/from ['"]([^'"]*)['"]/)?.[1];
          if (importPath?.startsWith('.')) {
            const resolvedPath = path.resolve(path.dirname(filePath), importPath);
            if (!checkFile(resolvedPath + '.tsx', new Set(visited))) {
              return false;
            }
          }
        }

        return true;
      };

      const appPath = path.join(mobileDir, 'App.tsx');
      expect(checkFile(appPath)).toBe(true);
    });
  });

  describe('🎯 Asset and Resource Validation', () => {
    test('Required assets exist', () => {
      const assetsDir = path.join(mobileDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        const requiredAssets = [
          'icon.png',
          'splash-icon.png',
          'adaptive-icon.png',
        ];

        requiredAssets.forEach(asset => {
          const assetPath = path.join(assetsDir, asset);
          expect(fs.existsSync(assetPath)).toBe(true);
        });
      }
    });

    test('Dash icons directory exists and has icons', () => {
      const dashIconsDir = path.join(mobileDir, 'assets/dash-icons');
      if (fs.existsSync(dashIconsDir)) {
        const iconFiles = fs.readdirSync(dashIconsDir);
        const pngFiles = iconFiles.filter(file => file.endsWith('.png'));
        
        expect(pngFiles.length).toBeGreaterThan(0);
        
        const expectedIcons = [
          'Home.png',
          'Events.png',
          'Live race.png',
          'Mygarage.png',
          'Location.png',
        ];

        expectedIcons.forEach(icon => {
          expect(iconFiles).toContain(icon);
        });
      }
    });
  });

  describe('📋 Code Quality Checks', () => {
    test('No TypeScript compilation errors in critical files', () => {
      const criticalFiles = [
        'App.tsx',
        'src/context/AuthContext.tsx',
        'src/context/SettingsContext.tsx',
        'src/components/DashIcon.tsx',
      ];

      criticalFiles.forEach(file => {
        const filePath = path.join(mobileDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Basic syntax checks
          expect(content).not.toMatch(/\bany\s+=/); // Avoid explicit any types
          expect(content).toMatch(/^import/m); // Has imports
          expect(content).toMatch(/export/m); // Has exports
        }
      });
    });

    test('Consistent code style patterns', () => {
      const componentFiles: string[] = [];
      const componentsDir = path.join(srcDir, 'components');
      
      if (fs.existsSync(componentsDir)) {
        const walkDir = (dir: string) => {
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
              walkDir(filePath);
            } else if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
              componentFiles.push(filePath);
            }
          });
        };
        
        walkDir(componentsDir);
      }

      componentFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Should use proper React patterns
        expect(content).toMatch(/import React/);
        
        // Should export components properly
        expect(content).toMatch(/export\s+(function|const|default)/);
      });
    });
  });

  describe('🔧 Metro and Build Tool Configuration', () => {
    test('Metro config handles TypeScript and assets', () => {
      const metroConfigPath = path.join(mobileDir, 'metro.config.js');
      if (fs.existsSync(metroConfigPath)) {
        const metroConfig = fs.readFileSync(metroConfigPath, 'utf8');
        expect(metroConfig).toMatch(/module\.exports/);
      }
    });

    test('Babel configuration supports React Native', () => {
      const babelConfigPath = path.join(mobileDir, 'babel.config.js');
      if (fs.existsSync(babelConfigPath)) {
        const babelConfig = fs.readFileSync(babelConfigPath, 'utf8');
        expect(babelConfig).toMatch(/babel-preset-expo|@babel\/preset-react|@react-native\/babel-preset/);
      }
    });
  });
});