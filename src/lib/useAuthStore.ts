// auth_store.ts
import { create } from "zustand";
import { API_ROUTES } from "./api.routes";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  registerSuccessMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setRegisterSuccessMessage: (msg: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  registerSuccessMessage: null,

  login: async (email: string, password: string) => {
    console.log("Login", email, password);
    set({ loading: true, error: null });
    try {
      const response = await fetch(API_ROUTES.SIGN_IN.url, {
        method: API_ROUTES.SIGN_IN.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);

      set({
        isAuthenticated: true,
        user: data.user,
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      set({ error: message, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ isAuthenticated: false, user: null });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setRegisterSuccessMessage: (msg) => {
    set({ registerSuccessMessage: msg });
  },
}));
