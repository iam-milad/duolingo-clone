import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';

import { useLanguageStore } from '@/store/languageStore';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { selectedLanguage } = useLanguageStore();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/onboarding" />;

  if (!selectedLanguage) return <Redirect href="/language-selection" />;

  return <Redirect href="/(tabs)" />;
}
