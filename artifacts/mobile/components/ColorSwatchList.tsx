import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { CustomColorPicker } from "@/components/CustomColorPicker";

export type WardrobeColorOption = {
  name: string;
  hex: string;
  aliases?: string[];
};

export const WARDROBE_COLOR_OPTIONS: WardrobeColorOption[] = [
  { name: "White", hex: "#FFFFFF", aliases: ["off white", "ivory", "cream"] },
  { name: "Black", hex: "#000000", aliases: ["jet black", "charcoal"] },
  { name: "Navy", hex: "#1B2CC1", aliases: ["navy blue", "midnight blue"] },
  { name: "Grey", hex: "#9CA3AF", aliases: ["gray", "slate", "ash"] },
  { name: "Beige", hex: "#D4B896", aliases: ["sand", "tan", "camel"] },
  { name: "Brown", hex: "#92400E", aliases: ["chocolate", "coffee", "mocha"] },
  { name: "Red", hex: "#EF4444", aliases: ["burgundy", "maroon", "crimson"] },
  { name: "Green", hex: "#22C55E", aliases: ["olive", "forest green", "sage"] },
  { name: "Yellow", hex: "#F59E0B", aliases: ["mustard", "gold"] },
  { name: "Blue", hex: "#3B82F6", aliases: ["sky blue", "light blue", "royal blue"] },
  { name: "Pink", hex: "#EC4899", aliases: ["rose", "blush", "fuchsia"] },
  { name: "Purple", hex: "#8B5CF6", aliases: ["violet", "lavender", "lilac"] },
];

const CSS_COLOR_HEX: Record<string, string> = {
  white: "#FFFFFF",
  black: "#000000",
  navy: "#1B2CC1",
  blue: "#3B82F6",
  green: "#22C55E",
  red: "#EF4444",
  yellow: "#F59E0B",
  pink: "#EC4899",
  purple: "#8B5CF6",
  grey: "#9CA3AF",
  gray: "#9CA3AF",
  beige: "#D4B896",
  brown: "#92400E",
  orange: "#F97316",
  teal: "#14B8A6",
  cyan: "#06B6D4",
  magenta: "#D946EF",
  maroon: "#7F1D1D",
  burgundy: "#881337",
  olive: "#6B8E23",
  gold: "#D4AF37",
  silver: "#C0C0C0",
};

const KEYWORD_HEX: Array<[string, string]> = [
  ["white", "#FFFFFF"],
  ["black", "#000000"],
  ["navy", "#1B2CC1"],
  ["blue", "#3B82F6"],
  ["green", "#22C55E"],
  ["yellow", "#F59E0B"],
  ["red", "#EF4444"],
  ["pink", "#EC4899"],
  ["purple", "#8B5CF6"],
  ["grey", "#9CA3AF"],
  ["gray", "#9CA3AF"],
  ["beige", "#D4B896"],
  ["brown", "#92400E"],
  ["orange", "#F97316"],
];

const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

interface ColorSwatchListProps {
  value: string;
  onChange: (value: string) => void;
  options?: WardrobeColorOption[];
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

function normalizeHex(value: string) {
  const trimmed = value.trim();
  if (!HEX_COLOR_REGEX.test(trimmed)) {
    return null;
  }

  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return trimmed.toUpperCase();
}

export function resolveColorSelection(value: string, options: WardrobeColorOption[] = WARDROBE_COLOR_OPTIONS) {
  const normalized = normalizeText(value);
  const presetOption = options.find(option => {
    const names = [option.name, ...(option.aliases ?? [])].map(normalizeText);
    return names.includes(normalized);
  }) ?? null;

  if (presetOption) {
    return {
      presetOption,
      customHex: null,
      displayLabel: presetOption.name,
    };
  }

  const normalizedHex = normalizeHex(value);
  if (normalizedHex) {
    return {
      presetOption: null,
      customHex: normalizedHex,
      displayLabel: normalizedHex,
    };
  }

  const cssHex = CSS_COLOR_HEX[normalized];
  if (cssHex) {
    return {
      presetOption: null,
      customHex: cssHex,
      displayLabel: value,
    };
  }

  const keywordMatch = KEYWORD_HEX.find(([keyword]) => normalized.includes(keyword));
  if (keywordMatch) {
    return {
      presetOption: null,
      customHex: keywordMatch[1],
      displayLabel: value,
    };
  }

  return {
    presetOption: null,
    customHex: Colors.primaryLight,
    displayLabel: value || "Custom color",
  };
}

export function ColorSwatchList({ value, onChange, options = WARDROBE_COLOR_OPTIONS }: ColorSwatchListProps) {
  const selection = resolveColorSelection(value, options);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <CustomColorPicker
          selectedColor={selection.customHex}
          onChange={onChange}
        />

        {options.map(option => {
          const isSelected = selection.presetOption?.name === option.name;
          return (
            <Pressable
              key={option.name}
              style={styles.swatchWrap}
              onPress={() => onChange(option.name)}
            >
              <View style={[styles.outerRing, isSelected ? styles.outerRingSelected : null]}>
                <View
                  style={[
                    styles.innerCircle,
                    { backgroundColor: option.hex },
                    option.name === "White" ? styles.whiteInnerCircle : null,
                  ]}
                >
                  {isSelected ? (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={option.name === "White" ? Colors.text : Colors.white}
                    />
                  ) : null}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={styles.label}>{selection.displayLabel}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 10,
    paddingVertical: 4,
  },
  swatchWrap: {
    paddingVertical: 2,
  },
  outerRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 3,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  outerRingSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 5,
  },
  innerCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  whiteInnerCircle: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
