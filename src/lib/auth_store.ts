import { create } from "zustand";

interface AuthState {
  registerSuccessMessage: string | null;
  setRegisterSuccessMessage: (msg: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  registerSuccessMessage: null,
  setRegisterSuccessMessage: (msg) => set({ registerSuccessMessage: msg }),
}));
