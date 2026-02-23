import * as SecureStore from "expo-secure-store";
import { TOKEN_STORAGE_KEY } from "./constants";
import type { Profile } from "../../types/profile";

const PROFILE_STORAGE_KEY = "tuesday-profile";

export const tokenStore = {
  async get(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
  },

  async set(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  },
};

export const profileStore = {
  async get(): Promise<Profile | null> {
    const raw = await SecureStore.getItemAsync(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Profile;
    } catch {
      return null;
    }
  },

  async set(profile: Profile): Promise<void> {
    await SecureStore.setItemAsync(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(PROFILE_STORAGE_KEY);
  },
};
