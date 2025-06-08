import { colors } from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="dark" />
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
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(profile)" options={{ headerShown: false }} />
        <Stack.Screen
          name="receipt/[id]"
          options={{ title: "Receipt Details", presentation: "card" }}
        />
        <Stack.Screen
          name="receipt/edit/[id]"
          options={{ title: "Edit Receipt", presentation: "modal" }}
        />
        <Stack.Screen
          name="receipt/items/[id]"
          options={{ title: "Receipt Items", presentation: "card" }}
        />
        <Stack.Screen
          name="receipt/participants/[id]"
          options={{ title: "Participants", presentation: "card" }}
        />
        <Stack.Screen
          name="receipt/summary/[id]"
          options={{ title: "Split Summary", presentation: "card" }}
        />
        <Stack.Screen
          name="scan"
          options={{ title: "Scan Receipt", presentation: "fullScreenModal" }}
        />
        <Stack.Screen
          name="modal"
          options={{ title: "Information", presentation: "modal" }}
        />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen
          name="groups/[id]"
          options={{ title: "Group Details", presentation: "card" }}
        />
        <Stack.Screen
          name="friends/[id]"
          options={{ title: "Friend Details", presentation: "card" }}
        />
      </Stack>
    </>
  );
}
