import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  themeMode: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      sidebarOpen: false,
      toggleTheme: () => set((s) => ({ themeMode: s.themeMode === 'light' ? 'dark' : 'light' })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: 'boutique-ui' },
  ),
);
