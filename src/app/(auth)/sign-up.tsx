import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSignUp } from "@clerk/expo";
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
import { usePostHog } from "posthog-react-native";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme/colors";
import { VerificationModal } from "@/components/VerificationModal";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
import { useOAuthProviders } from "@/hooks/useOAuthProviders";

export default function SignUp() {
  const router = useRouter();
  const posthog = usePostHog();
  const { signUp, fetchStatus } = useSignUp();
  const { signInWithOAuth } = useOAuthProviders();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    posthog.capture('sign_up_initiated');

    const { error: passwordError } = await signUp.password({ emailAddress: email, password });
    if (passwordError) {
      console.error("[SignUp] password error:", JSON.stringify(passwordError));
      setError(passwordError.longMessage || passwordError.message || "Something went wrong.");
      setLoading(false);
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      console.error("[SignUp] sendEmailCode error:", JSON.stringify(sendError));
      setError(sendError.longMessage || sendError.message || "Failed to send verification code.");
      setLoading(false);
      return;
    }
    console.log("[SignUp] verification email sent, status:", signUp.status);

    setLoading(false);
    setShowVerification(true);
  };

  const handleVerifyCode = async (code: string) => {
    const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
    if (verifyError) {
      throw new Error(verifyError.longMessage || verifyError.message || "Invalid code.");
    }

    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      throw new Error(finalizeError.longMessage || finalizeError.message || "Sign up failed.");
    }

    posthog.capture('sign_up_completed');
  };

  const handleResend = async () => {
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      throw new Error(sendError.longMessage || sendError.message || "Failed to resend code.");
    }
  };

  const isBusy = loading || fetchStatus === "fetching";

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
          <Text className="heading-1 text-text-primary mt-4">
            Create your account
          </Text>
          <Text className="body-lg text-text-secondary mt-1">
            Start your language journey today ✨
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
          <View className="border border-border rounded-xl px-4 pt-2.5 pb-2 mb-4">
            <Text className="caption text-text-secondary">Email</Text>
            <TextInput
              value={email}
              onChangeText={(v) => { setEmail(v); setError(null); }}
              placeholder="your@email.com"
              placeholderTextColor={colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ paddingVertical: 4 }}
              className="body-md text-text-primary"
            />
          </View>

          {/* Password */}
          <View className="border border-border rounded-xl px-4 pt-2.5 pb-2 flex-row items-center mb-2">
            <View className="flex-1">
              <Text className="caption text-text-secondary">Password</Text>
              <TextInput
                value={password}
                onChangeText={(v) => { setPassword(v); setError(null); }}
                placeholder="••••••••"
                placeholderTextColor={colors.text.secondary}
                secureTextEntry={!showPassword}
                style={{ paddingVertical: 4, flex: 1 }}
                className="body-md text-text-primary"
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="pl-3"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Error */}
          {error ? (
            <Text className="body-sm text-error mb-4">{error}</Text>
          ) : (
            <View className="mb-4" />
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            className="bg-lingua-purple rounded-full h-14 items-center justify-center"
            onPress={handleSignUp}
            activeOpacity={0.85}
            disabled={isBusy || !email || !password}
            style={{ opacity: isBusy || !email || !password ? 0.6 : 1 }}
          >
            <Text className="heading-4 text-white text-center">
              {isBusy ? "Creating account…" : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-6 gap-3">
            <View className="flex-1 h-px bg-border" />
            <Text className="body-sm text-text-secondary">or continue with</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <SocialAuthButtons onPress={signInWithOAuth} />

          {/* Sign In Link */}
          <View className="flex-row justify-center mt-8 mb-2">
            <Text className="body-md text-text-secondary">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/sign-in")}>
              <Text className="body-md text-lingua-purple">Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <VerificationModal
        visible={showVerification}
        email={email}
        onClose={() => setShowVerification(false)}
        onCodeComplete={handleVerifyCode}
        onResend={handleResend}
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
