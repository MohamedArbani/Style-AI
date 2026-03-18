import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useToast } from "@/components/Toast";
import { useWardrobe, OutfitRecommendation } from "@/context/WardrobeContext";

function OutfitCard({ outfit, isMain }: { outfit: OutfitRecommendation; isMain?: boolean }) {
  const toast = useToast();
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(prev => {
      const next = !prev;
      toast.success(next ? "Outfit saved to favorites!" : "Removed from favorites");
      return next;
    });
  };

  const handleWear = () => {
    toast.success(`"${outfit.name}" marked as today's outfit!`);
  };

  if (isMain) {
    return (
      <View style={styles.mainCard}>
        <View style={styles.mainCardImg}>
          {outfit.items.length > 0 && outfit.items[0].imageUrl ? (
            <Image source={{ uri: outfit.items[0].imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={styles.mainCardImgPlaceholder}>
              <MaterialCommunityIcons name="hanger" size={60} color="rgba(255,255,255,0.4)" />
            </View>
          )}
          <View style={styles.mainCardOverlay} />
          <View style={styles.mainCardContent}>
            <Text style={styles.mainCardTitle}>{outfit.name}</Text>
            <Text style={styles.mainCardSub}>{outfit.items.map(i => i.name).join(" • ")}</Text>
            <View style={styles.mainCardTags}>
              {outfit.tags?.slice(0, 2).map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Ionicons name="checkmark-circle-outline" size={12} color={Colors.white} />
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <Pressable style={styles.wearBtn} onPress={handleWear}>
          <MaterialCommunityIcons name="hanger" size={18} color={Colors.white} />
          <Text style={styles.wearBtnText}>Wear Today</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={styles.miniCard}>
      <View style={styles.miniCardImg}>
        {outfit.items.length > 0 && outfit.items[0].imageUrl ? (
          <Image source={{ uri: outfit.items[0].imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.miniCardImgPlaceholder]}>
            <MaterialCommunityIcons name="hanger" size={30} color={Colors.border} />
          </View>
        )}
        <Pressable style={styles.heartBtn} onPress={handleLike}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color={liked ? "#EF4444" : Colors.white} />
        </Pressable>
      </View>
      <Text style={styles.miniCardTitle} numberOfLines={1}>{outfit.name}</Text>
      <Text style={styles.miniCardSub} numberOfLines={1}>{outfit.items.map(i => i.name).join(" • ")}</Text>
    </Pressable>
  );
}

export default function AIStyleScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { items, fetchItems, recommendOutfits } = useWardrobe();
  const [outfits, setOutfits] = useState<OutfitRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useFocusEffect(
    useCallback(() => {
      if (!hasLoaded) {
        loadRecommendations();
      }
    }, [hasLoaded])
  );

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      await fetchItems();
      const results = await recommendOutfits();
      setOutfits(results);
      setHasLoaded(true);
      if (results.length > 0) {
        toast.success(`${results.length} outfit suggestions ready!`);
      } else {
        toast.info("Add more items to your wardrobe for personalized suggestions");
      }
    } catch {
      toast.error("Failed to load recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const mainOutfit = outfits[0];
  const otherOutfits = outfits.slice(1);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable>
          <Feather name="menu" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Daily Recommendations</Text>
        <Pressable onPress={() => toast.info("Notifications coming soon!")}>
          <View style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          </View>
        </Pressable>
      </View>

      <View style={styles.weatherCard}>
        <View style={styles.weatherLeft}>
          <Ionicons name="partly-sunny-outline" size={20} color={Colors.white} />
          <View>
            <Text style={styles.weatherTemp}>22°C</Text>
            <Text style={styles.weatherDesc}>Partly Cloudy</Text>
            <Text style={styles.weatherTip}>Perfect for light layers and cotton fabrics.</Text>
          </View>
        </View>
        <Pressable style={styles.weatherDetailBtn} onPress={() => toast.info("Weather details coming soon!")}>
          <Text style={styles.weatherDetailText}>Details</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>AI is styling your wardrobe...</Text>
        </View>
      ) : outfits.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="sparkles-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No recommendations yet</Text>
          <Text style={styles.emptySub}>Add items to your wardrobe to get personalized outfit suggestions</Text>
          <Pressable style={styles.refreshBtn} onPress={loadRecommendations}>
            <Text style={styles.refreshBtnText}>Generate Suggestions</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today&apos;s Pick</Text>
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{mainOutfit?.matchScore ?? 95}% Match</Text>
            </View>
          </View>

          {mainOutfit && <OutfitCard outfit={mainOutfit} isMain />}

          {otherOutfits.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Other Suggestions</Text>
                <Pressable onPress={() => toast.info("More outfits coming soon!")}>
                  <Text style={styles.viewAll}>View All</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.miniCardScroll}>
                {otherOutfits.map(o => <OutfitCard key={o.id} outfit={o} />)}
              </ScrollView>
            </>
          )}

          <Pressable style={styles.regenBtn} onPress={loadRecommendations}>
            <Ionicons name="refresh" size={16} color={Colors.primary} />
            <Text style={styles.regenBtnText}>Generate New Suggestions</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  notifBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  weatherCard: {
    marginHorizontal: 16, borderRadius: 16, backgroundColor: Colors.primary, padding: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20,
  },
  weatherLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  weatherTemp: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.white },
  weatherDesc: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.8)" },
  weatherTip: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, maxWidth: 200 },
  weatherDetailBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  weatherDetailText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.white },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  matchBadge: { backgroundColor: Colors.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  matchText: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.primary },
  viewAll: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.primary },
  mainCard: { marginHorizontal: 16, marginBottom: 24 },
  mainCardImg: { height: 320, borderRadius: 20, overflow: "hidden", backgroundColor: Colors.surface, marginBottom: 12 },
  mainCardImgPlaceholder: { flex: 1, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  mainCardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)", bottom: 0 },
  mainCardContent: { position: "absolute", bottom: 16, left: 16, right: 16, gap: 6 },
  mainCardTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.white },
  mainCardSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.85)" },
  mainCardTags: { flexDirection: "row", gap: 8, marginTop: 4 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.white },
  wearBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, height: 50,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  wearBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.white },
  miniCardScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  miniCard: { width: 160, marginBottom: 16 },
  miniCardImg: { width: 160, height: 180, borderRadius: 16, overflow: "hidden", backgroundColor: Colors.surface, marginBottom: 8 },
  miniCardImgPlaceholder: { backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  heartBtn: {
    position: "absolute", top: 8, right: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center",
  },
  miniCardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  miniCardSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.text },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  refreshBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  refreshBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.white },
  regenBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.card, height: 46, marginBottom: 16,
  },
  regenBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.primary },
});
