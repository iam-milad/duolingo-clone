import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Text className="heading-1 text-center color-lingua-deep-purple">
        Lingua
      </Text>
      <Link href="/onboarding" className="body-lg text-lingua-purple">
        Go to onboarding
      </Link>
    </View>
  );
}
