import { supabase } from "@/app/supabaseClient";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import { create } from "zustand";

interface Profile {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  bio?: string;
}

interface ProfileStore {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  createProfile: (username: string) => Promise<void>;
  updateProfile: (username: string) => Promise<void>;
}

export const useProfileStore = create<
  ProfileStore & {
    uploadAvatar: (file: {
      uri: string;
      name: string;
      type: string;
    }) => Promise<string>;
    updateProfileWithAvatar: (
      username: string,
      avatarFile: { uri: string; name: string; type: string }
    ) => Promise<void>;
  }
>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch("http://192.168.1.65:8000/api/profiles/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profile = await response.json();
      set({ profile: Array.isArray(profile) ? profile[0] : profile });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createProfile: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch("http://192.168.1.65:8000/api/profiles/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create profile");
      }

      const profile = await response.json();
      set({ profile: Array.isArray(profile) ? profile[0] : profile });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const currentProfile = get().profile;
      if (!currentProfile || !currentProfile.id)
        throw new Error("No profile ID available");

      const response = await fetch(
        `http://192.168.1.65:8000/api/profiles/${currentProfile.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ username }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to update profile");
        } else {
          const text = await response.text();
          throw new Error(`Server error: ${response.status} - ${text}`);
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format from server");
      }

      const updatedProfile = await response.json();
      set({ profile: updatedProfile });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // React Native 환경에 맞게 Blob 변환 후 업로드
  uploadAvatar: async (file: { uri: string; name: string; type: string }) => {
    // Convert to Blob for React Native environment
    try {
      // 1. Read local file as base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Convert base64 to buffer (using Buffer library in react-native environment)
      const buffer = Buffer.from(base64, "base64");

      // 3. Upload buffer to supabase storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data, error } = await supabase.storage
        .from("profile-pic")
        .upload(filePath, buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      console.log("Supabase upload error:", error);
      console.log("Supabase upload data:", data);

      if (error) {
        throw error;
      }

      // 4. Get public URL of uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pic").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  },

  updateProfileWithAvatar: async (
    username: string,
    avatarFile: { uri: string; name: string; type: string }
  ) => {
    set({ isLoading: true, error: null });
    try {
      let profile = get().profile;
      if (!profile) {
        await get().fetchProfile();
        profile = get().profile;
      }
      if (!profile || !profile.id)
        throw new Error("No profile ID available to update");

      const avatar_url = await get().uploadAvatar(avatarFile);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(
        `http://192.168.1.65:8000/api/profiles/${profile.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ username, avatar_url }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Failed to update profile`);
      }

      const updatedProfile = await response.json();
      set({ profile: updatedProfile });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
