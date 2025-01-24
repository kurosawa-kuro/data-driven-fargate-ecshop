import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  email: string | null;
  userId: string | null;
}

interface AuthStore {
  user: User;
  setUser: (user: User) => void;
  clearUser: () => void;
  resetStore: () => void;
}

const initialState = {
  user: {
    email: null,
    userId: null
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set(() => ({ user })),
      clearUser: () => set(() => initialState),
      resetStore: () => {
        localStorage.removeItem('auth-storage');
        set(() => initialState);
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        console.log('Hydrated state:', state);
      }
    }
  )
);

// ユーザー情報を取得するためのヘルパー関数
export const getAuthUser = () => useAuthStore.getState().user; 