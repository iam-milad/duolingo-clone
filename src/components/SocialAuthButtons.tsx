import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SOCIAL_BUTTONS = [
  { icon: "logo-google" as const, color: "#4285F4", label: "Continue with Google" },
  { icon: "logo-facebook" as const, color: "#1877F2", label: "Continue with Facebook" },
  { icon: "logo-apple" as const, color: "#000000", label: "Continue with Apple" },
];

export function SocialAuthButtons() {
  return (
    <View className="gap-3">
      {SOCIAL_BUTTONS.map(({ icon, color, label }) => (
        <SocialButton
          key={label}
          icon={<Ionicons name={icon} size={22} color={color} />}
          label={label}
        />
      ))}
    </View>
  );
}

function SocialButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <TouchableOpacity
      style={styles.shadow}
      className="flex-row items-center px-5 py-3.5 rounded-xl border border-border bg-background gap-3"
      activeOpacity={0.8}
    >
      <View className="w-7 h-7 items-center justify-center">{icon}</View>
      <Text className="body-md text-text-primary">{label}</Text>
    </TouchableOpacity>
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
