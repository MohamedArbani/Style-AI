import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import React, { type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, type ViewStyle } from "react-native";

import Colors from "@/constants/colors";

type GlassButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function GlassButton({ children, onPress, disabled, style }: GlassButtonProps) {
  if (isLiquidGlassAvailable()) {
    return (
      <GlassView isInteractive style={[glassStyles.base, style]}>
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={({ pressed }) => [
            glassStyles.pressable,
            { opacity: pressed ? 0.7 : disabled ? 0.5 : 1 },
          ]}
        >
          {children}
        </Pressable>
      </GlassView>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        fallbackStyles.button,
        style,
        { opacity: pressed ? 0.8 : disabled ? 0.5 : 1 },
      ]}
    >
      {children}
    </Pressable>
  );
}

const glassStyles = StyleSheet.create({
  base: {
    borderRadius: 50,
  },
  pressable: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

const fallbackStyles = StyleSheet.create({
  button: {
    borderRadius: 50,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Platform.OS === "ios" ? "rgba(255,255,255,0.86)" : Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
