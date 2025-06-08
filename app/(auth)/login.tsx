import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../supabaseClient";

export default function AuthScreen() {
  const router = useRouter();

  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) await checkProfile();
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };
    checkAuth();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) throw new Error("No active session");

      const accessToken = sessionData.session.access_token;
      const response = await fetch("http://192.168.1.65:8000/api/profiles/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 404) {
        router.replace("/profile-setup" as any);
      } else if (response.ok) {
        router.replace("/(tabs)");
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `API Error: ${response.status}`);
      }
    } catch (error: any) {
      if (error.message.includes("Network request failed")) {
        Alert.alert(
          "Connection Error",
          "Could not connect to the server. Please check your internet connection and try again."
        );
      } else {
        Alert.alert("Error", error.message || "Failed to check profile status");
      }
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Invalid Input", "Please enter email and password");
      return;
    }

    try {
      if (isSigningUp) {
        await signUpWithEmail(email, password, {
          emailRedirectTo: "fairsplit://auth/callback",
        });
        Alert.alert(
          "Verification Required",
          "Please check your email for the verification link. After verifying your email, you'll be able to set up your profile."
        );
        setIsSigningUp(false);
      } else {
        await signInWithEmail(email, password);
        await checkProfile();
      }
    } catch (error: any) {
      if (error.message?.includes("Invalid login credentials")) {
        Alert.alert(
          "Authentication Error",
          "Invalid email or password. If you just signed up, please check your email for the verification link."
        );
      } else if (
        error.message?.includes("Email not confirmed") ||
        error.message?.includes("Email confirmation required")
      ) {
        Alert.alert(
          "Email Not Verified",
          "Please check your email for the verification link. You need to verify your email before you can sign in."
        );
      } else if (error.message?.includes("Network request failed")) {
        Alert.alert(
          "Connection Error",
          "Could not connect to the server. Please check your internet connection and try again."
        );
      } else {
        Alert.alert(
          "Authentication Error",
          error.message || "An error occurred during authentication"
        );
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.message?.includes("Network request failed")) {
        Alert.alert(
          "Connection Error",
          "Could not connect to the server. Please check your internet connection and try again."
        );
      } else {
        Alert.alert(
          "Google Login Error",
          error.message || "An error occurred during Google sign in"
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{isSigningUp ? "Sign Up" : "Login"}</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          textContentType="password"
          editable={!isLoading}
        />

        <Button
          title={isSigningUp ? "Sign Up" : "Login"}
          onPress={handleSubmit}
          loading={isLoading}
          size="large"
          fullWidth
        />

        <TouchableOpacity
          onPress={() => setIsSigningUp((prev) => !prev)}
          style={styles.switchMode}
          disabled={isLoading}
        >
          <Text style={styles.switchText}>
            {isSigningUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <Button
          title="Continue with Google"
          onPress={handleGoogleLogin}
          loading={isLoading}
          size="large"
          fullWidth
          containerStyle={{ marginTop: 24 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.text,
  },
  switchMode: {
    marginTop: 16,
    alignItems: "center",
  },
  switchText: {
    color: colors.primary,
    fontSize: 16,
  },
});
