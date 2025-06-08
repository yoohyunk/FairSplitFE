import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/hooks/useAuthStore";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function AuthLayout() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Handle deep links
    const handleDeepLink = async (event: Linking.EventType) => {
      const url = event.url;
      if (url.includes("auth/callback")) {
        // Handle auth callback
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          return;
        }
        if (session) {
          // Navigate to profile setup or main app
          router.replace(
            session.user.user_metadata.has_profile
              ? "/(tabs)"
              : "/profile-setup"
          );
        }
      }
    };

    // Add event listener
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check for initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Sign In",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Complete Profile",
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
