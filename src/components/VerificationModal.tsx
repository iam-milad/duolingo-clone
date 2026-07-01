import { useEffect, useRef, useState } from "react";
import {
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
  onVerified: () => void;
};

export function VerificationModal({ visible, email, onClose, onVerified }: Props) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (visible) {
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 400);
    }
  }, [visible]);

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.join("").length === 6) {
      setTimeout(() => onVerified(), 300);
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
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-background rounded-t-3xl px-6 pb-12 pt-3 items-center">
          {/* Handle */}
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
          <View className="flex-row gap-2.5 mt-8 mb-2">
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
                style={[styles.codeBox, digit ? styles.codeBoxFilled : undefined]}
                textAlign="center"
              />
            ))}
          </View>

          <TouchableOpacity className="mt-5 mb-2">
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
  // TextInput requires StyleSheet for font, size, and dynamic border color
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
});
