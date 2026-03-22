import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import React, { type ReactNode } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

import Colors from "@/constants/colors";

type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function GlassCard({ children, style }: GlassCardProps) {
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView style={[glassStyles.card, style]}>
        {children}
      </GlassView>
    );
  }

  if (Platform.OS === "ios") {
    return (
      <BlurView
        tint="systemMaterial"
        intensity={60}
        style={[glassStyles.card, { overflow: "hidden" }, style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[fallbackStyles.card, style]}>
      {children}
    </View>
  );
}

const glassStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
  },
});

const fallbackStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
