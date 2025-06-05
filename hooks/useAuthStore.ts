import { supabase } from "@/app/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      signUpWithEmail: async (email, password) => {
        if (useAuthStore.getState().isLoading) return;
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
          set({ user: data.user, isAuthenticated: !!data.user });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithEmail: async (email, password) => {
        if (useAuthStore.getState().isLoading) return;
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          set({
            user: data.session?.user ?? null,
            isAuthenticated: !!data.session?.user,
          });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithGoogle: async () => {
        if (useAuthStore.getState().isLoading) return;
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo:
                "https://padfuhispzndlubsdjqk.supabase.co/auth/v1/callback",
            },
          });
          if (error) throw error;
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        if (useAuthStore.getState().isLoading) return;
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
