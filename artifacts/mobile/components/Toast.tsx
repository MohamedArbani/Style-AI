import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export type ToastType = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  show: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_CONFIG: Record<ToastType, { bg: string; icon: string; iconColor: string; border: string }> = {
  success: { bg: "#F0FDF4", icon: "checkmark-circle", iconColor: "#22C55E", border: "#BBF7D0" },
  error: { bg: "#FEF2F2", icon: "close-circle", iconColor: "#EF4444", border: "#FECACA" },
  warning: { bg: "#FFFBEB", icon: "warning", iconColor: "#F59E0B", border: "#FDE68A" },
  info: { bg: "#EFF6FF", icon: "information-circle", iconColor: "#3B82F6", border: "#BFDBFE" },
};

function SingleToast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 65,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 65,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => dismiss(), item.duration ?? 3500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(item.id));
  };

  const config = TOAST_CONFIG[item.type];

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }, { scale }] }]}>
      <Pressable
        style={[styles.toastInner, { backgroundColor: config.bg, borderColor: config.border }]}
        onPress={dismiss}
      >
        <View style={[styles.iconWrap, { backgroundColor: config.iconColor + "20" }]}>
          <Ionicons name={config.icon as never} size={20} color={config.iconColor} />
        </View>
        <Text style={[styles.message, { color: Colors.text }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Pressable onPress={dismiss} style={styles.closeBtn} hitSlop={8}>
          <Ionicons name="close" size={16} color={Colors.textTertiary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string, type: ToastType = "info", duration?: number) => {
    const id = `toast-${++idRef.current}-${Date.now()}`;
    setToasts(prev => [...prev.slice(-2), { id, message, type, duration }]);
  }, []);

  const success = useCallback((msg: string, dur?: number) => show(msg, "success", dur), [show]);
  const error = useCallback((msg: string, dur?: number) => show(msg, "error", dur), [show]);
  const warning = useCallback((msg: string, dur?: number) => show(msg, "warning", dur), [show]);
  const info = useCallback((msg: string, dur?: number) => show(msg, "info", dur), [show]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      <View style={[styles.container, { top: topInset + 8 }]} pointerEvents="box-none">
        {toasts.map(item => (
          <SingleToast key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
    pointerEvents: "box-none",
  },
  toast: {
    width: "100%",
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 20,
  },
  closeBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
