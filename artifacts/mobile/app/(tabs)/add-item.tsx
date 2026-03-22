import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { View } from "react-native";
import { getTabHref } from "@/utils/tab-navigation";

export default function AddItemProxyScreen() {
  useFocusEffect(
    useCallback(() => {
      const frameId = requestAnimationFrame(() => {
        router.replace(getTabHref());
        requestAnimationFrame(() => {
          router.push("/wardrobe/add");
        });
      });

      return () => cancelAnimationFrame(frameId);
    }, []),
  );

  return <View style={{ flex: 1 }} />;
}
