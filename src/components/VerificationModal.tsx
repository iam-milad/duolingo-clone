import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/constants/theme/colors";

type Props = {
  visible: boolean;
  email: string;
  onClose: () => void;
  onCodeComplete: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
};

export function VerificationModal({
  visible,
  email,
  onClose,
  onCodeComplete,
  onResend,
}: Props) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (visible) {
      setCode(["", "", "", "", "", ""]);
      setError(null);
      setLoading(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 400);
    }
  }, [visible]);

  const submitCode = async (fullCode: string) => {
    setLoading(true);
    setError(null);
    try {
      await onCodeComplete(fullCode);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        "Invalid code. Please try again.";
      setError(message);
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5 && newCode.every((d) => d !== "")) {
      submitCode(newCode.join(""));
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!onResend) return;
    setError(null);
    try {
      await onResend();
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || "Failed to resend. Try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-background rounded-t-3xl px-6 pb-12 pt-3 items-center">
          <View className="w-10 h-1 bg-border rounded mb-4" />

          <Text className="heading-2 text-text-primary text-center mt-2">
            Check your email!
          </Text>
          <View className="mt-2">
            <Text className="body-md text-text-secondary text-center">
              We sent a 6-digit code to{"\n"}
              <Text className="body-md text-text-primary">
                {email || "your email"}
              </Text>
            </Text>
          </View>

          {/* OTP inputs */}
          <View className="flex-row gap-2.5 mt-8">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!loading}
                style={[
                  styles.codeBox,
                  digit ? styles.codeBoxFilled : undefined,
                  error ? styles.codeBoxError : undefined,
                ]}
                textAlign="center"
              />
            ))}
          </View>

          {/* Error or loading */}
          <View className="h-8 justify-center mt-3">
            {loading ? (
              <ActivityIndicator color={colors.brand.purple} />
            ) : error ? (
              <Text className="body-sm text-error text-center">{error}</Text>
            ) : null}
          </View>

          <TouchableOpacity className="mt-2 mb-2" onPress={handleResend} disabled={loading}>
            <Text className="body-md text-lingua-purple text-center">
              Didn't receive the code? Resend
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  codeBox: {
    width: 46,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  codeBoxFilled: {
    borderColor: colors.brand.purple,
    backgroundColor: colors.background,
  },
  codeBoxError: {
    borderColor: colors.error,
  },
});
