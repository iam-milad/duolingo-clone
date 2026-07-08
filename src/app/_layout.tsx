import { useEffect, useRef } from 'react';
import { Stack, usePathname, useGlobalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ClerkProvider, useAuth, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { PostHogProvider } from 'posthog-react-native';

import '../global.css';
import { posthog } from '@/lib/posthog';

function AuthSync() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isSignedIn && userId) {
      const setProps: Record<string, string> = {};
      if (user?.primaryEmailAddress?.emailAddress) setProps.email = user.primaryEmailAddress.emailAddress;
      if (user?.firstName) setProps.first_name = user.firstName;
      if (user?.lastName) setProps.last_name = user.lastName;
      posthog.identify(userId, {
        $set: setProps,
        $set_once: { first_seen_at: new Date().toISOString() },
      });
    } else if (isSignedIn === false) {
      posthog.reset();
    }
  }, [isSignedIn, userId, user]);

  return null;
}

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('../../assetss/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assetss/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assetss/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../assetss/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, { previous_screen: previousPathname.current ?? null, ...params });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ['testID'],
      }}
    >
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <AuthSync />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="language-selection" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="lesson/[id]" />
        </Stack>
      </ClerkProvider>
    </PostHogProvider>
  );
}
