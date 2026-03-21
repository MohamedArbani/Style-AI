import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { TabScreenHeader, TabScreenHeaderAction } from "@/components/TabScreenHeader";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/context/AuthContext";
import { useWardrobe } from "@/context/WardrobeContext";

function MenuItem({ icon, label, onPress, destructive }: { icon: string; label: string; onPress?: () => void; destructive?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuItemIcon, destructive && styles.menuItemIconDestructive]}>
          <Feather name={icon as never} size={18} color={destructive ? "#EF4444" : Colors.primary} />
        </View>
        <Text style={[styles.menuItemLabel, destructive && styles.menuItemLabelDestructive]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { items } = useWardrobe();
  const toast = useToast();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const handleLogout = () => {
    toast.warning("Tap again to confirm log out");
    setTimeout(async () => {
      await logout();
      toast.info("You have been logged out");
      router.replace("/onboarding");
    }, 1500);
  };

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} coming soon!`);
  };

  const initials = user?.fullName
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <TabScreenHeader
        eyebrow="Account"
        title="Profile"
        subtitle={user?.email ?? "Manage your preferences, saved styles, and account settings in one place."}
        badge={`${items.length} items`}
        leading={<Text style={styles.headerInitials}>{initials}</Text>}
        trailing={
          <TabScreenHeaderAction onPress={() => handleComingSoon("Settings")}>
            <Feather name="settings" size={20} color={Colors.primary} />
          </TabScreenHeaderAction>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Pressable
              style={styles.editBadge}
              onPress={() => handleComingSoon("Profile photo editing")}
            >
              <Feather name="edit-2" size={10} color={Colors.white} />
            </Pressable>
          </View>
          <Text style={styles.userName}>{user?.fullName ?? "User"}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>TOTAL ITEMS</Text>
            <Text style={styles.statValue}>{items.length}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>AI OUTFITS</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT SETTINGS</Text>
        <View style={styles.menuSection}>
          <MenuItem icon="user" label="Personal Information" onPress={() => handleComingSoon("Personal information")} />
          <View style={styles.separator} />
          <MenuItem icon="bell" label="Notifications" onPress={() => handleComingSoon("Notifications")} />
        </View>

        <Text style={styles.sectionLabel}>STYLE PREFERENCES</Text>
        <View style={styles.menuSection}>
          <MenuItem icon="sliders" label="Color Palette" onPress={() => handleComingSoon("Color palette settings")} />
          <View style={styles.separator} />
          <MenuItem icon="star" label="Style Preferences" onPress={() => router.push("/setup/style")} />
        </View>

        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.menuSection}>
          <MenuItem icon="shield" label="Privacy & Security" onPress={() => handleComingSoon("Privacy & Security")} />
          <View style={styles.separator} />
          <MenuItem icon="help-circle" label="Help & Support" onPress={() => handleComingSoon("Help & Support")} />
          <View style={styles.separator} />
          <MenuItem icon="award" label="Upgrade to Pro" onPress={() => router.push("/premium")} />
        </View>

        {user?.stylePreferences && user.stylePreferences.length > 0 && (
          <View style={styles.stylesSection}>
            <Text style={styles.sectionLabel}>YOUR STYLES</Text>
            <View style={styles.styleChips}>
              {user.stylePreferences.map(s => (
                <View key={s} style={styles.styleChip}>
                  <Text style={styles.styleChipText}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerInitials: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: Colors.primary,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  profileSection: { alignItems: "center", paddingVertical: 24, gap: 8 },
  avatarWrap: { position: "relative", marginBottom: 4 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: Colors.white,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6,
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 30, color: Colors.white },
  editBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.white,
    alignItems: "center", justifyContent: "center",
  },
  userName: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text },
  userEmail: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  statsRow: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 28,
    backgroundColor: Colors.card, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  stat: { flex: 1, alignItems: "center", gap: 6 },
  statLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.textTertiary, letterSpacing: 0.5 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 32, color: Colors.primary },
  statDivider: { width: 1, backgroundColor: Colors.border },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.textTertiary,
    letterSpacing: 1, paddingHorizontal: 20, marginBottom: 8, textTransform: "uppercase",
  },
  menuSection: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: Colors.card, borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuItemIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
  },
  menuItemIconDestructive: { backgroundColor: "#FEF2F2" },
  menuItemLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.text },
  menuItemLabelDestructive: { color: "#EF4444" },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  stylesSection: { marginBottom: 20 },
  styleChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 20 },
  styleChip: {
    backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.border,
  },
  styleChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.primary },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    marginHorizontal: 16, marginBottom: 20, borderRadius: 14,
    backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", height: 52,
  },
  logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#EF4444" },
});
