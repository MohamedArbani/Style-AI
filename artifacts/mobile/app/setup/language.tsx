import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const languages = [
  { code: "en", label: "English", sublabel: "Default system language" },
  { code: "es", label: "Español", sublabel: "Spanish" },
  { code: "fr", label: "Français", sublabel: "French" },
  { code: "de", label: "Deutsch", sublabel: "German" },
  { code: "it", label: "Italiano", sublabel: "Italian" },
  { code: "pt", label: "Português", sublabel: "Portuguese" },
  { code: "ja", label: "日本語", sublabel: "Japanese" },
  { code: "zh", label: "中文", sublabel: "Chinese" },
  { code: "ar", label: "العربية", sublabel: "Arabic" },
  { code: "ko", label: "한국어", sublabel: "Korean" },
];

export default function LanguageSetupScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();
  const [selected, setSelected] = useState("en");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleContinue = async () => {
    await updateProfile({ language: selected });
    router.push("/setup/gender");
  };

  return (
    <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.stepLabel}>STEP 1 OF 5</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: "20%" }]} />
      </View>

      <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.iconWrap}>
        <Ionicons name="language" size={32} color={Colors.primary} />
      </Animated.View>

      <Text style={styles.title}>Choose your language</Text>
      <Text style={styles.subtitle}>Select your preferred language to customize your AI stylist experience.</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {languages.map(lang => (
          <Pressable
            key={lang.code}
            style={[styles.option, selected === lang.code && styles.optionSelected]}
            onPress={() => setSelected(lang.code)}
          >
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, selected === lang.code && styles.optionLabelSelected]}>{lang.label}</Text>
              <Text style={styles.optionSub}>{lang.sublabel}</Text>
            </View>
            <View style={[styles.radio, selected === lang.code && styles.radioSelected]}>
              {selected === lang.code && <View style={styles.radioDot} />}
            </View>
          </Pressable>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleContinue}
        >
          <Text style={styles.btnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </Pressable>
        <Text style={styles.hint}>You can change this anytime in settings.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  stepLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 8,
  },
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
  list: { flex: 1, paddingHorizontal: 20 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  optionText: { gap: 2 },
  optionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  optionLabelSelected: { color: Colors.primary },
  optionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  footer: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.white,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: "center",
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});
