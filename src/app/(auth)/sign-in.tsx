import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme/colors";
import { VerificationModal } from "@/components/VerificationModal";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-2 w-10 h-10 justify-center"
          >
            <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <Text className="heading-1 text-text-primary mt-4">Welcome back!</Text>
          <Text className="body-lg text-text-secondary mt-1">
            Sign in to continue your journey ✨
          </Text>

          {/* Mascot */}
          <View className="items-center my-6">
            <Image
              source={images.mascotAuth}
              className="w-40 h-40"
              resizeMode="contain"
            />
          </View>

          {/* Email */}
          <View className="border border-border rounded-xl px-4 pt-2.5 pb-2 mb-6">
            <Text className="caption text-text-secondary">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ paddingVertical: 4 }}
              className="body-md text-text-primary"
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            className="bg-lingua-purple rounded-full h-14 items-center justify-center"
            onPress={() => setShowVerification(true)}
            activeOpacity={0.85}
          >
            <Text className="heading-4 text-white text-center">Sign In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6 gap-3">
            <View className="flex-1 h-px bg-border" />
            <Text className="body-sm text-text-secondary">or continue with</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Social Auth */}
          <SocialAuthButtons />

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8 mb-2">
            <Text className="body-md text-text-secondary">
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/sign-up")}>
              <Text className="body-md text-lingua-purple">Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <VerificationModal
        visible={showVerification}
        email={email}
        onClose={() => setShowVerification(false)}
        onVerified={() => {
          setShowVerification(false);
          router.replace("/");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
