import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import Colors from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs
      labelStyle={{
        fontFamily: "Inter_500Medium",
        fontSize: 11,
      }}
      iconColor={{
        default: Colors.textTertiary,
        selected: Colors.primary,
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="hanger" />
        <NativeTabs.Trigger.Label>Wardrobe</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ai-style">
        <NativeTabs.Trigger.Icon sf="sparkles" />
        <NativeTabs.Trigger.Label>AI Style</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="try-on">
        <NativeTabs.Trigger.Icon sf="camera.aperture" />
        <NativeTabs.Trigger.Label>Try-On</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : Colors.card,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: Colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.card }]} />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Wardrobe",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="hanger" tintColor={color} size={24} />
            ) : (
              <MaterialCommunityIcons name="hanger" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="ai-style"
        options={{
          title: "AI Style",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="sparkles" tintColor={color} size={24} />
            ) : (
              <Ionicons name="sparkles" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="try-on"
        options={{
          title: "Try-On",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="camera.aperture" tintColor={color} size={24} />
            ) : (
              <Feather name="aperture" size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person" tintColor={color} size={24} />
            ) : (
              <Feather name="user" size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
