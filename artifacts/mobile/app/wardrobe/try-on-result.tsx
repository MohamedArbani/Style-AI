import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { File as ExpoFile, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useToast } from "@/components/Toast";
import { saveTryOnResult } from "@/utils/try-on-storage";

function writeBase64ToCache(filename: string, base64: string): string {
  const file = new ExpoFile(Paths.cache, filename);
  file.write(base64, { encoding: "base64" });
  return file.uri;
}

export default function TryOnResultScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const params = useLocalSearchParams<{ imageBase64: string; description: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const imageUri = `data:image/png;base64,${params.imageBase64}`;

  const saveToGallery = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to save photos to your gallery.");
        setIsSaving(false);
        return;
      }

      const filename = `try-on-${Date.now()}.png`;
      const fileUri = writeBase64ToCache(filename, params.imageBase64);
      await MediaLibrary.saveToLibraryAsync(fileUri);
      toast.success("Saved to your photo gallery!");
    } catch {
      toast.error("Failed to save image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const shareImage = async () => {
    try {
      const filename = `try-on-${Date.now()}.png`;
      const fileUri = writeBase64ToCache(filename, params.imageBase64);
      await Sharing.shareAsync(fileUri, { mimeType: "image/png" });
    } catch {
      toast.error("Failed to share image.");
    }
  };

  const saveResult = async () => {
    if (isSaved) return;
    try {
      await saveTryOnResult({
        imageBase64: params.imageBase64,
        description: params.description,
        createdAt: new Date().toISOString(),
      });
      setIsSaved(true);
      toast.success("Outfit saved to your history!");
    } catch {
      toast.error("Failed to save outfit.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>AI Outfit Preview</Text>
        <Pressable style={styles.shareBtn} onPress={shareImage}>
          <Feather name="share" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
      >
        <Animated.View entering={FadeInDown.duration(500).springify()}>
          <View style={styles.imageWrap}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color={Colors.white} />
              <Text style={styles.aiBadgeText}>AI GENERATED</Text>
            </View>
          </View>
        </Animated.View>

        {params.description ? (
          <Animated.View style={styles.descriptionCard} entering={FadeInDown.delay(200).duration(400)}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.descriptionText}>{params.description}</Text>
          </Animated.View>
        ) : null}

        <Animated.View style={styles.actions} entering={FadeInDown.delay(350).duration(400)}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnPrimary, { opacity: pressed ? 0.85 : 1 }]}
            onPress={saveToGallery}
            disabled={isSaving}
          >
            <Ionicons name="download-outline" size={20} color={Colors.white} />
            <Text style={styles.actionBtnPrimaryText}>
              {isSaving ? "Saving..." : "Save to Gallery"}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.actionBtnSecondary, isSaved && styles.actionBtnSaved, { opacity: pressed ? 0.85 : 1 }]}
            onPress={saveResult}
            disabled={isSaved}
          >
            <Ionicons name={isSaved ? "checkmark-circle" : "bookmark-outline"} size={20} color={isSaved ? Colors.success : Colors.primary} />
            <Text style={[styles.actionBtnSecondaryText, isSaved && styles.actionBtnSavedText]}>
              {isSaved ? "Saved!" : "Save to History"}
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).duration(400)}>
          <Pressable
            style={({ pressed }) => [styles.newOutfitBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="sparkles" size={18} color={Colors.primary} />
            <Text style={styles.newOutfitBtnText}>Generate Another Outfit</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  shareBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 16, gap: 16 },
  imageWrap: {
    borderRadius: 24, overflow: "hidden",
    backgroundColor: Colors.surface, position: "relative",
  },
  image: { width: "100%", aspectRatio: 3 / 4, resizeMode: "cover" },
  aiBadge: {
    position: "absolute", top: 14, left: 14,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.primary, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  aiBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.white, letterSpacing: 0.5 },
  descriptionCard: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  descriptionText: {
    flex: 1, fontFamily: "Inter_400Regular", fontSize: 14,
    color: Colors.textSecondary, lineHeight: 20,
  },
  actions: { gap: 12 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 52, borderRadius: 16,
  },
  actionBtnPrimary: { backgroundColor: Colors.primary },
  actionBtnPrimaryText: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.white },
  actionBtnSecondary: {
    backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border,
  },
  actionBtnSecondaryText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.primary },
  actionBtnSaved: { borderColor: Colors.success, backgroundColor: "rgba(34, 197, 94, 0.08)" },
  actionBtnSavedText: { color: Colors.success },
  newOutfitBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14,
  },
  newOutfitBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.primary },
});
