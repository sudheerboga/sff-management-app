import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  themeMode: 'light' | 'dark';
  sidebarOpen: boolean;
  newOrderOpen: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setNewOrderOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      sidebarOpen: false,
      newOrderOpen: false,
      toggleTheme: () => set((s) => ({ themeMode: s.themeMode === 'light' ? 'dark' : 'light' })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setNewOrderOpen: (open) => set({ newOrderOpen: open }),
    }),
    { name: 'boutique-ui', partialize: (s) => ({ themeMode: s.themeMode }) },
  ),
);
