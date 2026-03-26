import { create } from "zustand";
import type { Theme } from "../types/theme";
import { DEFAULT_THEME } from "../types/theme";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  updateTheme: (updates: Partial<Theme>) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: DEFAULT_THEME,
  setTheme: (theme) => set({ theme }),
  updateTheme: (updates) => set((s) => ({ theme: { ...s.theme, ...updates } })),
}));
