import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

/** Local-only preferences collected during setup before sign-up */
export type SetupPreferences = {
  language?: string;
  gender?: string;
  ageRange?: string;
  height?: string;
  heightUnit?: string;
  stylePreferences?: string[];
};

/**
 * Tracks where the user is in the onboarding/setup flow.
 * Persisted to AsyncStorage so the user can resume after closing the app.
 */
export type FlowStage =
  | "onboarding"   // First launch, show onboarding
  | "setup"        // Setup screens (language → style)
  | "ai-plan"      // AI plan loading screen
  | "premium"      // Paywall
  | "register"     // Sign-up
  | "complete";    // Done — show main tabs

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  flowStage: FlowStage;
  setupPreferences: SetupPreferences;
  setFlowStage: (stage: FlowStage) => Promise<void>;
  updateSetupPreferences: (updates: Partial<SetupPreferences>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  syncPreferencesToServer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "smart_wardrobe_session_v2";
const SETUP_PREFS_KEY = "smart_wardrobe_setup_prefs";
const FLOW_STAGE_KEY = "smart_wardrobe_flow_stage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [flowStage, setFlowStageState] = useState<FlowStage>("onboarding");
  const [setupPreferences, setSetupPreferencesState] = useState<SetupPreferences>({});

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      // Load flow stage
      const savedStage = await AsyncStorage.getItem(FLOW_STAGE_KEY);
      if (savedStage) {
        setFlowStageState(savedStage as FlowStage);
      }

      // Load local setup preferences
      const savedPrefs = await AsyncStorage.getItem(SETUP_PREFS_KEY);
      if (savedPrefs) {
        setSetupPreferencesState(JSON.parse(savedPrefs) as SetupPreferences);
      }

      // Load user session
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
            // If user is fully onboarded, ensure flow stage is complete
            if (refreshed.isOnboarded) {
              setFlowStageState("complete");
              await AsyncStorage.setItem(FLOW_STAGE_KEY, "complete");
            }
            return;
          }
        } catch {
          // Network error, use cached session
        }
        setUser(session);
        setIsOnboarded(session.isOnboarded ?? false);
        if (session.isOnboarded) {
          setFlowStageState("complete");
        }
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

  const setFlowStage = useCallback(async (stage: FlowStage) => {
    setFlowStageState(stage);
    await AsyncStorage.setItem(FLOW_STAGE_KEY, stage);
  }, []);

  const updateSetupPreferences = useCallback(async (updates: Partial<SetupPreferences>) => {
    setSetupPreferencesState((prev) => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem(SETUP_PREFS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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
    await AsyncStorage.removeItem(SETUP_PREFS_KEY);
    await AsyncStorage.removeItem(FLOW_STAGE_KEY);
    setUser(null);
    setIsOnboarded(false);
    setFlowStageState("onboarding");
    setSetupPreferencesState({});
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

  /** Sync locally-stored setup preferences to the server after registration */
  const syncPreferencesToServer = useCallback(async () => {
    if (!user) return;
    const prefs = setupPreferences;
    const payload: Partial<UserProfile> = {
      language: prefs.language,
      gender: prefs.gender,
      ageRange: prefs.ageRange,
      height: prefs.height,
      heightUnit: prefs.heightUnit,
      stylePreferences: prefs.stylePreferences,
      isOnboarded: true,
    };
    try {
      const res = await fetch(`${getApiBase()}/api/auth/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        await saveSession(data.user as UserProfile);
        setIsOnboarded(true);
        await setFlowStage("complete");
        return;
      }
    } catch {
      // Fallback
    }
    await saveSession({ ...user, ...payload });
    setIsOnboarded(true);
    await setFlowStage("complete");
  }, [user, setupPreferences, setFlowStage]);

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
        await setFlowStage("complete");
        return;
      }
    } catch {
      // Fallback
    }
    await saveSession({ ...user, isOnboarded: true });
    await setFlowStage("complete");
  };

  return (
    <AuthContext.Provider
      value={{
        user, isLoading, isOnboarded,
        flowStage, setupPreferences,
        setFlowStage, updateSetupPreferences,
        login, register, logout, updateProfile,
        completeOnboarding, syncPreferencesToServer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
