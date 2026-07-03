import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "@/types/learning";

interface LanguageState {
  selectedLanguage: Language | null;
  _hasHydrated: boolean;
  setSelectedLanguage: (language: Language) => void;
  clearSelectedLanguage: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLanguage: null,
      _hasHydrated: false,
      setSelectedLanguage: (language) => set({ selectedLanguage: language }),
      clearSelectedLanguage: () => set({ selectedLanguage: null }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
