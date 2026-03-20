import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const styles_list = [
  { id: "streetwear", label: "Streetwear" },
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
  { id: "vintage", label: "Vintage" },
  { id: "minimalist", label: "Minimalist" },
  { id: "bohemian", label: "Bohemian" },
  { id: "athletic", label: "Athletic" },
  { id: "preppy", label: "Preppy" },
  { id: "grunge", label: "Grunge" },
  { id: "elegant", label: "Elegant" },
  { id: "artsy", label: "Artsy" },
  { id: "smart", label: "Smart Casual" },
];

export default function StyleSetupScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile, completeOnboarding } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleStyle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    await updateProfile({ stylePreferences: selected });
    await completeOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <View style={[styleSheet.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <View style={styleSheet.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styleSheet.screenTitle}>Style Preferences</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styleSheet.progressBar}>
        <View style={[styleSheet.progressFill, { width: "100%" }]} />
      </View>

      <View style={styleSheet.subheader}>
        <Text style={styleSheet.stepLabel}>Step 5: Your Aesthetic</Text>
        <Text style={styleSheet.stepNum}>5 of 5</Text>
      </View>

      <ScrollView style={styleSheet.scroll} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={styleSheet.title}>What&apos;s your outfit vibe?</Text>
        <Text style={styleSheet.subtitle}>Select 3 or more styles to tailor your personalized fashion feed.</Text>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styleSheet.grid}>
          {styles_list.map(style => {
            const isSelected = selected.includes(style.id);
            return (
              <Pressable
                key={style.id}
                style={[styleSheet.styleCard, isSelected && styleSheet.styleCardSelected]}
                onPress={() => toggleStyle(style.id)}
              >
                <View style={[styleSheet.styleCardInner, isSelected && styleSheet.styleCardInnerSelected]}>
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "shirt-outline"}
                    size={28}
                    color={isSelected ? Colors.white : Colors.textSecondary}
                  />
                  <Text style={[styleSheet.styleLabel, isSelected && styleSheet.styleLabelSelected]}>{style.label}</Text>
                  {isSelected && (
                    <View style={styleSheet.checkBadge}>
                      <Ionicons name="checkmark" size={12} color={Colors.primary} />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>

      <View style={styleSheet.footer}>
        <Pressable
          style={({ pressed }) => [styleSheet.btn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleContinue}
        >
          <Text style={styleSheet.btnText}>
            {selected.length >= 3 ? `Continue (${selected.length} selected)` : "Continue"}
          </Text>
        </Pressable>
        <Pressable onPress={handleContinue}>
          <Text style={styleSheet.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styleSheet = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  screenTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  progressBar: { height: 3, backgroundColor: Colors.border, marginHorizontal: 20, borderRadius: 2, marginBottom: 12 },
  progressFill: { height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  subheader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 16,
  },
  stepLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  stepNum: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.primary },
  scroll: { flex: 1 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.text, marginBottom: 8 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  styleCard: {
    width: "47%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  styleCardSelected: { borderColor: Colors.primary },
  styleCardInner: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    position: "relative",
  },
  styleCardInnerSelected: { backgroundColor: Colors.primary },
  styleLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  styleLabelSelected: { color: Colors.white },
  checkBadge: {
    position: "absolute", top: 8, right: 8,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center",
  },
  footer: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center" },
  btnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  skipText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
});
