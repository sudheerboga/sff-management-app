import { create } from 'zustand';
import { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
}));
