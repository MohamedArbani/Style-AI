import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { SetupHeader } from "@/components/SetupHeader";
import { SetupFooter } from "@/components/SetupFooter";
import { SetupOptionList } from "@/components/SetupOptionList";
import type { SetupOption } from "@/components/SetupOptionList";

const genders: SetupOption[] = [
  { id: "male", label: "Male", sublabel: "Masculine style curation", icon: "male" },
  { id: "female", label: "Female", sublabel: "Feminine style curation", icon: "female" },
  { id: "nonbinary", label: "Non-binary / Other", sublabel: "Unisex and fluid style curation", icon: "transgender" },
];

export default function GenderSetupScreen() {
  const { updateSetupPreferences } = useAuth();
  const [selected, setSelected] = useState("");

  const handleContinue = async () => {
    if (!selected) return;
    await updateSetupPreferences({ gender: selected });
    router.push("/setup/age");
  };

  return (
    <View style={styles.container}>
      <SetupHeader title="Gender" step={2} totalSteps={5} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Select your gender</Text>
        <Text style={styles.subtitle}>
          This helps our AI curate the best style recommendations and fit algorithms specifically for you.
        </Text>

        <SetupOptionList
          options={genders}
          selected={selected}
          onSelect={setSelected}
          showIcon
        />
      </ScrollView>

      <SetupFooter onContinue={handleContinue} disabled={!selected} />
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
