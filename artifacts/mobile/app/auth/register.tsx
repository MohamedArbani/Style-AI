import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import { useToast } from "@/components/Toast";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register, syncPreferencesToServer } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleRegister = async () => {
    if (!fullName.trim()) {
      toast.warning("Please enter your full name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.warning("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      // Sync locally-stored setup preferences to the server
      await syncPreferencesToServer();
      toast.success("Account created! Let's set up your profile.");
    } catch {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={[styles.container, { paddingTop: topInset }]}
        contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="hanger" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.appTitle}>Smart Wardrobe AI</Text>
          <Text style={styles.appTagline}>Personalize your style journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textTertiary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
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
            style={({ pressed }) => [styles.signUpBtn, { opacity: pressed || isLoading ? 0.8 : 1 }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.signUpText}>{isLoading ? "Creating account..." : "Sign Up"}</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </Pressable>

          <Pressable onPress={() => router.replace("/auth/login")}>
            <Text style={styles.loginLink}>
              Already have an account? <Text style={styles.loginLinkBold}>Log In</Text>
            </Text>
          </Pressable>
        </View>

        <Text style={styles.terms}>
          By signing up, you agree to our Terms of Service{"\n"}and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: { marginHorizontal: 20, marginBottom: 8, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 36, gap: 8 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: Colors.surface,
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  appTitle: { fontFamily: "Inter_700Bold", fontSize: 28, color: Colors.text },
  appTagline: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary },
  form: { paddingHorizontal: 20, gap: 20 },
  fieldGroup: { gap: 8 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  inputWrap: {
    flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card,
    paddingHorizontal: 14, height: 50,
  },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text },
  signUpBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, height: 54,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4,
  },
  signUpText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
  loginLink: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  loginLinkBold: { fontFamily: "Inter_600SemiBold", color: Colors.primary },
  terms: {
    fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary,
    textAlign: "center", marginTop: 24, lineHeight: 18, paddingHorizontal: 20,
  },
});
