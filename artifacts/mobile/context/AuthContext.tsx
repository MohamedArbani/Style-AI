import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  gender?: string;
  ageRange?: string;
  height?: number;
  heightUnit?: "cm" | "ft";
  stylePreferences?: string[];
  language?: string;
};

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "smart_wardrobe_user";
const ONBOARDED_KEY = "smart_wardrobe_onboarded";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [userData, onboardedData] = await Promise.all([
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(ONBOARDED_KEY),
      ]);
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setIsOnboarded(onboardedData === "true");
    } catch (err) {
      console.error("Error loading user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: UserProfile) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email: string, _password: string) => {
    // Mock login - in production would verify credentials
    const existingData = await AsyncStorage.getItem(USER_KEY);
    if (existingData) {
      const existingUser = JSON.parse(existingData);
      if (existingUser.email === email) {
        setUser(existingUser);
        return;
      }
    }
    const newUser: UserProfile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fullName: email.split("@")[0],
      email,
    };
    await saveUser(newUser);
  };

  const register = async (fullName: string, email: string, _password: string) => {
    const newUser: UserProfile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fullName,
      email,
    };
    await saveUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([USER_KEY, ONBOARDED_KEY]);
    setUser(null);
    setIsOnboarded(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await saveUser(updated);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    setIsOnboarded(true);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isOnboarded, login, register, logout, updateProfile, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
