import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useWardrobe, WardrobeItem } from "@/context/WardrobeContext";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = ["All", "Tops & T-shirts", "Shirts", "Jackets & Coats", "Bottoms", "Dresses", "Shoes", "Accessories"];

function WardrobeCard({ item, onDelete }: { item: WardrobeItem; onDelete: () => void }) {
  return (
    <Pressable
      style={styles.card}
      onLongPress={() =>
        Alert.alert("Remove Item", `Remove "${item.name}" from your wardrobe?`, [
          { text: "Cancel", style: "cancel" },
          { text: "Remove", style: "destructive", onPress: onDelete },
        ])
      }
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImg} />
      ) : (
        <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
          <MaterialCommunityIcons name="hanger" size={40} color={Colors.border} />
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>{item.color}{item.brand ? ` • ${item.brand}` : ""}</Text>
      </View>
    </Pressable>
  );
}

export default function WardrobeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { items, isLoading, fetchItems, removeItem } = useWardrobe();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
  );

  const filtered = items.filter(item => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.color.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Feather name="user" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>My Wardrobe</Text>
        </View>
        <Pressable>
          <Feather name="search" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your wardrobe..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catScrollContent}
      >
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="hanger" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>Your wardrobe is empty</Text>
          <Text style={styles.emptySub}>Add your first clothing item to get started</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.push("/wardrobe/add")}>
            <Text style={styles.emptyBtnText}>Add Item</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomInset }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <WardrobeCard
              item={item}
              onDelete={() => removeItem(item.id)}
            />
          )}
        />
      )}

      <Pressable
        style={[styles.fab, { bottom: bottomInset }]}
        onPress={() => router.push("/wardrobe/add")}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>
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
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    marginHorizontal: 16, paddingHorizontal: 14, height: 44, marginBottom: 12,
  },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text },
  catScroll: { flexGrow: 0, marginBottom: 16 },
  catScrollContent: { paddingHorizontal: 16, gap: 8 },
  catChip: {
    paddingHorizontal: 14, height: 34, borderRadius: 17,
    backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  catChipTextActive: { color: Colors.white, fontFamily: "Inter_600SemiBold" },
  row: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 16,
    overflow: "hidden", borderWidth: 1, borderColor: Colors.border,
  },
  cardImg: { width: "100%", aspectRatio: 1, resizeMode: "cover" },
  cardImgPlaceholder: {
    backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center",
  },
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
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8,
  },
});
