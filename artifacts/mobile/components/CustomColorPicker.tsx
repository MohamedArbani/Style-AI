import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ColorPicker, {
  type ColorFormatsObject,
  HueSlider,
  Panel1,
  Preview,
} from "reanimated-color-picker";
import Colors from "@/constants/colors";

interface CustomColorPickerProps {
  selectedColor: string | null;
  onChange: (color: string) => void;
}

const DEFAULT_PICKER_COLOR = "#8B5CF6";

export function CustomColorPicker({ selectedColor, onChange }: CustomColorPickerProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [draftColor, setDraftColor] = useState(selectedColor ?? DEFAULT_PICKER_COLOR);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(360)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(360);
  }, [backdropOpacity, sheetTranslateY, visible]);

  useEffect(() => {
    setDraftColor(selectedColor ?? DEFAULT_PICKER_COLOR);
  }, [selectedColor]);

  const handleOpen = () => {
    setDraftColor(selectedColor ?? DEFAULT_PICKER_COLOR);
    setVisible(true);
  };

  const handleColorChange = (nextColor: ColorFormatsObject) => {
    setDraftColor(nextColor.hex);
  };

  const handleApply = () => {
    onChange(draftColor);
    setVisible(false);
  };

  return (
    <>
      <Pressable style={styles.triggerWrap} onPress={handleOpen}>
        <View style={[styles.outerRing, selectedColor ? styles.outerRingSelected : null]}>
          {selectedColor ? (
            <View style={[styles.innerCircle, { backgroundColor: selectedColor }]} />
          ) : (
            <LinearGradient
              colors={["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.innerCircle}
            />
          )}
        </View>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={() => setVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
          <Pressable style={styles.dismissLayer} onPress={() => setVisible(false)}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  paddingBottom: insets.bottom + 12,
                  transform: [{ translateY: sheetTranslateY }],
                },
              ]}
            >
              <Pressable onPress={event => event.stopPropagation()}>
                <View style={styles.handle} />

                <View style={styles.header}>
                  <Text style={styles.title}>Custom Color</Text>
                  <Pressable onPress={() => setVisible(false)} hitSlop={12}>
                    <Ionicons name="close" size={22} color={Colors.textSecondary} />
                  </Pressable>
                </View>

                <ColorPicker
                  value={draftColor}
                  onChangeJS={handleColorChange}
                  onCompleteJS={handleColorChange}
                  thumbSize={24}
                  thumbShape="circle"
                  boundedThumb
                  adaptSpectrum
                  style={styles.picker}
                >
                  <Preview
                    colorFormat="hex"
                    hideInitialColor
                    style={styles.preview}
                    textStyle={styles.previewText}
                  />
                  <Panel1 style={styles.panel} />
                  <HueSlider style={styles.slider} />
                </ColorPicker>

                <View style={styles.actions}>
                  <Pressable style={styles.secondaryAction} onPress={() => setVisible(false)}>
                    <Text style={styles.secondaryActionText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.primaryAction} onPress={handleApply}>
                    <Text style={styles.primaryActionText}>Apply</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerWrap: {
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
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 12, 38, 0.42)",
  },
  dismissLayer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  picker: {
    gap: 14,
  },
  preview: {
    height: 48,
    borderRadius: 16,
    marginBottom: 14,
  },
  previewText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.text,
  },
  panel: {
    borderRadius: 20,
    height: 220,
    marginBottom: 16,
  },
  slider: {
    borderRadius: 999,
    height: 28,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
  },
  secondaryActionText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  primaryAction: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  primaryActionText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.white,
  },
});
