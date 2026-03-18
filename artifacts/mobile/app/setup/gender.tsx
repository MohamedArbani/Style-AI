import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const genders = [
  { id: "male", label: "Male", sublabel: "Masculine style curation", icon: "male" as const },
  { id: "female", label: "Female", sublabel: "Feminine style curation", icon: "female" as const },
  { id: "nonbinary", label: "Non-binary / Other", sublabel: "Unisex and fluid style curation", icon: "transgender" as const },
];

export default function GenderSetupScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();
  const [selected, setSelected] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleContinue = async () => {
    if (!selected) return;
    await updateProfile({ gender: selected });
    router.push("/setup/age");
  };

  return (
    <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.progressWrap}>
          <Text style={styles.progressLabel}>Profile Setup</Text>
          <Text style={styles.stepLabel}>Step 1 of 4</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: "25%" }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Select your gender</Text>
        <Text style={styles.subtitle}>This helps our AI curate the best style recommendations and fit algorithms specifically for you.</Text>

        <View style={styles.options}>
          {genders.map(g => (
            <Pressable
              key={g.id}
              style={[styles.option, selected === g.id && styles.optionSelected]}
              onPress={() => setSelected(g.id)}
            >
              <View style={[styles.optionIcon, selected === g.id && styles.optionIconSelected]}>
                <Ionicons name={g.icon} size={22} color={selected === g.id ? Colors.white : Colors.textSecondary} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, selected === g.id && styles.optionLabelSelected]}>{g.label}</Text>
                <Text style={styles.optionSub}>{g.sublabel}</Text>
              </View>
              {selected === g.id && (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={16} color={Colors.primary} />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.aiBadge}>
          <MaterialCommunityIcons name="auto-fix" size={22} color={Colors.primary} />
          <Text style={styles.aiBadgeText}>AI adapts to your choices instantly</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.btn, !selected && styles.btnDisabled, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleContinue}
          disabled={!selected}
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
  progressWrap: { flex: 1, alignItems: "center" },
  progressLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textSecondary },
  stepLabel: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.text },
  progressBar: {
    height: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  scroll: { flex: 1 },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 28,
  },
  options: { gap: 12, marginBottom: 28 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconSelected: { backgroundColor: Colors.primary },
  optionText: { flex: 1 },
  optionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  optionLabelSelected: { color: Colors.primary },
  optionSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiBadgeText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.primary, flex: 1 },
  footer: { paddingHorizontal: 20, paddingTop: 8 },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { backgroundColor: Colors.border },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
});
