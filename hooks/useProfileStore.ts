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
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
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
  uploadAvatar: async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 1. 로컬 파일을 base64로 읽기
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2. base64를 buffer로 변환 (react-native 환경에서는 Buffer 라이브러리 사용)
    const buffer = Buffer.from(base64, "base64");

    // 3. supabase 스토리지에 buffer 업로드
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

    // 4. 업로드된 파일 공개 URL 가져오기
    const {
      data: { publicUrl },
      error: urlError,
    } = supabase.storage.from("profile-pic").getPublicUrl(filePath);

    if (urlError) {
      throw urlError;
    }

    return publicUrl;
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
