import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

interface OptionPickerProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function OptionPicker({
  label,
  value,
  options,
  onChange,
  visible,
  onOpen,
  onClose,
}: OptionPickerProps) {
  const insets = useSafeAreaInsets();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(320)).current;

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
    sheetTranslateY.setValue(320);
  }, [backdropOpacity, sheetTranslateY, visible]);

  const handleSelect = (option: string) => {
    onChange(option);
    onClose();
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.trigger, { opacity: pressed ? 0.7 : 1 }]}
        onPress={onOpen}
      >
        <Text style={styles.triggerText}>{value}</Text>
        <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
          <Pressable style={styles.dismissLayer} onPress={onClose}>
            <Animated.View
              style={[
                styles.sheet,
                {
                  paddingBottom: insets.bottom + 8,
                  transform: [{ translateY: sheetTranslateY }],
                },
              ]}
            >
              <Pressable onPress={e => e.stopPropagation()}>
                <View style={styles.handle} />

                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{label}</Text>
                  <Pressable onPress={onClose} hitSlop={12}>
                    <Ionicons name="close" size={22} color={Colors.textSecondary} />
                  </Pressable>
                </View>

                <ScrollView
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {options.map(option => {
                    const isSelected = option === value;
                    return (
                      <Pressable
                        key={option}
                        style={({ pressed }) => [
                          styles.option,
                          isSelected && styles.optionSelected,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                        onPress={() => handleSelect(option)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </Pressable>
            </Animated.View>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    height: 46,
  },
  triggerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.text,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  dismissLayer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    maxHeight: "70%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sheetTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: Colors.text,
  },
  list: {
    paddingHorizontal: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 2,
  },
  optionSelected: {
    backgroundColor: Colors.surface,
  },
  optionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  optionTextSelected: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
});
