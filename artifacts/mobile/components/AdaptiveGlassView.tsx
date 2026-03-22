import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import React, { type ReactNode } from "react";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";

import Colors from "@/constants/colors";

type AdaptiveGlassViewProps = {
  children: ReactNode;
  style?: ViewStyle;
  isInteractive?: boolean;
  fallbackTint?: "systemMaterial" | "systemThinMaterial" | "systemUltraThinMaterial" | "systemThickMaterial";
  fallbackIntensity?: number;
};

export function AdaptiveGlassView({
  children,
  style,
  isInteractive,
  fallbackTint = "systemMaterial",
  fallbackIntensity = 80,
}: AdaptiveGlassViewProps) {
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView isInteractive={isInteractive} style={style}>
        {children}
      </GlassView>
    );
  }

  if (Platform.OS === "ios") {
    return (
      <BlurView
        tint={fallbackTint}
        intensity={fallbackIntensity}
        style={[{ overflow: "hidden" }, style]}
      >
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[fallbackStyles.solid, style]}>
      {children}
    </View>
  );
}

const fallbackStyles = StyleSheet.create({
  solid: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
