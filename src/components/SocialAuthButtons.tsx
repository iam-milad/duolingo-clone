import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { OAuthProvider } from "@/hooks/useOAuthProviders";

type Props = {
  onPress: (provider: OAuthProvider) => void;
};

const SOCIAL_BUTTONS: { provider: OAuthProvider; icon: "logo-google" | "logo-facebook" | "logo-apple"; color: string; label: string }[] = [
  { provider: "google", icon: "logo-google", color: "#4285F4", label: "Continue with Google" },
  { provider: "facebook", icon: "logo-facebook", color: "#1877F2", label: "Continue with Facebook" },
  { provider: "apple", icon: "logo-apple", color: "#000000", label: "Continue with Apple" },
];

export function SocialAuthButtons({ onPress }: Props) {
  return (
    <View className="gap-3">
      {SOCIAL_BUTTONS.map(({ provider, icon, color, label }) => (
        <TouchableOpacity
          key={provider}
          style={styles.shadow}
          className="flex-row items-center px-5 py-3.5 rounded-xl border border-border bg-background gap-3"
          activeOpacity={0.8}
          onPress={() => onPress(provider)}
        >
          <View className="w-7 h-7 items-center justify-center">
            <Ionicons name={icon} size={22} color={color} />
          </View>
          <Text className="body-md text-text-primary">{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
