import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { SetupHeader } from "@/components/SetupHeader";
import { SetupFooter } from "@/components/SetupFooter";
import { SetupOptionList } from "@/components/SetupOptionList";
import { router } from "expo-router";

const languages = [
  { id: "en", label: "English", sublabel: "Default system language" },
  { id: "es", label: "Español", sublabel: "Spanish" },
  { id: "fr", label: "Français", sublabel: "French" },
  { id: "de", label: "Deutsch", sublabel: "German" },
  { id: "it", label: "Italiano", sublabel: "Italian" },
  { id: "pt", label: "Português", sublabel: "Portuguese" },
  { id: "ja", label: "日本語", sublabel: "Japanese" },
  { id: "zh", label: "中文", sublabel: "Chinese" },
  { id: "ar", label: "العربية", sublabel: "Arabic" },
  { id: "ko", label: "한국어", sublabel: "Korean" },
];

export default function LanguageSetupScreen() {
  const { updateSetupPreferences } = useAuth();
  const [selected, setSelected] = useState("en");

  const handleContinue = async () => {
    await updateSetupPreferences({ language: selected });
    router.push("/setup/gender");
  };

  return (
    <View style={styles.container}>
      <SetupHeader title="Language" step={1} totalSteps={5} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.subtitle}>
          Select your preferred language to customize your AI stylist experience.
        </Text>

        <SetupOptionList
          options={languages}
          selected={selected}
          onSelect={setSelected}
        />
      </ScrollView>

      <SetupFooter
        onContinue={handleContinue}
        hint="You can change this anytime in settings."
      />
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
