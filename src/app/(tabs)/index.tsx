import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { usePostHog } from "posthog-react-native";

import { useLanguageStore } from "@/store/languageStore";
import { useProgressStore } from "@/store/progressStore";
import { LESSONS } from "@/data/lessons";
import { UNITS } from "@/data/units";
import { images } from "@/constants/images";

const GREETINGS: Record<string, string> = {
  es: "Hola",
  fr: "Bonjour",
  ja: "こんにちは",
  de: "Hallo",
  ko: "안녕하세요",
  zh: "你好",
};

type PlanItem = {
  id: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  completed: boolean;
};

export default function HomeScreen() {
  const { user } = useUser();
  const posthog = usePostHog();
  const { selectedLanguage, _hasHydrated: languageHydrated } = useLanguageStore();
  const { xp, dailyGoal, streak, completedLessonIds, _hasHydrated: progressHydrated } = useProgressStore();

  if (!languageHydrated || !progressHydrated) {
    return <View style={styles.safe} />;
  }

  const firstName = user?.firstName ?? "Friend";
  const greeting = selectedLanguage
    ? (GREETINGS[selectedLanguage.code] ?? "Hello")
    : "Hello";

  const currentUnit = UNITS.find(
    (u) => u.languageCode === selectedLanguage?.code
  );
  const firstLesson = currentUnit
    ? LESSONS.find((l) => l.id === currentUnit.lessonIds[0])
    : null;
  const isFirstLessonDone = completedLessonIds.includes(firstLesson?.id ?? "");

  const progressPercent = Math.min(Math.round((xp / dailyGoal) * 100), 100);

  const todaysPlan: PlanItem[] = [
    {
      id: "lesson",
      iconName: "book-outline",
      iconBg: "#E8F1FF",
      iconColor: "#4D8BFF",
      title: "Lesson",
      subtitle: firstLesson?.title ?? "Greetings",
      completed: isFirstLessonDone,
    },
    {
      id: "ai-conversation",
      iconName: "headset-outline",
      iconBg: "#EDE8FF",
      iconColor: "#6C4EF5",
      title: "AI Conversation",
      subtitle: "Talk about your day",
      completed: false,
    },
    {
      id: "new-words",
      iconName: "chatbubble-ellipses-outline",
      iconBg: "#FFE8E8",
      iconColor: "#FF4D4F",
      title: "New words",
      subtitle: `${firstLesson?.vocabulary.length ?? 5} words`,
      completed: false,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ───────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <View className="flex-row items-center gap-2.5">
            {selectedLanguage ? (
              <Image
                source={{ uri: selectedLanguage.flag }}
                className="w-9 h-9 rounded-full bg-surface"
                resizeMode="cover"
              />
            ) : (
              <View className="w-9 h-9 rounded-full bg-surface items-center justify-center">
                <Text className="text-xl">🌍</Text>
              </View>
            )}
            <Text className="font-poppins-semibold text-base text-text-primary">
              {greeting}, {firstName}! 👋
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Image
                source={images.streakFire}
                className="w-[22px] h-[22px]"
                resizeMode="contain"
              />
              <Text className="font-poppins-bold text-base text-streak">
                {streak}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} className="p-0.5">
              <Ionicons name="notifications-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Daily Goal Card ───────────────────────────── */}
        <View className="mx-5 mb-4 rounded-[20px] bg-[#FFF5E3] overflow-hidden">
          <View className="flex-row items-center pl-4 py-4">
            <View className="flex-1 pr-2">
              <Text className="font-poppins text-xs text-text-secondary mb-1">
                Daily goal
              </Text>
              <View className="flex-row items-end mb-2.5">
                <Text className="font-poppins-bold text-[34px] leading-[40px] text-text-primary">
                  {xp}
                </Text>
                <Text className="font-poppins text-sm text-text-secondary mb-[5px]">
                  {" "}/ {dailyGoal} XP
                </Text>
              </View>
              <View className="h-2 bg-border rounded overflow-hidden">
                {/* width is runtime-computed — inline style required */}
                <View
                  className="h-full bg-streak rounded"
                  style={{ width: `${progressPercent}%` }}
                />
              </View>
            </View>
            <Image
              source={images.treasure}
              className="w-[88px] h-[88px]"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── Continue Learning Banner ──────────────────── */}
        {selectedLanguage && (
          <View className="mx-5 mb-6 rounded-[20px] bg-[#5235D5] overflow-hidden">
            <View className="flex-row items-stretch">
              <View className="flex-1 pl-4 pt-3.5 pb-4 pr-1 justify-between">
                <Text className="font-poppins text-xs text-white/70 mb-1">
                  Continue learning
                </Text>
                <View>
                  <Text className="font-poppins-bold text-[26px] leading-8 text-white">
                    {selectedLanguage.name}
                  </Text>
                  <Text className="font-poppins text-[13px] text-white/75 mt-0.5 mb-3.5">
                    A1 · Unit {currentUnit?.order ?? 1}
                  </Text>
                  <TouchableOpacity
                    className="self-start bg-white rounded-full px-[22px] py-[9px]"
                    activeOpacity={0.85}
                    onPress={() =>
                      posthog.capture('continue_learning_tapped', {
                        language_code: selectedLanguage?.code,
                        language_name: selectedLanguage?.name,
                      })
                    }
                  >
                    <Text className="font-poppins-semibold text-sm text-[#5235D5]">
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Image
                source={images.palace}
                className="w-[130px] h-[160px]"
                resizeMode="cover"
              />
            </View>
          </View>
        )}

        {/* ── Today's Plan Header ───────────────────────── */}
        <View className="flex-row items-center justify-between px-5 mb-3">
          <Text className="heading-4 text-text-primary">{"Today's plan"}</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="font-poppins-medium text-sm text-lingua-purple">
              View all
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Plan Items ───────────────────────────────── */}
        {/* shadow requires StyleSheet — all other styles use className */}
        <View
          className="mx-5 mb-4 bg-white rounded-2xl border border-[#F0F1F5] px-1"
          style={styles.planCardShadow}
        >
          {todaysPlan.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  posthog.capture('daily_plan_item_tapped', {
                    item_id: item.id,
                    item_title: item.title,
                    completed: item.completed,
                  })
                }
              >
              <View className="flex-row items-center px-3 py-3.5 gap-3">
                {/* backgroundColor is runtime-computed — inline style required */}
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center"
                  style={{ backgroundColor: item.iconBg }}
                >
                  <Ionicons name={item.iconName} size={20} color={item.iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="font-poppins-semibold text-sm text-text-primary leading-5">
                    {item.title}
                  </Text>
                  <Text className="font-poppins text-xs text-text-secondary leading-[18px]">
                    {item.subtitle}
                  </Text>
                </View>
                {item.completed ? (
                  <View className="w-7 h-7 rounded-full bg-info items-center justify-center">
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                ) : (
                  <View className="w-7 h-7 rounded-full border-2 border-border" />
                )}
              </View>
              </TouchableOpacity>
              {index < todaysPlan.length - 1 && (
                <View className="h-px bg-[#F3F4F6] ml-[68px] mr-3" />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // SafeAreaView — className not supported
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // ScrollView contentContainerStyle — not a className prop
  scroll: {
    paddingBottom: 40,
  },
  // Shadow — platform-specific, must use StyleSheet
  planCardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});
