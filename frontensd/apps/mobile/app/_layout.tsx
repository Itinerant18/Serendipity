// Polyfill for Supabase Auth
import { setupURLPolyfill } from 'react-native-url-polyfill';

// Safely polyfill window if needed
if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = {};
}

setupURLPolyfill();

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/authStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on app start
    loadUser();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        <Stack.Screen name="products/[id]" options={{ 
          title: 'Product Details',
          headerShown: true,
          headerStyle: { backgroundColor: '#D97534' },
          headerTintColor: '#fff',
        }} />
        <Stack.Screen name="checkout" options={{ 
          title: 'Checkout',
          headerShown: true,
          headerStyle: { backgroundColor: '#D97534' },
          headerTintColor: '#fff',
        }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
