import { Platform } from "react-native";

export const getApiBase = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const adaptedUrl =
    Platform.OS === "android"
      ? apiUrl?.replace("localhost", "10.0.2.2")
      : apiUrl;
  if (adaptedUrl) return adaptedUrl;
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api-server`;
  return "";
};
