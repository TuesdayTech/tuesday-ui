import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Profile } from "../types/profile";
import { tokenStore, profileStore } from "../lib/api/token";

interface AuthState {
  token: string | null;
  profile: Profile | null;
  isLoading: boolean;
  setAuth: (token: string, profile: Profile) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([tokenStore.get(), profileStore.get()]).then(
      ([storedToken, storedProfile]) => {
        if (storedToken) setToken(storedToken);
        if (storedProfile) setProfile(storedProfile);
        setIsLoading(false);
      },
    );
  }, []);

  const setAuth = useCallback(async (newToken: string, newProfile: Profile) => {
    await Promise.all([tokenStore.set(newToken), profileStore.set(newProfile)]);
    setToken(newToken);
    setProfile(newProfile);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([tokenStore.clear(), profileStore.clear()]);
    setToken(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, profile, isLoading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
