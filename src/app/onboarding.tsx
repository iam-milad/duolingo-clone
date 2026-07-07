import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";

import { images } from "@/constants/images";

export default function Onboarding() {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View className="flex-1 justify-between px-6">
        <View>
          <View className="flex-row items-center justify-center gap-2 mt-4">
            <Image source={images.mascotLogo} className="w-10 h-10" resizeMode="contain" />
            <Text className="heading-3 text-text-primary">Lingua</Text>
          </View>

          <Text className="heading-1 text-text-primary mt-8">
            Your AI language{" "}
            <Text className="text-lingua-purple">teacher.</Text>
          </Text>

          <Text className="body-lg text-text-secondary mt-3">
            Real conversations, personalized lessons, anytime, anywhere.
          </Text>

          <View className="items-center mt-10 h-80">
            <View
              className="absolute top-2 left-0 bg-surface rounded-2xl px-3 py-1.5"
              style={styles.bubbleShadow}
            >
              <Text className="body-sm text-text-primary">Hello!</Text>
            </View>

            <View className="absolute top-0 right-2 bg-lingua-purple/10 rounded-2xl px-3 py-1.5">
              <Text className="body-sm text-lingua-purple">¡Hola!</Text>
            </View>

            <View className="absolute top-24 right-0 bg-red-50 rounded-2xl px-3 py-1.5">
              <Text className="body-sm text-red-500">你好!</Text>
            </View>

            <Image
              source={images.mascotWelcome}
              className="w-[260px] h-[260px] mt-10"
              resizeMode="contain"
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-lingua-purple rounded-full h-14 flex-row items-center px-6 mb-6"
          onPress={() => {
            posthog.capture('onboarding_get_started');
            router.push("/(auth)/sign-up");
          }}
        >
          <Text className="flex-1 text-center heading-4 text-white">
            Get Started
          </Text>
          <Text className="text-white text-lg">{"→"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bubbleShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
