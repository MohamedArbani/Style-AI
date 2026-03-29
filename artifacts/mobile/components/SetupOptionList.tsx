import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  LinearTransition,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

export type SetupOption = {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
};

type SetupOptionListProps = {
  options: SetupOption[];
  selected: string;
  onSelect: (id: string) => void;
  showIcon?: boolean;
};

export function SetupOptionList({
  options,
  selected,
  onSelect,
  showIcon = false,
}: SetupOptionListProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(400)}
      layout={LinearTransition.springify().damping(20)}
      style={styles.list}
    >
      {options.map((option) => {
        const isSelected = selected === option.id;
        return (
          <Pressable
            key={option.id}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(option.id)}
          >
            {showIcon && option.icon ? (
              <View
                style={[
                  styles.iconWrap,
                  isSelected && styles.iconWrapSelected,
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={isSelected ? Colors.white : Colors.textSecondary}
                />
              </View>
            ) : null}

            <View style={styles.textWrap}>
              <Text
                style={[
                  styles.label,
                  isSelected && styles.labelSelected,
                ]}
              >
                {option.label}
              </Text>
              {option.sublabel ? (
                <Text style={styles.sublabel}>{option.sublabel}</Text>
              ) : null}
            </View>

            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected ? (
                <Animated.View
                  entering={FadeIn.duration(100)}
                  style={styles.radioDot}
                />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    borderCurve: "continuous",
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderCurve: "continuous",
  },
  iconWrapSelected: {
    backgroundColor: Colors.primary,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.primary,
  },
  sublabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
