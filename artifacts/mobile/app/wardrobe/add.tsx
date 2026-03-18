import { Feather, Ionicons } from "@expo/vector-icons";
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
import Colors from "@/constants/colors";
import { useWardrobe } from "@/context/WardrobeContext";

const CATEGORIES = ["Tops & T-shirts", "Shirts", "Jackets & Coats", "Bottoms", "Dresses", "Shoes", "Accessories", "Sportswear", "Outerwear"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "All Season"];
const COLORS_LIST = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Navy", hex: "#1B2CC1" },
  { name: "Grey", hex: "#9CA3AF" },
  { name: "Beige", hex: "#D4B896" },
  { name: "Brown", hex: "#92400E" },
  { name: "Red", hex: "#EF4444" },
  { name: "Green", hex: "#22C55E" },
  { name: "Yellow", hex: "#F59E0B" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#8B5CF6" },
];

export default function AddItemScreen() {
  const insets = useSafeAreaInsets();
  const { addItem, scanItem } = useWardrobe();

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

  const pickImage = async (fromCamera = false) => {
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true,
      });
    }
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
    }
  };

  const handleScan = async () => {
    if (!imageBase64) {
      Alert.alert("No Image", "Please add a photo first");
      return;
    }
    setIsScanning(true);
    try {
      const result = await scanItem(imageBase64);
      if (result.name) setName(result.name);
      if (result.category) setCategory(result.category);
      if (result.color) setColor(result.color);
      if (result.season) setSeason(result.season);
      if (result.tags) setTags(result.tags);
    } catch {
      Alert.alert("Error", "Failed to scan item");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!name) { Alert.alert("Missing", "Please enter a name for the item"); return; }
    setIsSaving(true);
    try {
      await addItem({ name, category, color, season, brand, notes, tags, imageUrl: imageUri ?? undefined });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
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
          <Pressable
            style={styles.imageWrap}
            onPress={() => Alert.alert("Add Photo", "", [
              { text: "Camera", onPress: () => pickImage(true) },
              { text: "Library", onPress: () => pickImage(false) },
              { text: "Cancel", style: "cancel" },
            ])}
          >
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <Pressable
                  style={styles.cameraBtn}
                  onPress={() => Alert.alert("Change Photo", "", [
                    { text: "Camera", onPress: () => pickImage(true) },
                    { text: "Library", onPress: () => pickImage(false) },
                    { text: "Cancel", style: "cancel" },
                  ])}
                >
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
            <Text style={styles.scanBtnText}>{isScanning ? "Scanning..." : "AI Scan Details"}</Text>
          </Pressable>

          {tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>AI SUGGESTIONS</Text>
              <View style={styles.tagsRow}>
                {tags.map((tag, i) => (
                  <Pressable
                    key={i}
                    style={styles.tag}
                    onPress={() => setTags(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                    <Ionicons name="checkmark" size={12} color={Colors.primary} />
                  </Pressable>
                ))}
                <Pressable style={styles.addTagBtn}>
                  <Ionicons name="add" size={14} color={Colors.primary} />
                  <Text style={styles.addTagText}>Add Tag</Text>
                </Pressable>
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

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Category</Text>
              <Pressable style={styles.select} onPress={() => setShowCatPicker(!showCatPicker)}>
                <Text style={styles.selectText}>{category}</Text>
                <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
              </Pressable>
              {showCatPicker && (
                <View style={styles.dropdown}>
                  {CATEGORIES.map(cat => (
                    <Pressable
                      key={cat}
                      style={[styles.dropdownItem, cat === category && styles.dropdownItemActive]}
                      onPress={() => { setCategory(cat); setShowCatPicker(false); }}
                    >
                      <Text style={[styles.dropdownItemText, cat === category && styles.dropdownItemTextActive]}>{cat}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Color</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
                  {COLORS_LIST.map(c => (
                    <Pressable
                      key={c.name}
                      style={[styles.colorSwatch, { backgroundColor: c.hex }, color === c.name && styles.colorSwatchSelected]}
                      onPress={() => setColor(c.name)}
                    >
                      {color === c.name && <Ionicons name="checkmark" size={14} color={c.name === "White" ? Colors.text : Colors.white} />}
                    </Pressable>
                  ))}
                </ScrollView>
                <Text style={styles.colorName}>{color}</Text>
              </View>

              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Season</Text>
                <Pressable style={styles.select} onPress={() => setShowSeasonPicker(!showSeasonPicker)}>
                  <Text style={styles.selectText}>{season}</Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
                </Pressable>
                {showSeasonPicker && (
                  <View style={[styles.dropdown, { zIndex: 100 }]}>
                    {SEASONS.map(s => (
                      <Pressable
                        key={s}
                        style={[styles.dropdownItem, s === season && styles.dropdownItemActive]}
                        onPress={() => { setSeason(s); setShowSeasonPicker(false); }}
                      >
                        <Text style={[styles.dropdownItemText, s === season && styles.dropdownItemTextActive]}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Brand</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Everlane"
                placeholderTextColor={Colors.textTertiary}
                value={brand}
                onChangeText={setBrand}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Notes</Text>
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
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8,
  },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: Colors.white },
  imageWrap: {
    marginHorizontal: 16, borderRadius: 16, overflow: "hidden",
    height: 240, backgroundColor: Colors.surface, marginBottom: 12, position: "relative",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
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
  addTagBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: "dashed",
  },
  addTagText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.primary },
  form: { paddingHorizontal: 16, gap: 16 },
  field: { gap: 6 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  input: {
    borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.card, paddingHorizontal: 14, height: 46,
    fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text,
  },
  textarea: { height: 80, paddingTop: 12 },
  select: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.card, paddingHorizontal: 14, height: 46,
  },
  selectText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text },
  dropdown: {
    position: "absolute", top: 80, left: 0, right: 0, zIndex: 50,
    backgroundColor: Colors.card, borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8,
    maxHeight: 180, overflow: "scroll",
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownItemActive: { backgroundColor: Colors.surface },
  dropdownItemText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text },
  dropdownItemTextActive: { fontFamily: "Inter_600SemiBold", color: Colors.primary },
  row: { flexDirection: "row", gap: 12 },
  colorScroll: { gap: 8, paddingVertical: 4 },
  colorSwatch: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  colorSwatchSelected: { borderWidth: 2.5, borderColor: Colors.primary },
  colorName: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
});
