import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { LANGUAGES } from "@/data/languages";
import { images } from "@/constants/images";
import { Language } from "@/types/learning";

export default function LanguageSelection() {
  const router = useRouter();
  const [selected, setSelected] = useState<Language | null>(null);
  const [search, setSearch] = useState("");

  const filtered = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View className="flex-row items-center justify-center px-5 pt-2 pb-4 relative">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-5"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#001328" />
        </TouchableOpacity>
        <Text className="heading-4 text-text-primary">Choose a language</Text>
      </View>

      {/* Search */}
      <View className="px-5 mb-5">
        <View className="flex-row items-center bg-surface border border-border rounded-2xl px-4 h-12 gap-3">
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search languages"
            placeholderTextColor="#6b7280"
            className="flex-1 body-md text-text-primary"
          />
        </View>
      </View>

      {/* Popular label */}
      <Text className="heading-4 text-text-primary px-5 mb-3">Popular</Text>

      {/* Language list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-px bg-border mx-5" />}
        renderItem={({ item }) => {
          const isSelected = selected?.code === item.code;
          return (
            <TouchableOpacity
              onPress={() => setSelected(item)}
              activeOpacity={0.7}
              className={`flex-row items-center px-5 py-4 mx-5 my-1 rounded-2xl ${
                isSelected ? "border-2 border-lingua-purple bg-white" : ""
              }`}
            >
              {/* Flag */}
              <Image
                source={{ uri: item.flag }}
                style={styles.flag}
                resizeMode="cover"
              />

              {/* Name & learners */}
              <View className="flex-1 ml-4">
                <Text className="body-lg font-poppins-semibold text-text-primary">
                  {item.name}
                </Text>
                <Text className="body-sm text-text-secondary">
                  {item.learners} learners
                </Text>
              </View>

              {/* Right indicator */}
              {isSelected ? (
                <View className="w-7 h-7 rounded-full bg-lingua-purple items-center justify-center">
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#6b7280" />
              )}
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <View className="h-32" />
        }
      />

      {/* Confirm button + earth image */}
      <View style={styles.footer} pointerEvents="box-none">
        <View className="px-5 pb-4">
          <TouchableOpacity
            onPress={() => {
              if (selected) router.back();
            }}
            activeOpacity={selected ? 0.8 : 1}
            className={`h-14 rounded-2xl items-center justify-center ${
              selected ? "bg-lingua-purple" : "bg-surface"
            }`}
          >
            <Text
              className={`heading-4 ${
                selected ? "text-white" : "text-text-secondary"
              }`}
            >
              {selected ? `Start learning ${selected.name}` : "Select a language"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Earth illustration */}
        <Image
          source={images.earth}
          style={styles.earth}
          resizeMode="cover"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  listContent: {
    paddingBottom: 8,
  },
  flag: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f6f7fb",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  earth: {
    width: "100%",
    height: 140,
  },
});
