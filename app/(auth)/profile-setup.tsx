import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useProfileStore } from "@/hooks/useProfileStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { createProfile } = useProfileStore();

  const handleSubmit = async () => {
    if (!username.trim()) {
      Alert.alert("Invalid Input", "Please enter a username");
      return;
    }

    setIsLoading(true);
    try {
      await createProfile(username.trim());
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Please set up your username to continue
        </Text>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          autoCapitalize="none"
          textContentType="username"
          editable={!isLoading}
        />

        <Button
          title="Complete Setup"
          onPress={handleSubmit}
          loading={isLoading}
          size="large"
          fullWidth
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
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
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
});
