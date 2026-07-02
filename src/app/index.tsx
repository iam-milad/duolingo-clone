import { useAuth } from '@clerk/expo';
import { Href, Redirect, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const router = useRouter();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/onboarding" />;

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Text className="heading-1 text-lingua-purple">Lingua</Text>
      <TouchableOpacity
        onPress={() => router.push('/language-selection' as Href)}
        className="px-6 py-3 bg-lingua-purple rounded-full"
        activeOpacity={0.8}
      >
        <Text className="body-md text-white">Choose a language</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => signOut()}
        className="px-6 py-3 bg-surface border border-border rounded-full"
        activeOpacity={0.8}
      >
        <Text className="body-md text-text-secondary">Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
