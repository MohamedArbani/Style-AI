import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { DynamicColorIOS, Platform, StyleSheet, View } from "react-native";
import Colors from "@/constants/colors";
import { setLastTabRouteName } from "@/utils/tab-navigation";

const adaptiveTint = Platform.OS === "ios"
  ? DynamicColorIOS({ light: Colors.primary, dark: Colors.primaryLight })
  : undefined;

function NativeTabLayout() {
  return (
    <NativeTabs
      screenListeners={({ route }) => ({
        focus: () => {
          if (route.name !== "add-item") {
            setLastTabRouteName(route.name);
          }
        },
      })}
      labelStyle={{
        fontFamily: "Inter_500Medium",
        fontSize: 11,
      }}
      tintColor={adaptiveTint}
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="hanger" md="checkroom" />
        <NativeTabs.Trigger.Label>Wardrobe</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add-item" role="search" disablePopToTop disableScrollToTop>
        <NativeTabs.Trigger.Icon sf={{ default: "plus", selected: "plus" }} md="add" />
        <NativeTabs.Trigger.Label hidden>Add</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ai-style">
        <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
        <NativeTabs.Trigger.Label>AI Style</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="try-on">
        <NativeTabs.Trigger.Icon sf="camera.aperture" md="camera" />
        <NativeTabs.Trigger.Label>Try-On</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
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
        name="add-item"
        options={{
          href: null,
        }}
      />
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
