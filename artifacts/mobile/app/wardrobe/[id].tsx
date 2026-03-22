import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AdaptiveGlassView } from "@/components/AdaptiveGlassView";
import { GlassCard } from "@/components/GlassCard";
import Colors from "@/constants/colors";
import { useToast } from "@/components/Toast";
import { useWardrobe } from "@/context/WardrobeContext";

const isIOS = Platform.OS === "ios";

export default function WardrobeDetailScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, removeItem } = useWardrobe();

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <MaterialCommunityIcons name="hanger" size={48} color={Colors.border} />
          <Text style={styles.emptyText}>Item not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.linkText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Item", `Remove "${item.name}" from your wardrobe?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await removeItem(item.id);
            toast.success(`"${item.name}" removed`);
            router.back();
          } catch {
            toast.error("Failed to delete item");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {item.imageUrl ? (
          <Link.AppleZoomTarget>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
            />
          </Link.AppleZoomTarget>
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <MaterialCommunityIcons name="hanger" size={64} color={Colors.border} />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>

          <View style={styles.metaRow}>
            <AdaptiveGlassView style={styles.metaChip}>
              <Ionicons name="color-palette-outline" size={14} color={Colors.primary} />
              <Text style={styles.metaChipText}>{item.color}</Text>
            </AdaptiveGlassView>
            <AdaptiveGlassView style={styles.metaChip}>
              <Ionicons name="pricetag-outline" size={14} color={Colors.primary} />
              <Text style={styles.metaChipText}>{item.category}</Text>
            </AdaptiveGlassView>
            {item.season ? (
              <AdaptiveGlassView style={styles.metaChip}>
                <Ionicons name="leaf-outline" size={14} color={Colors.primary} />
                <Text style={styles.metaChipText}>{item.season}</Text>
              </AdaptiveGlassView>
            ) : null}
          </View>

          {item.brand ? (
            <GlassCard style={styles.detailCard}>
              <Text style={styles.detailLabel}>Brand</Text>
              <Text style={styles.detailValue}>{item.brand}</Text>
            </GlassCard>
          ) : null}

          {item.notes ? (
            <GlassCard style={styles.detailCard}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{item.notes}</Text>
            </GlassCard>
          ) : null}

          {item.tags && item.tags.length > 0 ? (
            <View style={styles.tagsSection}>
              <Text style={styles.detailLabel}>Tags</Text>
              <View style={styles.tagsRow}>
                {item.tags.map((tag, i) => (
                  <AdaptiveGlassView key={i} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </AdaptiveGlassView>
                ))}
              </View>
            </View>
          ) : null}

          {/* <Pressable
            style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={styles.deleteBtnText}>Remove from Wardrobe</Text>
          </Pressable> */}
        </View>
      </ScrollView>

      {isIOS ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Menu icon="ellipsis">
            <Stack.Toolbar.MenuAction
              icon="trash"
              destructive
              onPress={handleDelete}
            >
              Delete Item
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 16, color: Colors.textSecondary },
  linkText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.primary },
  heroImage: { width: "100%", aspectRatio: 1, backgroundColor: Colors.surface },
  heroPlaceholder: { alignItems: "center", justifyContent: "center" },
  content: { padding: 20, gap: 16 },
  name: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.text },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, overflow: "hidden",
  },
  metaChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.text },
  detailCard: { borderRadius: 14, padding: 16, gap: 4 },
  detailLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.textTertiary,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
  },
  detailValue: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text, lineHeight: 22 },
  tagsSection: { gap: 8 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, overflow: "hidden",
  },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.text },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, marginTop: 8,
    borderRadius: 14, borderWidth: 1.5, borderColor: "rgba(239, 68, 68, 0.2)",
    backgroundColor: "rgba(239, 68, 68, 0.06)",
  },
  deleteBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.error },
});
