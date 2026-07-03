import { useEffect, type ComponentProps } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const CIRCLE_SIZE = 52;
const TAB_BAR_HEIGHT = 64;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

const TABS: Array<{
  name: string;
  label: string;
  activeIcon: IoniconsName;
  inactiveIcon: IoniconsName;
}> = [
  { name: 'index', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { name: 'learn', label: 'Learn', activeIcon: 'book', inactiveIcon: 'book-outline' },
  { name: 'ai-teacher', label: 'AI Teacher', activeIcon: 'hardware-chip', inactiveIcon: 'hardware-chip-outline' },
  { name: 'chat', label: 'Chat', activeIcon: 'chatbubble', inactiveIcon: 'chatbubble-outline' },
  { name: 'profile', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

const TAB_WIDTH = SCREEN_WIDTH / TABS.length;
const CIRCLE_LEFT_OFFSET = (TAB_WIDTH - CIRCLE_SIZE) / 2;

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(state.index);

  useEffect(() => {
    progress.value = withTiming(state.index, { duration: 220, easing: Easing.out(Easing.quad) });
  }, [state.index]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * TAB_WIDTH + CIRCLE_LEFT_OFFSET },
    ],
  }));

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom - 25, 0) }]}>
      <Animated.View style={[styles.circle, circleStyle]} />

      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const tab = TABS[index];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? tab.activeIcon : tab.inactiveIcon}
                size={22}
                color={isFocused ? '#FFFFFF' : '#9CA3AF'}
              />
              {!isFocused && (
                <Text style={styles.label} numberOfLines={1}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  circle: {
    position: 'absolute',
    top: (TAB_BAR_HEIGHT - CIRCLE_SIZE) / 2,
    left: 0,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#6C4EF5',
  },
  tabsRow: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 14,
    color: '#9CA3AF',
  },
});

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="ai-teacher" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
