import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

type TabScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  leading: ReactNode;
  badge?: string;
  trailing?: ReactNode;
};

type TabScreenHeaderActionProps = {
  children: ReactNode;
  onPress?: () => void;
};

export function TabScreenHeader({
  eyebrow,
  title,
  subtitle,
  leading,
  badge,
  trailing,
}: TabScreenHeaderProps) {
  return (
    // <View style={styles.wrapper}>
    //   <LinearGradient
    //     colors={["#FFFFFF", "#F3F6FF", "#EEF2FF"]}
    //     start={{ x: 0, y: 0 }}
    //     end={{ x: 1, y: 1 }}
    //     style={styles.card}
    //   >
    //     <View style={styles.glow} />
    //     <View style={styles.topRow}>
    //       <View style={styles.topLeft}>
    //         <View style={styles.leadingBadge}>{leading}</View>
    //         {badge ? (
    //           <View style={styles.metricBadge}>
    //             <Text style={styles.metricBadgeText}>{badge}</Text>
    //           </View>
    //         ) : null}
    //       </View>
    //       {trailing ? <View>{trailing}</View> : null}
    //     </View>

    //   </LinearGradient>
    // </View>
    <View style={styles.wrapper}>
      <View style={styles.leadingBadge}>{leading}</View>
      {/* <Text style={styles.eyebrow} numberOfLines={1}>{eyebrow}</Text> */}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {/* <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> */}
    </View>
  );
}

export function TabScreenHeaderAction({ children, onPress }: TabScreenHeaderActionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.78 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  glow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(74, 95, 232, 0.1)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  leadingBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(232,234,255,0.96)",
  },
  metricBadge: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: "rgba(16,32,160,0.08)",
    borderWidth: 1,
    borderColor: "rgba(27,44,193,0.1)",
  },
  metricBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.primary,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.86)",
    borderWidth: 1,
    borderColor: "rgba(232,234,255,0.96)",
  },
  textBlock: {
    gap: 4,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: Colors.primaryDark,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 21,
    lineHeight: 26,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
    maxWidth: 260,
  },
});