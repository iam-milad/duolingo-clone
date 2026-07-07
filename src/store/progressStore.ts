import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ProgressState {
  xp: number;
  dailyGoal: number;
  streak: number;
  completedLessonIds: string[];
  _hasHydrated: boolean;
  addXp: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      xp: 0,
      dailyGoal: 20,
      streak: 0,
      completedLessonIds: [],
      _hasHydrated: false,
      addXp: (amount) =>
        set((s) => ({ xp: Math.min(s.xp + amount, s.dailyGoal) })),
      completeLesson: (lessonId) =>
        set((s) => ({
          completedLessonIds: s.completedLessonIds.includes(lessonId)
            ? s.completedLessonIds
            : [...s.completedLessonIds, lessonId],
        })),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "progress-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
