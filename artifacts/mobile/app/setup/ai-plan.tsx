import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const STEPS = [
  { label: "Analyzing your style preferences", icon: "sparkles" as const },
  { label: "Building your color palette", icon: "color-palette" as const },
  { label: "Matching outfit combinations", icon: "shirt" as const },
  { label: "Personalizing recommendations", icon: "star" as const },
];

const TESTIMONIALS = [
  { name: "Sarah M.", text: "This app completely transformed how I get dressed every morning!", rating: 5 },
  { name: "James L.", text: "The AI suggestions are surprisingly accurate. Saved me so much time.", rating: 5 },
  { name: "Emily R.", text: "I finally feel confident in my outfits. Best fashion app I've tried.", rating: 5 },
];

const STEP_DURATION = 1400;

export default function AIPlanScreen() {
  const insets = useSafeAreaInsets();
  const { setFlowStage } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const progressWidth = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Pulsing animation for the icon
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [pulseScale]);

  // Step progression
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_DURATION);

    return () => clearInterval(timer);
  }, []);

  // Testimonial rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Progress bar animation
  useEffect(() => {
    const target = ((currentStep + 1) / STEPS.length) * 100;
    progressWidth.value = withSpring(target, { damping: 20, stiffness: 80 });
  }, [currentStep, progressWidth]);

  // Navigate after all steps complete
  useEffect(() => {
    if (currentStep >= STEPS.length - 1) {
      const timeout = setTimeout(async () => {
        await setFlowStage("premium");
        router.replace("/premium");
      }, STEP_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, setFlowStage]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const testimonial = TESTIMONIALS[testimonialIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={styles.headerLabel}>SETTING UP YOUR PLAN</Text>
      </Animated.View>

      {/* Center content */}
      <View style={styles.center}>
        <Animated.View style={[styles.iconContainer, pulseStyle]}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="sparkles" size={40} color={Colors.white} />
            </View>
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
          AI is crafting your{"\n"}style plan
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.subtitle}>
          Sit tight while we personalize everything for you
        </Animated.Text>

        {/* Progress bar */}
        <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
        </Animated.View>

        {/* Step indicators */}
        <View style={styles.steps}>
          {STEPS.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <Animated.View
                key={step.label}
                entering={FadeInDown.delay(700 + i * 100).duration(400)}
                style={[styles.stepRow, isActive && styles.stepRowActive]}
              >
                <View style={[styles.stepIcon, isDone && styles.stepIconDone, isActive && styles.stepIconActive]}>
                  <Ionicons
                    name={isDone ? "checkmark" : step.icon}
                    size={16}
                    color={isDone ? Colors.white : isActive ? Colors.primary : Colors.textTertiary}
                  />
                </View>
                <Text style={[styles.stepLabel, isDone && styles.stepLabelDone, isActive && styles.stepLabelActive]}>
                  {step.label}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Testimonial */}
      <Animated.View entering={FadeInUp.delay(1000).duration(500)} style={styles.testimonialCard}>
        <View style={styles.stars}>
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Ionicons key={i} name="star" size={14} color="#F5A623" />
          ))}
        </View>
        <Text style={styles.testimonialText}>&ldquo;{testimonial.text}&rdquo;</Text>
        <Text style={styles.testimonialName}>{testimonial.name}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingVertical: 8,
  },
  headerLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.primary,
  },
  center: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 28,
  },
  iconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(27, 44, 193, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 28,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  steps: {
    width: "100%",
    gap: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  stepRowActive: {
    backgroundColor: Colors.surface,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconDone: {
    backgroundColor: Colors.success,
  },
  stepIconActive: {
    backgroundColor: "rgba(27, 44, 193, 0.12)",
  },
  stepLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.textTertiary,
  },
  stepLabelDone: {
    color: Colors.textSecondary,
  },
  stepLabelActive: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  testimonialCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 8,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  testimonialText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 19,
  },
  testimonialName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
