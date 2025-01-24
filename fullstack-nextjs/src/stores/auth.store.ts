import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  email: string | null;
  userId: string | null;
  idToken: string | null;
}

interface AuthStore {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: {
        email: null,
        userId: null,
        idToken: null
      },
      setUser: (user) => set({ user }),
      clearUser: () => set({
        user: {
          email: null,
          userId: null,
          idToken: null
        }
      })
    }),
    {
      name: 'auth-storage'
    }
  )
); 