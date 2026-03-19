import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");

const MIN_CM = 140;
const MAX_CM = 220;

const ticks = Array.from({ length: MAX_CM - MIN_CM + 1 }, (_, i) => MIN_CM + i);

export default function HeightSetupScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();
  const [unit, setUnit] = useState<"cm" | "ft">("cm");
  const [height, setHeight] = useState(175);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const cmToFtIn = (cm: number) => {
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${ft}'${inches}"`;
  };

  const displayHeight = unit === "cm" ? `${height} cm` : cmToFtIn(height);

  const handleContinue = async () => {
    await updateProfile({ height: height.toString(), heightUnit: unit });
    router.push("/setup/style");
  };

  return (
    <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.stepWrap}>
          <Text style={styles.stepNum}>STEP 3 OF 5</Text>
          <Text style={styles.stepTitle}>Body Measurements</Text>
        </View>
        <Pressable onPress={handleContinue}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: "60%" }]} />
      </View>
      <Text style={styles.progressPct}>60%</Text>

      <View style={styles.iconWrap}>
        <Ionicons name="resize" size={28} color={Colors.primary} />
      </View>

      <Text style={styles.title}>What is your height?</Text>
      <Text style={styles.subtitle}>This helps our AI suggest styles that best fit your body proportions and scale.</Text>

      <View style={styles.unitToggle}>
        <Pressable
          style={[styles.unitBtn, unit === "cm" && styles.unitBtnActive]}
          onPress={() => setUnit("cm")}
        >
          <Text style={[styles.unitText, unit === "cm" && styles.unitTextActive]}>Centimeters (cm)</Text>
        </Pressable>
        <Pressable
          style={[styles.unitBtn, unit === "ft" && styles.unitBtnActive]}
          onPress={() => setUnit("ft")}
        >
          <Text style={[styles.unitText, unit === "ft" && styles.unitTextActive]}>Feet & Inches (ft)</Text>
        </Pressable>
      </View>

      <Text style={styles.heightDisplay}>{displayHeight}</Text>

      <View style={styles.rulerWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: width / 2 - 2 }}
          onMomentumScrollEnd={(e) => {
            const offset = e.nativeEvent.contentOffset.x;
            const tickWidth = 12;
            const index = Math.round(offset / tickWidth);
            const newHeight = MIN_CM + Math.min(Math.max(index, 0), ticks.length - 1);
            setHeight(newHeight);
          }}
          scrollEventThrottle={16}
        >
          {ticks.map((tick) => (
            <View key={tick} style={styles.tickWrap}>
              <View style={[
                styles.tick,
                tick % 10 === 0 ? styles.tickMajor : tick % 5 === 0 ? styles.tickMed : styles.tickMinor,
                tick === height && styles.tickActive,
              ]} />
            </View>
          ))}
        </ScrollView>
        <View style={styles.indicator} />
      </View>

      <Text style={styles.rulerHint}>Swipe to adjust height</Text>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleContinue}
        >
          <Text style={styles.btnText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  stepWrap: { alignItems: "center" },
  stepNum: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.primary, letterSpacing: 0.5 },
  stepTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  skipText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.primary },
  progressBar: {
    height: 3, backgroundColor: Colors.border, marginHorizontal: 20, borderRadius: 2, marginBottom: 2,
  },
  progressFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  progressPct: {
    fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.primary,
    textAlign: "right", paddingRight: 20, marginBottom: 16,
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: 16, backgroundColor: Colors.surface,
    alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 12,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.text, textAlign: "center", marginBottom: 8 },
  subtitle: {
    fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary,
    textAlign: "center", lineHeight: 20, paddingHorizontal: 28, marginBottom: 24,
  },
  unitToggle: {
    flexDirection: "row", marginHorizontal: 20, backgroundColor: Colors.surface,
    borderRadius: 12, padding: 4, marginBottom: 28,
  },
  unitBtn: { flex: 1, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  unitBtnActive: { backgroundColor: Colors.card, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2 },
  unitText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  unitTextActive: { fontFamily: "Inter_600SemiBold", color: Colors.text },
  heightDisplay: {
    fontFamily: "Inter_700Bold", fontSize: 56, color: Colors.primary, textAlign: "center", marginBottom: 20,
  },
  rulerWrap: { height: 70, position: "relative", justifyContent: "flex-end" },
  tickWrap: { width: 12, alignItems: "center", justifyContent: "flex-end", height: 50 },
  tick: { width: 2, borderRadius: 1, backgroundColor: Colors.border },
  tickMinor: { height: 16 },
  tickMed: { height: 24 },
  tickMajor: { height: 36 },
  tickActive: { backgroundColor: Colors.primary, width: 3 },
  indicator: {
    position: "absolute", top: 0, left: "50%", marginLeft: -1.5,
    width: 3, height: 50, backgroundColor: Colors.primary, borderRadius: 2,
  },
  rulerHint: {
    fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textTertiary,
    textAlign: "center", marginTop: 8, marginBottom: 16,
  },
  footer: { paddingHorizontal: 20, paddingTop: 4 },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center" },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
});
