import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Link, router, Stack } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdaptiveGlassView } from "@/components/AdaptiveGlassView";
import { GlassButton } from "@/components/GlassButton";
import Colors from "@/constants/colors";
import { TabScreenHeader, TabScreenHeaderAction } from "@/components/TabScreenHeader";
import { useToast } from "@/components/Toast";
import { useWardrobe, WardrobeItem } from "@/context/WardrobeContext";

const CATEGORIES = ["All", "Tops & T-shirts", "Shirts", "Jackets & Coats", "Bottoms", "Dresses", "Shoes", "Accessories"];

const useNativeUI = isLiquidGlassAvailable();
const isIOS = Platform.OS === "ios";

function WardrobeCard({ item, onDelete }: { item: WardrobeItem; onDelete: () => void }) {
  const handleOpen = () => {
    router.push(`/wardrobe/${item.id}`);
  };

  const handleLongPress = () => {
    if (Platform.OS === "web") {
      return;
    }

    Alert.alert(item.name, "Choose an action", [
      { text: "View Details", onPress: handleOpen },
      { text: "Delete", style: "destructive", onPress: onDelete },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const cardContent = (
    <Pressable
      style={styles.card}
      onPress={!isIOS ? handleOpen : undefined}
      onLongPress={!isIOS ? handleLongPress : undefined}
      delayLongPress={220}
    >
      {item.imageUrl ? (
        <View style={styles.cardImgWrap}>
          <Link.AppleZoom>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImg} contentFit="cover" />
          </Link.AppleZoom>
          {useNativeUI ? (
            <AdaptiveGlassView
              style={styles.cardGlassFooter}
              fallbackTint="systemUltraThinMaterial"
            >
              <Text style={styles.cardNameGlass} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardMetaGlass} numberOfLines={1}>{item.color}{item.brand ? ` • ${item.brand}` : ""}</Text>
            </AdaptiveGlassView>
          ) : null}
        </View>
      ) : (
        <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
          <MaterialCommunityIcons name="hanger" size={40} color={Colors.border} />
        </View>
      )}
      {useNativeUI ? null : (
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>{item.color}{item.brand ? ` • ${item.brand}` : ""}</Text>
        </View>
      )}
    </Pressable>
  );

  if (isIOS) {
    return (
      <Link href={`/wardrobe/${item.id}` as `/wardrobe/${string}`} asChild>
        <Link.Trigger>
          {cardContent}
        </Link.Trigger>
        <Link.Preview />
        <Link.Menu>
          <Link.MenuAction
            title="View Details"
            icon="eye"
            onPress={() => router.push(`/wardrobe/${item.id}`)}
          />
          <Link.MenuAction
            title="Delete"
            icon="trash"
            destructive
            onPress={onDelete}
          />
        </Link.Menu>
      </Link>
    );
  }

  return cardContent;
}

export default function WardrobeScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { items, isLoading, removeItem, isRefetching, refetch } = useWardrobe();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const hasNativeAddAction = isLiquidGlassAvailable();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  // const bottomInset = Platform.OS === "web" ? 100 : insets.bottom + 10;
  const bottomInset = Platform.select({ web: 100, android: insets.bottom + 60, default: insets.bottom + 10 });

  const handleDelete = useCallback((item: WardrobeItem) => {
    removeItem(item.id)
      .then(() => toast.success(`"${item.name}" removed from wardrobe`))
      .catch(() => toast.error("Failed to remove item. Please try again."));
  }, [removeItem, toast]);

  const filtered = items.filter(item => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.color.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const listHeader = (
    <>
      <TabScreenHeader
        eyebrow="Wardrobe"
        title="Wardrobe Studio"
        subtitle="Organize pieces, filter fast, and keep your best looks within reach."
        badge={`${items.length} pieces`}
        leading={<MaterialCommunityIcons name="hanger" size={18} color={Colors.primary} />}
        trailing={
          hasNativeAddAction ? null : (
            <TabScreenHeaderAction onPress={() => router.push("/wardrobe/add")}>
              <Ionicons name="add" size={18} color={Colors.primary} />
            </TabScreenHeaderAction>
          )
        }
      />

      <AdaptiveGlassView style={styles.searchWrap} fallbackTint="systemThinMaterial">
        <Feather name="search" size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your wardrobe..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </Pressable>
        ) : null}
      </AdaptiveGlassView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catScrollContent}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {listHeader}
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingIndicator} />
      ) : filtered.length === 0 ? (
        <View style={[styles.empty, { paddingBottom: bottomInset }]}>
          <MaterialCommunityIcons name="hanger" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No matching pieces</Text>
          <Text style={styles.emptySub}>Try another filter or add a new item to your wardrobe.</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.push("/wardrobe/add")}>
            <Text style={styles.emptyBtnText}>Add Item</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <WardrobeCard
              item={item}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      {hasNativeAddAction ? null : (
        <GlassButton
          style={{ ...styles.fab, bottom: bottomInset }}
          onPress={() => router.push("/wardrobe/add")}
        >
          <Ionicons name="add" size={28} color={isIOS ? Colors.primary : Colors.white} />
        </GlassButton>
      )}

      {isIOS ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="plus" onPress={() => router.push("/wardrobe/add")} />
        </Stack.Toolbar>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text },
  loadingIndicator: { marginTop: 48 },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12,
    marginHorizontal: 16, paddingHorizontal: 14, height: 44, marginBottom: 10,
  },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text },
  catScroll: { flexGrow: 0, marginBottom: 14, minHeight: 40 },
  catScrollContent: { paddingHorizontal: 16, paddingVertical: 2, gap: 8, alignItems: "center" },
  catChip: {
    paddingHorizontal: 14, height: 34, borderRadius: 17,
    backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  catChipTextActive: { color: Colors.white, fontFamily: "Inter_600SemiBold" },
  listContent: { paddingBottom: 140 },
  row: { marginBottom: 12, justifyContent: "space-between", paddingHorizontal: 16 },
  card: {
    width: "48.3%",
    backgroundColor: Colors.card, borderRadius: 16,
    overflow: "hidden", borderWidth: 1, borderColor: Colors.border,
  },
  cardImgWrap: { position: "relative" },
  cardImg: { width: "100%", aspectRatio: 1 },
  cardImgPlaceholder: { backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  cardGlassFooter: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 10, paddingVertical: 8, gap: 2,
  },
  cardNameGlass: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  cardMetaGlass: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  cardBody: { padding: 10, gap: 3 },
  cardName: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  cardMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.text },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center", paddingHorizontal: 32 },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.white },
  fab: {
    position: "absolute", right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
});
