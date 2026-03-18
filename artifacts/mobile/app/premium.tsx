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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const features = [
  {
    icon: "person-circle-outline",
    title: "Unlimited AI Try-Ons",
    sub: "Visualize any outfit instantly on your digital twin",
  },
  {
    icon: "trending-up-outline",
    title: "Advanced Style Insights",
    sub: "Personalized data-driven fashion recommendations",
  },
  {
    icon: "cloud-outline",
    title: "Secure Cloud Backup",
    sub: "Sync your entire wardrobe across all devices",
  },
];

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Smart Wardrobe Pro</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 24 }}>
        <View style={styles.heroBanner}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>PREMIUM ACCESS</Text>
          </View>
          <Text style={styles.heroTitle}>Unlock Your Full{"\n"}Style Potential</Text>
          <Text style={styles.heroSub}>Join 50,000+ fashion enthusiasts using Pro tools.</Text>
        </View>

        <Text style={styles.sectionTitle}>PREMIUM FEATURES</Text>

        <View style={styles.features}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as never} size={20} color={Colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.planCard, selectedPlan === "monthly" && styles.planCardSelected]}
          onPress={() => setSelectedPlan("monthly")}
        >
          <View style={styles.planLeft}>
            <Text style={styles.planLabel}>Monthly</Text>
            <Text style={styles.planPrice}>$9.99<Text style={styles.planPeriod}> / month</Text></Text>
            <View style={styles.planFeatures}>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.planFeatureText}>Full AI Access</Text>
              </View>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.planFeatureText}>Standard Support</Text>
              </View>
            </View>
          </View>
          <View style={[styles.planRadio, selectedPlan === "monthly" && styles.planRadioSelected]}>
            {selectedPlan === "monthly" && <View style={styles.planRadioDot} />}
          </View>
        </Pressable>

        <Pressable
          style={[styles.planCard, styles.planCardFeatured, selectedPlan === "yearly" && styles.planCardSelected]}
          onPress={() => setSelectedPlan("yearly")}
        >
          <View style={styles.planLeft}>
            <Text style={styles.planLabel}>Yearly</Text>
            <Text style={styles.planPrice}>$79.99<Text style={styles.planPeriod}> / year</Text></Text>
            <View style={styles.planFeatures}>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.planFeatureText}>Everything in Monthly</Text>
              </View>
              <View style={styles.planFeature}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                <Text style={styles.planFeatureText}>Priority AI Rendering</Text>
              </View>
            </View>
          </View>
          <View>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 33%</Text>
            </View>
            <View style={[styles.planRadio, selectedPlan === "yearly" && styles.planRadioSelected]}>
              {selectedPlan === "yearly" && <View style={styles.planRadioDot} />}
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.trialBtn}>
          <Text style={styles.trialBtnText}>Start 7-Day Free Trial</Text>
        </Pressable>

        <Text style={styles.trialNote}>No commitment. Cancel anytime in the App Store.{"\n"}Trial converts to a subscription after 7 days.</Text>

        <View style={styles.footer}>
          <Pressable><Text style={styles.footerLink}>PRIVACY POLICY</Text></Pressable>
          <Pressable><Text style={styles.footerLink}>TERMS OF USE</Text></Pressable>
          <Pressable><Text style={styles.footerLink}>RESTORE</Text></Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  heroBanner: {
    marginHorizontal: 16, borderRadius: 20, backgroundColor: Colors.primary,
    padding: 24, marginBottom: 28, minHeight: 160, justifyContent: "flex-end",
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 12,
  },
  heroBadgeText: { fontFamily: "Inter_700Bold", fontSize: 10, color: Colors.white, letterSpacing: 1 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.white, marginBottom: 8 },
  heroSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.8)" },
  sectionTitle: {
    fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.primary,
    letterSpacing: 1, paddingHorizontal: 20, marginBottom: 12, textTransform: "uppercase",
  },
  features: { marginHorizontal: 16, gap: 12, marginBottom: 28 },
  featureItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
  },
  featureText: { flex: 1 },
  featureTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text, marginBottom: 3 },
  featureSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  planCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, borderRadius: 16, borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.card, padding: 18, marginBottom: 12,
  },
  planCardFeatured: { borderColor: Colors.primary },
  planCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  planLeft: { flex: 1 },
  planLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
  planPrice: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text, marginBottom: 10 },
  planPeriod: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  planFeatures: { gap: 4 },
  planFeature: { flexDirection: "row", alignItems: "center", gap: 6 },
  planFeatureText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  planRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  planRadioSelected: { borderColor: Colors.primary },
  planRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  saveBadge: {
    backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 8, alignItems: "center",
  },
  saveBadgeText: { fontFamily: "Inter_700Bold", fontSize: 10, color: Colors.white, letterSpacing: 0.5 },
  trialBtn: {
    marginHorizontal: 16, borderRadius: 16, height: 56,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  trialBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  trialNote: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary,
    textAlign: "center", lineHeight: 18, paddingHorizontal: 20, marginBottom: 20,
  },
  footer: { flexDirection: "row", justifyContent: "center", gap: 16 },
  footerLink: {
    fontFamily: "Inter_500Medium", fontSize: 10, color: Colors.textTertiary,
    letterSpacing: 0.5, textTransform: "uppercase",
  },
});
