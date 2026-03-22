import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdaptiveGlassView } from "@/components/AdaptiveGlassView";
import Colors from "@/constants/colors";

const slides = [
  {
    id: "1",
    icon: "hanger" as const,
    iconSet: "MaterialCommunityIcons" as const,
    title: "Digitize Your Closet",
    subtitle: "Snap a photo of your clothes and let our AI automatically categorize and organize your wardrobe for you.",
    badge: "Advanced Visual Recognition AI",
  },
  {
    id: "2",
    icon: "sparkles" as const,
    iconSet: "Ionicons" as const,
    title: "Personalized Recommendations",
    subtitle: "Our AI suggests the perfect outfit by matching your unique wardrobe. Never worry about what to wear again.",
    badge: "Powered by AI",
  },
  {
    id: "3",
    icon: "body" as const,
    iconSet: "Ionicons" as const,
    title: "Virtual Fitting Room",
    subtitle: "Instantly visualize any outfit on your photo. Our AI accurately maps fabrics to your body for the most realistic preview.",
    badge: "Perfect Match",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.replace("/auth/login");
    }
  };

  const handleSkip = () => {
    router.replace("/auth/login");
  };

  return (
    <View style={[styles.container, { paddingTop: topInset, paddingBottom: bottomInset }]}>
      <View style={styles.header}>
        <AdaptiveGlassView style={styles.logo} fallbackTint="systemThinMaterial">
          <MaterialCommunityIcons name="hanger" size={20} color={Colors.primary} />
        </AdaptiveGlassView>
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={item => item.id}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.illustrationContainer, { width: width - 48 }]}>
              <View style={styles.illustrationBg}>
                {item.iconSet === "Ionicons" ? (
                  <Ionicons name={item.icon as never} size={80} color={Colors.white} />
                ) : (
                  <MaterialCommunityIcons name={item.icon as never} size={80} color={Colors.white} />
                )}
              </View>
              <AdaptiveGlassView style={styles.badge} fallbackTint="systemUltraThinMaterial">
                <Ionicons name="checkmark-circle" size={14} color={Colors.white} />
                <Text style={styles.badgeText}>{item.badge}</Text>
              </AdaptiveGlassView>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleNext}
        >
          <Text style={styles.btnText}>
            {activeIndex === slides.length - 1 ? "Get Started" : "Next Step"}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </Pressable>

        <Text style={styles.tagline}>READY TO TRANSFORM YOUR STYLE?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  skipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.primary,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  illustrationContainer: {
    height: 280,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    overflow: "hidden",
    position: "relative",
  },
  illustrationBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: 16,
    alignItems: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
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
  tagline: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
