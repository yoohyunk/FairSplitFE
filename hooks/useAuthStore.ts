import { supabase } from "@/app/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  signUpWithEmail: (
    email: string,
    password: string,
    options?: { emailRedirectTo?: string }
  ) => Promise<void>;
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
      error: null,

      signUpWithEmail: async (
        email: string,
        password: string,
        options?: { emailRedirectTo?: string }
      ) => {
        if (useAuthStore.getState().isLoading) return;
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: options?.emailRedirectTo,
            },
          });

          if (error) throw error;
          if (!data.user) throw new Error("No user data returned");

          // Check if email confirmation is required
          if (data.user.identities?.length === 0) {
            throw new Error("Email confirmation required");
          }

          set({ user: data.user, isAuthenticated: true });
        } catch (error: any) {
          set({ error: error.message });
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
          if (!data.session) throw new Error("Sign in failed - no session");
          if (!data.user) throw new Error("Sign in failed - no user data");

          set({
            user: data.user,
            isAuthenticated: true,
          });
        } catch (error: any) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithGoogle: async () => {
        if (useAuthStore.getState().isLoading) return;
        set({ isLoading: true });

        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) throw error;
        } catch (error: any) {
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
        } catch (error: any) {
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
