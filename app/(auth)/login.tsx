import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function AuthScreen() {
  const router = useRouter();

  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  // const isLoading = false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Invalid Input", "Please enter email and password");
      return;
    }

    try {
      if (isSigningUp) {
        await signUpWithEmail(email, password);
        Alert.alert("Success", "Check your email for verification link.");
        setIsSigningUp(false);
      } else {
        await signInWithEmail(email, password);
        router.replace("/"); // 로그인 성공 후 홈으로 이동
      }
    } catch (error: any) {
      Alert.alert("Authentication Error", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // 구글 로그인 후 리다이렉트/세션 처리는 별도 설정 필요
    } catch (error: any) {
      Alert.alert("Google Login Error", error.message);
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
        />

        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          textContentType="password"
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
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  switchMode: {
    marginTop: 12,
    alignItems: "center",
  },
  switchText: {
    color: colors.primary,
    fontWeight: "500",
  },
});
