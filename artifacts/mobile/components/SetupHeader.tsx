import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

type SetupHeaderProps = {
  title: string;
  step: number;
  totalSteps: number;
  showBack?: boolean;
  rightAction?: React.ReactNode;
};

export function SetupHeader({
  title,
  step,
  totalSteps,
  showBack = true,
  rightAction,
}: SetupHeaderProps) {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(step / totalSteps, {
      damping: 20,
      stiffness: 90,
      mass: 0.8,
    });
  }, [step, totalSteps, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={[styles.wrapper, { paddingTop: topInset }]}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {rightAction ?? <View style={styles.placeholder} />}
      </View>

      <View style={styles.trackBar}>
        <Animated.View style={[styles.fillBar, progressStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
  },
  placeholder: {
    width: 24,
  },
  trackBar: {
    height: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: "hidden",
  },
  fillBar: {
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});
