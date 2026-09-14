import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { AuthProvider } from '../src/context/AuthContext';
import { SettingsProvider } from '../src/context/SettingsContext';
import { LiveProvider } from '../src/context/LiveContext';
import { colors, type } from '../src/theme/tokens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();
const MIN_DISPLAY_TIME = 0;

export default function RootLayout() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [loaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  async function checkForUpdates() {
    if (!Updates.isEnabled) return;
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        const startTime = Date.now();
        setIsUpdating(true);
        await Updates.fetchUpdateAsync();
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        await Updates.reloadAsync();
      }
    } catch {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      checkForUpdates();
    }
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(checkForUpdates, 18000000);
    return () => clearInterval(interval);
  }, [loaded]);

  if (isUpdating) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.text}>Updating… Please wait</Text>
      </View>
    );
  }

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <SettingsProvider>
          <AuthProvider>
            <LiveProvider>
            <StatusBar style="light" backgroundColor={colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="game/[slug]" />
          <Stack.Screen name="news/[slug]" />
          <Stack.Screen name="video/[id]" />
          <Stack.Screen name="account" options={{ presentation: "modal" }} />
          <Stack.Screen name="config" options={{ presentation: "modal" }} />
          <Stack.Screen name="register" options={{ presentation: "modal" }} />
          <Stack.Screen name="search" options={{ presentation: 'modal' }} />
          <Stack.Screen name="check-updates" options={{ presentation: 'modal' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
          <Stack.Screen name="login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="admin/newsletter" options={{ presentation: 'modal' }} />
          <Stack.Screen name="admin/video" options={{ presentation: 'modal' }} />
          <Stack.Screen name="admin/game" options={{ presentation: 'modal' }} />
          </Stack>
          </LiveProvider>
          </AuthProvider>
        </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  text: {
    fontFamily: type.body,
    color: colors.onSurface,
    fontSize: 16,
  },
});
