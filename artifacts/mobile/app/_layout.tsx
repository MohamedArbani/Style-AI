import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { WardrobeProvider } from "@/context/WardrobeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — avoid refetching on tab switches
      retry: 2,
    },
  },
});

function RootLayoutNav() {
  const { user, isLoading, isOnboarded, flowStage } = useAuth();
  const segments = useSegments();
  const hasInitialRouted = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0];
    const inAuthGroup = firstSegment === "auth";
    const inTabsGroup = firstSegment === "(tabs)";
    const inWardrobeGroup = firstSegment === "wardrobe";

    // Guard: authenticated users cannot access auth pages
    if (user && inAuthGroup) {
      router.replace("/(tabs)");
      return;
    }

    // Guard: unauthenticated users cannot access protected pages
    if (!user && (inTabsGroup || inWardrobeGroup)) {
      router.replace("/onboarding");
      return;
    }

    // Initial routing (runs once on app load)
    if (!hasInitialRouted.current) {
      hasInitialRouted.current = true;

      if (user && isOnboarded) {
        router.replace("/(tabs)");
        return;
      }

      if (!user) {
        switch (flowStage) {
          case "register":
            router.replace("/auth/register");
            break;
          case "premium":
            router.replace("/premium");
            break;
          case "ai-plan":
            router.replace("/setup/ai-plan");
            break;
          case "setup":
            router.replace("/setup/language");
            break;
          case "complete":
          case "onboarding":
          default:
            router.replace("/onboarding");
            break;
        }
      }
    }
  }, [user, isLoading, isOnboarded, flowStage, segments]);

  const glassSheets = isLiquidGlassAvailable();

  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="setup/language" />
      <Stack.Screen name="setup/gender" />
      <Stack.Screen name="setup/age" />
      <Stack.Screen name="setup/height" />
      <Stack.Screen name="setup/style" />
      <Stack.Screen name="setup/ai-plan" />
      <Stack.Screen
        name="wardrobe/[id]"
        options={{
          headerShown: true,
          title: "Item Details",
          headerTransparent: true,
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="wardrobe/add"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          ...(glassSheets ? { contentStyle: { backgroundColor: "transparent" } } : {}),
        }}
      />
      <Stack.Screen
        name="wardrobe/try-on-result"
        options={{
          headerShown: false,
          title: "AI Outfit Preview",
          animation: "default",
        }}
      />
      <Stack.Screen name="premium" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <WardrobeProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <ToastProvider>
                    <RootLayoutNav />
                  </ToastProvider>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </WardrobeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
