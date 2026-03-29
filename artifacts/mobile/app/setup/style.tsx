import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { SetupHeader } from "@/components/SetupHeader";
import { SetupFooter } from "@/components/SetupFooter";

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
  const { updateSetupPreferences, setFlowStage } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleStyle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    await updateSetupPreferences({ stylePreferences: selected });
    await setFlowStage("ai-plan");
    router.replace("/setup/ai-plan");
  };

  return (
    <View style={styleSheet.container}>
      <SetupHeader title="Style Preferences" step={5} totalSteps={5} />

      <ScrollView
        style={styleSheet.scroll}
        contentContainerStyle={styleSheet.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styleSheet.title}>What&apos;s your outfit vibe?</Text>
        <Text style={styleSheet.subtitle}>
          Select 3 or more styles to tailor your personalized fashion feed.
        </Text>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styleSheet.grid}>
          {styles_list.map((style) => {
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
                  <Text style={[styleSheet.styleLabel, isSelected && styleSheet.styleLabelSelected]}>
                    {style.label}
                  </Text>
                  {isSelected ? (
                    <View style={styleSheet.checkBadge}>
                      <Ionicons name="checkmark" size={12} color={Colors.primary} />
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>

      <SetupFooter
        onContinue={handleContinue}
        label={selected.length >= 3 ? `Continue (${selected.length} selected)` : "Continue"}
      />
    </View>
  );
}

const styleSheet = StyleSheet.create({
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
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  styleCard: {
    width: "47%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderCurve: "continuous",
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
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
