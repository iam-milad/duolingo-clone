import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useLanguageStore } from '@/store/languageStore';
import { useProgressStore } from '@/store/progressStore';
import { LESSONS } from '@/data/lessons';
import { UNITS } from '@/data/units';
import { images } from '@/constants/images';
import type { Lesson } from '@/types/learning';

type LessonStatus = 'completed' | 'in-progress' | 'available';
type ActiveTab = 'lessons' | 'practice';

const LESSON_IMAGES: Record<string, string> = {
  'es-lesson-1': 'https://picsum.photos/seed/greetings/120/120',
  'es-lesson-2': 'https://picsum.photos/seed/introductions/120/120',
  'es-lesson-3': 'https://picsum.photos/seed/numbers/120/120',
  'es-lesson-4': 'https://picsum.photos/seed/colors/120/120',
  'es-lesson-5': 'https://picsum.photos/seed/restaurant/120/120',
  'es-lesson-6': 'https://picsum.photos/seed/family/120/120',
  'fr-lesson-1': 'https://picsum.photos/seed/bonjour/120/120',
  'fr-lesson-2': 'https://picsum.photos/seed/french-intro/120/120',
  'fr-lesson-3': 'https://picsum.photos/seed/french-numbers/120/120',
  'fr-lesson-4': 'https://picsum.photos/seed/french-colors/120/120',
  'fr-lesson-5': 'https://picsum.photos/seed/cafe/120/120',
  'ja-lesson-1': 'https://picsum.photos/seed/japanese-greet/120/120',
  'ja-lesson-2': 'https://picsum.photos/seed/japan-intro/120/120',
  'ja-lesson-3': 'https://picsum.photos/seed/japan-numbers/120/120',
  'ja-lesson-4': 'https://picsum.photos/seed/japan-verbs/120/120',
  'ja-lesson-5': 'https://picsum.photos/seed/japan-food/120/120',
  'de-lesson-1': 'https://picsum.photos/seed/german-hello/120/120',
  'de-lesson-2': 'https://picsum.photos/seed/german-intro/120/120',
  'de-lesson-3': 'https://picsum.photos/seed/german-numbers/120/120',
  'de-lesson-4': 'https://picsum.photos/seed/german-colors/120/120',
  'de-lesson-5': 'https://picsum.photos/seed/german-cafe/120/120',
};

function getLessonStatus(
  lessonId: string,
  index: number,
  lessons: Lesson[],
  completedLessonIds: string[],
): LessonStatus {
  if (completedLessonIds.includes(lessonId)) return 'completed';
  const firstUncompleted = lessons.findIndex(
    (l) => !completedLessonIds.includes(l.id),
  );
  if (index === firstUncompleted) return 'in-progress';
  return 'available';
}

export default function LearnScreen() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('lessons');
  const router = useRouter();
  const { selectedLanguage, _hasHydrated: languageHydrated } = useLanguageStore();
  const { completedLessonIds, _hasHydrated: progressHydrated } = useProgressStore();

  if (!languageHydrated || !progressHydrated) {
    return <View style={styles.safe} />;
  }

  const unit = UNITS.find((u) => u.languageCode === selectedLanguage?.code);
  const lessons: Lesson[] = unit
    ? (unit.lessonIds
        .map((id) => LESSONS.find((l) => l.id === id))
        .filter(Boolean) as Lesson[])
    : [];

  const completedCount = lessons.filter((l) =>
    completedLessonIds.includes(l.id),
  ).length;

  if (!selectedLanguage || !unit) {
    return (
      <SafeAreaView style={styles.safe}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📚</Text>
          <Text className="heading-3 text-text-primary text-center mb-2">
            No language selected
          </Text>
          <Text className="body-md text-text-secondary text-center">
            Go to the Home screen and pick a language to start learning.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Unit Hero Header ─────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.illustrationWrap}>
            <Image
              source={images.palace}
              style={styles.palaceImg}
              resizeMode="contain"
            />
            <Image
              source={images.mascotWelcome}
              style={styles.mascotImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <View className="flex-row border-b border-border bg-background">
          {(['lessons', 'practice'] as ActiveTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
              className="flex-1 items-center py-3.5"
            >
              <Text
                className={
                  activeTab === tab
                    ? 'font-poppins-semibold text-sm text-lingua-purple'
                    : 'font-poppins text-sm text-text-secondary'
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && (
                <View
                  className="absolute bottom-0 left-6 right-6 h-[2.5px] bg-lingua-purple rounded-full"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Content ──────────────────────────────────────── */}
        {activeTab === 'lessons' ? (
          <View className="px-5 pt-4 gap-3">
            {lessons.map((lesson, index) => {
              const status = getLessonStatus(
                lesson.id,
                index,
                lessons,
                completedLessonIds,
              );
              const imageUrl =
                LESSON_IMAGES[lesson.id] ??
                `https://picsum.photos/seed/${lesson.id}/120/120`;

              return (
                <TouchableOpacity
                  key={lesson.id}
                  activeOpacity={0.75}
                  style={styles.cardShadow}
                  onPress={() => router.push(`/lesson/${lesson.id}`)}
                >
                  <View className="bg-white rounded-2xl border border-[#F0F1F5] px-4 py-4">
                    <View className="flex-row items-center gap-3">
                      {/* Left: text */}
                      <View className="flex-1">
                        <Text className="font-poppins text-xs text-text-secondary mb-0.5">
                          Lesson {index + 1}
                        </Text>
                        <Text className="font-poppins-semibold text-[15px] text-text-primary leading-5">
                          {lesson.title}
                        </Text>
                        <Text className="font-poppins text-xs text-text-secondary mt-0.5">
                          {lesson.activities.length + lesson.vocabulary.length} activities
                        </Text>
                      </View>

                      {/* Right: status */}
                      {status === 'completed' && (
                        <View className="w-11 h-11 rounded-full bg-success items-center justify-center">
                          <Ionicons name="checkmark" size={22} color="#fff" />
                        </View>
                      )}

                      {status === 'in-progress' && (
                        <View style={styles.thumbWrap}>
                          <Image
                            source={{ uri: imageUrl }}
                            style={styles.thumbImg}
                            resizeMode="cover"
                          />
                          <View style={styles.thumbRing} />
                        </View>
                      )}

                      {status === 'available' && (
                        <View className="w-11 h-11 rounded-full bg-surface items-center justify-center">
                          <Ionicons name="lock-closed" size={18} color="#9CA3AF" />
                        </View>
                      )}
                    </View>

                    {/* In-progress badge */}
                    {status === 'in-progress' && (
                      <View className="mt-3 self-start bg-[#EDE8FF] px-3 py-1 rounded-full">
                        <Text className="font-poppins-semibold text-xs text-lingua-purple">
                          In progress
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <Text className="text-5xl mb-4">🎯</Text>
            <Text className="heading-3 text-text-primary text-center mb-2">
              Practice Mode
            </Text>
            <Text className="body-md text-text-secondary text-center">
              Review and reinforce what you&apos;ve learned. Coming soon!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    height: 240,
    overflow: 'hidden',
  },
  illustrationWrap: {
    flex: 1,
    position: 'relative',
  },
  palaceImg: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    width: 200,
    height: 200,
  },
  mascotImg: {
    position: 'absolute',
    bottom: 0,
    left: 30,
    width: 150,
    height: 200,
    zIndex: 1,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  thumbRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6C4EF5',
  },
});
