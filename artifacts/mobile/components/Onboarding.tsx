import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { imagePairs } from "./image-pairs";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import Colors from "@/constants/colors";

type OnboardingProps = {
  width: number;
  height: number;
};

export const Onboarding = ({ width, height }: OnboardingProps) => {
  return (
    <View style={[styles.card, { width, height }]}>
      <BeforeAfterSlider imagePairs={imagePairs} width={width} height={height} />

      {/* ORIGINAL label */}
      <View style={[styles.label, styles.labelLeft]}>
        <Text style={styles.labelText}>ORIGINAL</Text>
      </View>

      {/* AI RESULT label */}
      <View style={[styles.label, styles.labelRight]}>
        <Text style={[styles.labelText, styles.labelTextAI]}>AI RESULT</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  label: {
    position: "absolute",
    top: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  labelLeft: {
    left: 16,
    backgroundColor: Colors.white,
  },
  labelRight: {
    right: 16,
    backgroundColor: Colors.primary,
  },
  labelText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.5,
    color: Colors.text,
  },
  labelTextAI: {
    color: Colors.white,
  },
});