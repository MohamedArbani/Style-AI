import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiBase } from "@/utils/api";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  gender?: string | null;
  ageRange?: string | null;
  height?: string | null;
  heightUnit?: string | null;
  stylePreferences?: string[];
  language?: string | null;
  isOnboarded?: boolean;
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

const SESSION_KEY = "smart_wardrobe_session_v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData) as UserProfile;
        try {
          const res = await fetch(`${getApiBase()}/api/auth/user/${session.id}`);
          if (res.ok) {
            const data = await res.json();
            const refreshed = data.user as UserProfile;
            setUser(refreshed);
            setIsOnboarded(refreshed.isOnboarded ?? false);
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(refreshed));
            return;
          }
        } catch {
          // Network error, use cached session
        }
        setUser(session);
        setIsOnboarded(session.isOnboarded ?? false);
      }
    } catch (err) {
      console.error("Error loading session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSession = async (userData: UserProfile) => {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsOnboarded(userData.isOnboarded ?? false);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${getApiBase()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    await saveSession(data.user as UserProfile);
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await fetch(`${getApiBase()}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    await saveSession(data.user as UserProfile);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsOnboarded(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const res = await fetch(`${getApiBase()}/api/auth/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) {
        await saveSession(data.user as UserProfile);
        return;
      }
    } catch {
      // Fallback to local update
    }
    await saveSession({ ...user, ...updates });
  };

  const completeOnboarding = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${getApiBase()}/api/auth/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnboarded: true }),
      });
      const data = await res.json();
      if (res.ok) {
        await saveSession(data.user as UserProfile);
        return;
      }
    } catch {
      // Fallback
    }
    await saveSession({ ...user, isOnboarded: true });
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
