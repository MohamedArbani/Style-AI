import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { TabScreenHeader, TabScreenHeaderAction } from "@/components/TabScreenHeader";
import { useToast } from "@/components/Toast";
import { useWardrobe, WardrobeItem } from "@/context/WardrobeContext";

const CATEGORIES = ["All", "Tops & T-shirts", "Bottoms", "Dresses", "Outerwear"];

export default function TryOnScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { items, fetchItems, generateTryOn } = useWardrobe();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const pulseScale = useSharedValue(1);
  const dotOpacity1 = useSharedValue(0.3);
  const dotOpacity2 = useSharedValue(0.3);
  const dotOpacity3 = useSharedValue(0.3);

  useEffect(() => {
    if (!isGenerating) return;
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    dotOpacity1.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
      -1,
    );
    dotOpacity2.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 200 }), withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
      -1,
    );
    dotOpacity3.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 400 }), withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 200 })),
      -1,
    );
  }, [isGenerating, pulseScale, dotOpacity1, dotOpacity2, dotOpacity3]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));
  const dot1Style = useAnimatedStyle(() => ({ opacity: dotOpacity1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dotOpacity2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dotOpacity3.value }));

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 84 : insets.bottom + 60;

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
  );

  const toggleItem = (item: WardrobeItem) => {
    if (selectedIds.includes(item.id)) {
      setSelectedIds(prev => prev.filter(i => i !== item.id));
    } else if (selectedIds.length >= 5) {
      toast.warning("You can select up to 5 items at once");
    } else {
      setSelectedIds(prev => [...prev, item.id]);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setUserPhoto(result.assets[0].uri);
      setUserPhotoBase64(result.assets[0].base64 ?? null);
      setGeneratedImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!userPhoto || !userPhotoBase64) {
      toast.warning("Please upload your photo first");
      return;
    }
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one clothing item");
      return;
    }

    setIsGenerating(true);
    setLoadingMessage("Analyzing your wardrobe picks...");

    const messages = [
      "Analyzing your wardrobe picks...",
      "Mixing & matching styles...",
      "Creating your outfit preview...",
      "Adding final touches...",
    ];
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 3000);

    try {
      const response = await generateTryOn(userPhotoBase64, selectedIds);
      clearInterval(msgInterval);
      setIsGenerating(false);
      router.push({
        pathname: "/wardrobe/try-on-result",
        params: {
          imageBase64: response.imageBase64,
          description: response.description,
        },
      });
    } catch {
      clearInterval(msgInterval);
      setIsGenerating(false);
      toast.error("Failed to generate outfit preview. Please try again.");
    }
  };

  const filteredItems = items.filter(item =>
    activeCategory === "All" || item.category.toLowerCase().includes(activeCategory.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <TabScreenHeader
        eyebrow="Virtual Try-On"
        title="AI Try-On"
        subtitle="Upload a photo, select pieces, and preview how your wardrobe comes together before you wear it."
        badge={`${selectedIds.length}/5 selected`}
        leading={<MaterialCommunityIcons name="hanger" size={20} color={Colors.primary} />}
        trailing={
          <TabScreenHeaderAction
            onPress={() => {
              if (generatedImage) {
                setGeneratedImage(null);
              } else if (userPhoto) {
                setUserPhoto(null);
                setUserPhotoBase64(null);
              }
            }}
          >
            <Feather name="refresh-ccw" size={18} color={Colors.primary} />
          </TabScreenHeaderAction>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>
        <Pressable style={styles.photoWrap} onPress={pickPhoto}>
          {generatedImage ? (
            <>
              <Image source={{ uri: generatedImage }} style={styles.photo} />
              <View style={styles.readyBadge}>
                <Ionicons name="sparkles" size={12} color={Colors.white} />
                <Text style={styles.readyBadgeText}>AI PREVIEW</Text>
              </View>
              <Pressable style={styles.compareBtn} onPress={() => setGeneratedImage(null)}>
                <Feather name="layers" size={14} color={Colors.text} />
                <Text style={styles.compareBtnText}>Reset</Text>
              </Pressable>
            </>
          ) : userPhoto ? (
            <>
              <Image source={{ uri: userPhoto }} style={styles.photo} />
              <View style={styles.photoOverlay}>
                <Ionicons name="camera-outline" size={24} color={Colors.white} />
                <Text style={styles.photoOverlayText}>Tap to change photo</Text>
              </View>
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.photoPlaceholderIcon}>
                <Ionicons name="person-circle-outline" size={60} color={Colors.border} />
              </View>
              <Text style={styles.photoPlaceholderTitle}>Upload Your Photo</Text>
              <Text style={styles.photoPlaceholderSub}>A clear full-body photo works best</Text>
              <View style={styles.uploadBtn}>
                <Ionicons name="cloud-upload-outline" size={18} color={Colors.primary} />
                <Text style={styles.uploadBtnText}>Choose Photo</Text>
              </View>
            </View>
          )}
        </Pressable>

        <View style={styles.selectHeader}>
          <Text style={styles.selectTitle}>Select Items</Text>
          {selectedIds.length > 0 && (
            <Pressable
              style={styles.selectedBadge}
              onPress={() => setSelectedIds([])}
            >
              <Text style={styles.selectedBadgeText}>{selectedIds.length} Selected · Clear</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemGrid}
        >
          <Pressable style={[styles.itemCard, styles.uploadCard]} onPress={pickPhoto}>
            <Ionicons name="cloud-upload-outline" size={28} color={Colors.textSecondary} />
            <Text style={styles.uploadCardText}>UPLOAD</Text>
          </Pressable>

          {filteredItems.length === 0 ? (
            <View style={styles.emptyItems}>
              <MaterialCommunityIcons name="hanger" size={48} color={Colors.border} />
              <Text style={styles.emptyItemsText}>No items in this category</Text>
            </View>
          ) : (
            filteredItems.map(item => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                  onPress={() => toggleItem(item)}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImg} />
                  ) : (
                    <View style={[styles.itemImg, styles.itemImgPlaceholder]}>
                      <MaterialCommunityIcons name="hanger" size={30} color={Colors.border} />
                    </View>
                  )}
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color={Colors.primary} />
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <Pressable
          style={({ pressed }) => [styles.generateBtn, (isGenerating || selectedIds.length === 0) && styles.generateBtnDisabled, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handleGenerate}
          disabled={isGenerating || selectedIds.length === 0}
        >
          <Ionicons name="sparkles" size={18} color={Colors.white} />
          <Text style={styles.generateBtnText}>Generate AI Outfit</Text>
        </Pressable>
      </ScrollView>

      {isGenerating ? (
        <Animated.View style={styles.loadingOverlay} entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
          <View style={styles.loadingContent}>
            <Animated.View style={[styles.loadingIconWrap, pulseStyle]}>
              <Ionicons name="sparkles" size={48} color={Colors.primary} />
            </Animated.View>
            <Text style={styles.loadingTitle}>Creating Your Look</Text>
            <Text style={styles.loadingMessage}>{loadingMessage}</Text>
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.loadingDot, dot1Style]} />
              <Animated.View style={[styles.loadingDot, dot2Style]} />
              <Animated.View style={[styles.loadingDot, dot3Style]} />
            </View>
          </View>
        </Animated.View>
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
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  photoWrap: {
    marginHorizontal: 16, borderRadius: 20, overflow: "hidden",
    height: 300, backgroundColor: Colors.surface, marginBottom: 20, position: "relative",
  },
  photo: { width: "100%", height: "100%", resizeMode: "cover" },
  readyBadge: {
    position: "absolute", top: 12, left: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
  },
  readyBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.white, letterSpacing: 0.5 },
  compareBtn: {
    position: "absolute", bottom: 12, right: 12,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.border,
  },
  compareBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  photoOverlayText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.white },
  photoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  photoPlaceholderIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.border, borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  photoPlaceholderTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text },
  photoPlaceholderSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  uploadBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8, marginTop: 4,
  },
  uploadBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.primary },
  selectHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, marginBottom: 12,
  },
  selectTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  selectedBadge: { backgroundColor: Colors.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  selectedBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: Colors.primary },
  catScroll: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  catChip: {
    paddingHorizontal: 14, height: 32, borderRadius: 16,
    backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  catChipTextActive: { color: Colors.white, fontFamily: "Inter_600SemiBold" },
  itemGrid: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 20, alignItems: "center" },
  itemCard: {
    width: 110, aspectRatio: 0.85, borderRadius: 14, overflow: "hidden",
    backgroundColor: Colors.card, borderWidth: 2, borderColor: Colors.border, position: "relative",
  },
  itemCardSelected: { borderColor: Colors.primary, borderWidth: 2.5 },
  itemImg: { width: "100%", height: "100%", resizeMode: "cover" },
  itemImgPlaceholder: { backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  checkBadge: {
    position: "absolute", top: 6, right: 6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.white, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  uploadCard: { alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: Colors.surface, borderStyle: "dashed" },
  uploadCardText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.5 },
  emptyItems: { alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  emptyItemsText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary },
  generateBtn: {
    marginHorizontal: 16, borderRadius: 16, height: 54,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.primary, marginBottom: 16,
  },
  generateBtnDisabled: { backgroundColor: Colors.border },
  generateBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(250, 251, 255, 0.97)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingContent: { alignItems: "center", gap: 16, paddingHorizontal: 40 },
  loadingIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  loadingTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text },
  loadingMessage: {
    fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.textSecondary,
    textAlign: "center",
  },
  loadingDots: { flexDirection: "row", gap: 8, marginTop: 8 },
  loadingDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
