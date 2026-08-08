import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { 
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold 
} from '@expo-google-fonts/plus-jakarta-sans';
import { Text, TextInput, StyleSheet } from 'react-native';
import queryClient from '../src/config/tanstack';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Helper to determine font family based on style weight
const getFontFamilyForStyle = (style: any): string => {
  if (!style) return 'PlusJakartaSans-Regular';
  
  const flatStyle = StyleSheet.flatten(style);
  if (!flatStyle) return 'PlusJakartaSans-Regular';
  
  // Keep original fontFamily if it is custom (like vector icons)
  if (flatStyle.fontFamily && flatStyle.fontFamily !== 'System' && flatStyle.fontFamily !== 'sans-serif') {
    return flatStyle.fontFamily;
  }
  
  const weight = flatStyle.fontWeight;
  if (weight === 'bold' || weight === '700') {
    return 'PlusJakartaSans-Bold';
  }
  if (weight === '800' || weight === '900') {
    return 'PlusJakartaSans-ExtraBold';
  }
  if (weight === '600') {
    return 'PlusJakartaSans-SemiBold';
  }
  if (weight === '500') {
    return 'PlusJakartaSans-Medium';
  }
  return 'PlusJakartaSans-Regular';
};

import { Platform } from 'react-native';

// Monkey patch Text and TextInput render functions to apply fonts globally and strip web outline box
const patchComponentFonts = (Component: any, isTextInput: boolean = false) => {
  if (!Component || !Component.render) return;

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    if (!document.getElementById('global-remove-focus-ring')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'global-remove-focus-ring';
      styleEl.innerHTML = `
        input, textarea, select, [contenteditable="true"] {
          outline: none !important;
          box-shadow: none !important;
        }
        input:focus, textarea:focus, select:focus, [contenteditable="true"]:focus {
          outline: none !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }

  const originalRender = Component.render;
  Component.render = function (props: any, ref: any) {
    const originalStyle = props.style;
    const fontFamily = getFontFamilyForStyle(originalStyle);
    
    const extraStyle = isTextInput ? { fontFamily, outlineStyle: 'none', outlineWidth: 0 } : { fontFamily };
    
    const newProps = {
      ...props,
      style: [extraStyle, originalStyle],
    };
    
    return originalRender.call(this, newProps, ref);
  };
};

patchComponentFonts(Text, false);
patchComponentFonts(TextInput, true);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
