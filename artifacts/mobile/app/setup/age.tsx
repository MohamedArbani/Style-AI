import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { SetupHeader } from "@/components/SetupHeader";
import { SetupFooter } from "@/components/SetupFooter";
import { SetupOptionList } from "@/components/SetupOptionList";

const ranges = [
  { id: "under18", label: "Under 18", sublabel: "Gen Z & Students" },
  { id: "18-24", label: "18 – 24", sublabel: "Early Career & Trends" },
  { id: "25-34", label: "25 – 34", sublabel: "Young Professional" },
  { id: "35-44", label: "35 – 44", sublabel: "Established Style" },
  { id: "45-54", label: "45 – 54", sublabel: "Refined Classics" },
  { id: "55+", label: "55+", sublabel: "Timeless Elegance" },
];

export default function AgeSetupScreen() {
  const { updateSetupPreferences } = useAuth();
  const [selected, setSelected] = useState("18-24");

  const handleContinue = async () => {
    await updateSetupPreferences({ ageRange: selected });
    router.push("/setup/height");
  };

  return (
    <View style={styles.container}>
      <SetupHeader title="Age Range" step={3} totalSteps={5} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What&apos;s your age range?</Text>
        <Text style={styles.subtitle}>
          This helps our AI understand your style maturity and curate a wardrobe that evolves with you.
        </Text>

        <SetupOptionList
          options={ranges}
          selected={selected}
          onSelect={setSelected}
        />
      </ScrollView>

      <SetupFooter onContinue={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 24,
  },
});
