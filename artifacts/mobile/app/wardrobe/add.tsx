import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ColorSwatchList } from "@/components/ColorSwatchList";
import Colors from "@/constants/colors";
import { OptionPicker } from "@/components/OptionPicker";
import { useToast } from "@/components/Toast";
import { useWardrobe } from "@/context/WardrobeContext";
import { getTabHref } from "@/utils/tab-navigation";

const CATEGORIES = ["Tops & T-shirts", "Shirts", "Jackets & Coats", "Bottoms", "Dresses", "Shoes", "Accessories", "Sportswear", "Outerwear"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "All Season"];

function isKnownCategory(value: string) {
  return CATEGORIES.includes(value);
}

function isKnownSeason(value: string) {
  return SEASONS.includes(value);
}

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const { addItem, scanItem } = useWardrobe();
  const toast = useToast();

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [color, setColor] = useState("White");
  const [season, setSeason] = useState(SEASONS[4]);
  const [brand, setBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const closeScreen = () => {
    const target = getTabHref();
    if (router.canDismiss()) {
      router.dismissTo(target);
      return;
    }
    router.replace(target);
  };

  const pickImage = async (fromCamera = false) => {
    let result;
    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        toast.warning("Camera access is required to take photos");
        return;
      }
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        toast.warning("Photo library access is required to select photos");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true });
    }
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
      toast.info("Photo added! Tap 'AI Scan Details' to auto-fill the form.");
    }
  };

  const showImagePicker = () => {
    if (Platform.OS === "web") {
      pickImage(false);
      return;
    }
    Alert.alert(
      "Add Photo",
      "Choose how to add a photo of your clothing item",
      [
        { text: "Camera", onPress: () => pickImage(true) },
        { text: "Photo Library", onPress: () => pickImage(false) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleScan = async () => {
    if (!imageBase64) {
      toast.warning("Please add a photo first to use AI scan");
      return;
    }
    setIsScanning(true);
    try {
      const result = await scanItem(imageBase64);
      let filled = 0;
      if (result.name) { setName(result.name); filled++; }
      if (result.category && isKnownCategory(result.category)) { setCategory(result.category); filled++; }
      if (result.color) { setColor(result.color); filled++; }
      if (result.season && isKnownSeason(result.season)) { setSeason(result.season); filled++; }
      if (result.brand) { setBrand(result.brand); filled++; }
      if (result.notes) { setNotes(result.notes); filled++; }
      if (result.tags) { setTags(result.tags); filled++; }
      toast.success(`AI filled in ${filled} field${filled !== 1 ? "s" : ""} automatically`);
    } catch {
      toast.error("AI scan failed. Please fill in the details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.warning("Please enter a name for this item");
      return;
    }
    setIsSaving(true);
    try {
      const imageUrl = imageBase64
        ? `data:image/jpeg;base64,${imageBase64}`
        : imageUri ?? undefined;
      await addItem({ name: name.trim(), category, color, season, brand, notes, tags, imageUrl });
      toast.success(`"${name}" added to your wardrobe!`);
      closeScreen();
    } catch {
      toast.error("Failed to save item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.container, { paddingTop: Platform.OS === "ios" ? 0 : topInset }]}>
        <View style={styles.header}>
          <Pressable onPress={closeScreen}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Add to Wardrobe</Text>
          <Pressable
            style={({ pressed }) => [styles.saveBtn, { opacity: pressed || isSaving ? 0.8 : 1 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.imageWrap} onPress={showImagePicker}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <Pressable style={styles.cameraBtn} onPress={showImagePicker}>
                  <Ionicons name="camera" size={18} color={Colors.white} />
                </Pressable>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={40} color={Colors.border} />
                <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.scanBtn, { opacity: pressed || isScanning ? 0.8 : 1 }]}
            onPress={handleScan}
            disabled={isScanning || !imageUri}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="sparkles" size={16} color={Colors.primary} />
            )}
            <Text style={styles.scanBtnText}>{isScanning ? "Scanning with AI..." : "AI Scan Details"}</Text>
          </Pressable>

          {tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>AI SUGGESTIONS</Text>
              <View style={styles.tagsRow}>
                {tags.map((tag, i) => (
                  <Pressable
                    key={i}
                    style={styles.tag}
                    onPress={() => {
                      setTags(prev => prev.filter((_, idx) => idx !== i));
                      toast.info(`Tag "${tag}" removed`);
                    }}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                    <Ionicons name="close" size={12} color={Colors.textSecondary} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. White Linen Shirt"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.field, { zIndex: 20 }]}>
              <Text style={styles.fieldLabel}>Category</Text>
              <OptionPicker
                label="Category"
                value={category}
                options={CATEGORIES}
                onChange={setCategory}
                visible={showCatPicker}
                onOpen={() => setShowCatPicker(true)}
                onClose={() => setShowCatPicker(false)}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Color</Text>
              <ColorSwatchList value={color} onChange={setColor} />
            </View>

            <View style={[styles.field, { zIndex: 10 }]}>
              <Text style={styles.fieldLabel}>Season</Text>
              <OptionPicker
                label="Season"
                value={season}
                options={SEASONS}
                onChange={setSeason}
                visible={showSeasonPicker}
                onOpen={() => setShowSeasonPicker(true)}
                onClose={() => setShowSeasonPicker(false)}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Brand <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Everlane"
                placeholderTextColor={Colors.textTertiary}
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Notes <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Add any extra details..."
                placeholderTextColor={Colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.white },
  imageWrap: {
    marginHorizontal: 16, borderRadius: 16, overflow: "hidden",
    height: 220, backgroundColor: Colors.surface, marginBottom: 12, position: "relative",
  },
  image: { width: "100%", height: "100%", resizeMode: "contain" },
  cameraBtn: {
    position: "absolute", bottom: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
  },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  imagePlaceholderText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary },
  scanBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginHorizontal: 16, borderRadius: 12, backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border, height: 46, marginBottom: 16,
  },
  scanBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.primary },
  tagsSection: { paddingHorizontal: 16, marginBottom: 16 },
  tagsLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.textTertiary, letterSpacing: 0.5, marginBottom: 8 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.border,
  },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.text },
  form: { paddingHorizontal: 16, gap: 16 },
  field: { gap: 6 },
  optional: { fontFamily: "Inter_400Regular", color: Colors.textTertiary, fontSize: 12 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  input: {
    borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.card, paddingHorizontal: 14, height: 46,
    fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text,
  },
  textarea: { height: 80, paddingTop: 12 },
});
