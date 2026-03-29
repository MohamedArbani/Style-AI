import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { RulerPicker } from "react-native-ruler-picker";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { SetupHeader } from "@/components/SetupHeader";
import { SetupFooter } from "@/components/SetupFooter";

const MIN_CM = 140;
const MAX_CM = 220;

export default function HeightSetupScreen() {
  const { updateSetupPreferences } = useAuth();
  const { width } = useWindowDimensions();
  const [unit, setUnit] = useState<"cm" | "ft">("cm");
  const [height, setHeight] = useState(175);

  const cmToFtIn = (cm: number) => {
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${ft}'${inches}"`;
  };

  const displayHeight = unit === "cm" ? `${height} cm` : cmToFtIn(height);

  const handleContinue = async () => {
    await updateSetupPreferences({ height: height.toString(), heightUnit: unit });
    router.push("/setup/style");
  };

  return (
    <View style={styles.container}>
      <SetupHeader
        title="Height"
        step={4}
        totalSteps={5}
      />

      <View style={styles.content}>
        <Text style={styles.title}>What is your height?</Text>
        <Text style={styles.subtitle}>
          This helps our AI suggest styles that best fit your body proportions and scale.
        </Text>

        <View style={styles.unitToggle}>
          <Pressable
            style={[styles.unitBtn, unit === "cm" && styles.unitBtnActive]}
            onPress={() => setUnit("cm")}
          >
            <Text style={[styles.unitText, unit === "cm" && styles.unitTextActive]}>
              Centimeters (cm)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.unitBtn, unit === "ft" && styles.unitBtnActive]}
            onPress={() => setUnit("ft")}
          >
            <Text style={[styles.unitText, unit === "ft" && styles.unitTextActive]}>
              Feet & Inches (ft)
            </Text>
          </Pressable>
        </View>

        <Text style={styles.heightDisplay}>{displayHeight}</Text>

        <View style={styles.rulerWrap}>
          <RulerPicker
            width={width}
            height={52}
            min={MIN_CM}
            max={MAX_CM}
            step={1}
            fractionDigits={0}
            initialValue={height}
            unit=""
            indicatorHeight={52}
            indicatorColor={Colors.primary}
            stepWidth={2}
            gapBetweenSteps={10}
            shortStepHeight={16}
            longStepHeight={36}
            shortStepColor={Colors.border}
            longStepColor={"rgba(27, 44, 193, 0.14)"}
            decelerationRate="fast"
            valueTextStyle={styles.hiddenValueText}
            unitTextStyle={styles.hiddenUnitText}
            onValueChange={(value) => {
              setHeight(Number(value));
            }}
            onValueChangeEnd={(value) => {
              setHeight(Number(value));
            }}
          />
        </View>

        <Text style={styles.rulerHint}>Swipe to adjust height</Text>
      </View>

      <SetupFooter onContinue={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingTop: 24 },
  skipText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.primary },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  unitToggle: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    borderCurve: "continuous",
  },
  unitBtn: {
    flex: 1,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderCurve: "continuous",
  },
  unitBtnActive: {
    backgroundColor: Colors.card,
    boxShadow: "0 2px 4px rgba(27, 44, 193, 0.12)",
  },
  unitText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  unitTextActive: { fontFamily: "Inter_600SemiBold", color: Colors.text },
  heightDisplay: {
    fontFamily: "Inter_700Bold",
    fontSize: 56,
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 16,
    fontVariant: ["tabular-nums"],
  },
  rulerWrap: {
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 6,
  },
  rulerHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: "center",
    marginTop: 8,
  },
  hiddenValueText: {
    color: "transparent",
    fontSize: 1,
    fontWeight: "800",
  },
  hiddenUnitText: {
    color: "transparent",
    fontSize: 1,
    fontWeight: "400",
  },
});
