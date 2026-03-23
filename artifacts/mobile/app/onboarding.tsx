import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Onboarding } from "@/components/Onboarding";

const CARD_HORIZONTAL_PADDING = 24;
const CARD_ASPECT_RATIO = 0.78; // height / width

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const cardWidth = width - CARD_HORIZONTAL_PADDING * 2;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  const handleGetStarted = () => {
    router.push("/setup/language");
  };

  const handleSignIn = () => {
    router.replace("/auth/login");
  };

  return (
    <View style={[styles.container, { paddingTop: topInset + 16, paddingBottom: bottomInset + 8 }]}>
      {/* Title & Subtitle */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>Visualize Your Style</Text>
        <Text style={styles.subtitle}>
          Experience the future of fashion. Our AI maps any outfit to your body with flawless realism.
        </Text>
      </View>

      {/* Before/After Slider Card */}
      <View style={styles.cardWrapper}>
        <Onboarding width={cardWidth} height={cardHeight} />
      </View>

      {/* Swipe hint */}
      <View style={styles.hintRow}>
        <MaterialCommunityIcons name="gesture-swipe-horizontal" size={18} color={Colors.textTertiary} />
        <Text style={styles.hintText}>SWIPE TO COMPARE</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleGetStarted}
        >
          <Text style={styles.btnText}>Get Started</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.white} />
        </Pressable>

        <View style={styles.signInRow}>
          <Text style={styles.signInLabel}>Already have an account? </Text>
          <Pressable onPress={handleSignIn}>
            <Text style={styles.signInLink}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  textBlock: {
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    marginBottom: 24,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  cardWrapper: {
    alignItems: "center",
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },
  hintText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    gap: 16,
    alignItems: "center",
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  btnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.white,
  },
  signInRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  signInLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.primary,
  },
});
