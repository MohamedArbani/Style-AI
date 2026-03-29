import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

type SetupFooterProps = {
  onContinue: () => void;
  label?: string;
  disabled?: boolean;
  hint?: string;
  onSkip?: () => void;
};

export function SetupFooter({
  onContinue,
  label = "Continue",
  disabled = false,
  hint,
  onSkip,
}: SetupFooterProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.footer, { paddingBottom: bottomInset + 8 }]}>
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          disabled && styles.btnDisabled,
          { opacity: pressed && !disabled ? 0.85 : 1 },
        ]}
        onPress={onContinue}
        disabled={disabled}
      >
        <Text style={styles.btnText}>{label}</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </Pressable>

      {onSkip ? (
        <Pressable onPress={onSkip} hitSlop={8}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      ) : null}

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 8,
    alignItems: "center",
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    borderCurve: "continuous",
  },
  btnDisabled: {
    backgroundColor: Colors.border,
  },
  btnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.white,
  },
  skipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: "center",
  },
});
