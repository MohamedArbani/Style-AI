import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, isOnboarded } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter your email and password");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      if (isOnboarded) {
        router.replace("/(tabs)");
      } else {
        router.replace("/setup/language");
      }
    } catch {
      Alert.alert("Error", "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { paddingTop: topInset }]}
        contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>

        <Text style={styles.appName}>SMART WARDROBE AI</Text>

        <View style={styles.heroBanner}>
          <View style={styles.heroBannerContent}>
            <MaterialCommunityIcons name="hanger" size={48} color={Colors.white} />
            <Text style={styles.heroTitle}>Your AI Stylist Awaits</Text>
            <Text style={styles.heroSub}>Organize your closet with intelligence</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <Pressable>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={18} color={Colors.textTertiary} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.signInBtn, { opacity: pressed || isLoading ? 0.8 : 1 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.signInText}>{isLoading ? "Signing in..." : "Sign In"}</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialBtn}>
              <Ionicons name="logo-google" size={20} color={Colors.text} />
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
            <Pressable style={[styles.socialBtn, { backgroundColor: Colors.text }]}>
              <Ionicons name="logo-apple" size={20} color={Colors.white} />
              <Text style={[styles.socialText, { color: Colors.white }]}>Apple</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.replace("/auth/register")}>
            <Text style={styles.signupLink}>
              Don&apos;t have an account? <Text style={styles.signupLinkBold}>Sign up now</Text>
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>POWERED BY WARDROBE AI ENGINE V2.4</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backBtn: {
    marginHorizontal: 20,
    marginBottom: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 2,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  heroBanner: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    height: 160,
    overflow: "hidden",
    marginBottom: 32,
  },
  heroBannerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.white,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  forgotText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.primary,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: Colors.text,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  signInText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.white,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    height: 48,
  },
  socialText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  signupLink: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  signupLinkBold: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  footer: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.textTertiary,
    textAlign: "center",
    marginTop: 32,
    textTransform: "uppercase",
  },
});
