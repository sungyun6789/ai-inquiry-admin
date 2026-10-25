import { create } from 'zustand';

export type User = {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN';
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user })),
}));
