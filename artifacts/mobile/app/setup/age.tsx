import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const ranges = [
  { id: "under18", label: "Under 18", sublabel: "Gen Z & Students" },
  { id: "18-24", label: "18 - 24", sublabel: "Early Career & Trends" },
  { id: "25-34", label: "25 - 34", sublabel: "Young Professional" },
  { id: "35-44", label: "35 - 44", sublabel: "Established Style" },
  { id: "45-54", label: "45 - 54", sublabel: "Refined Classics" },
  { id: "55+", label: "55+", sublabel: "Timeless Elegance" },
];

export default function AgeSetupScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();
  const [selected, setSelected] = useState("18-24");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleContinue = async () => {
    await updateProfile({ ageRange: selected });
    router.push("/setup/height");
  };

  return (
    <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.stepWrap}>
          <Text style={styles.stepNum}>STEP 3 OF 5</Text>
          <Text style={styles.stepTitle}>Personalizing your profile</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: "60%" }]} />
      </View>

      <View style={styles.iconWrap}>
        <Ionicons name="calendar-outline" size={28} color={Colors.primary} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What&apos;s your age range?</Text>
        <Text style={styles.subtitle}>This helps our AI understand your style maturity and curate a wardrobe that evolves with you.</Text>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.options}>
          {ranges.map(r => (
            <Pressable
              key={r.id}
              style={[styles.option, selected === r.id && styles.optionSelected]}
              onPress={() => setSelected(r.id)}
            >
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, selected === r.id && styles.optionLabelSelected]}>{r.label}</Text>
                <Text style={styles.optionSub}>{r.sublabel}</Text>
              </View>
              <View style={[styles.radio, selected === r.id && styles.radioSelected]}>
                {selected === r.id && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>

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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  stepWrap: { flex: 1, alignItems: "center" },
  stepNum: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.primary, letterSpacing: 0.5 },
  stepTitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  progressBar: { height: 3, backgroundColor: Colors.border, marginHorizontal: 20, borderRadius: 2, marginBottom: 16 },
  progressFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  iconWrap: {
    width: 60, height: 60, borderRadius: 16, backgroundColor: Colors.surface,
    alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16,
  },
  scroll: { flex: 1 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.text, marginBottom: 10, paddingHorizontal: 20 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginBottom: 24, paddingHorizontal: 20 },
  options: { gap: 10 },
  option: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, padding: 16,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  optionText: { gap: 2 },
  optionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  optionLabelSelected: { color: Colors.primary },
  optionSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  footer: { paddingHorizontal: 20, paddingTop: 8 },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center" },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
});
