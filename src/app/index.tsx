import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { isSignedIn, isLoaded, signOut } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) return <Redirect href="/onboarding" />;

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="heading-1 text-lingua-purple">Lingua</Text>
      <TouchableOpacity
        onPress={() => signOut()}
        className="mt-4 px-6 py-3 bg-surface border border-border rounded-full"
        activeOpacity={0.8}
      >
        <Text className="body-md text-text-secondary">Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
