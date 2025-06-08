import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { useProfileStore } from "@/hooks/useProfileStore";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditAvatarScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { updateProfileWithAvatar, profile } = useProfileStore();

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setIsLoading(true);
    try {
      // Read local file as base64
      const base64 = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 data to blob
      const blob = await (
        await fetch(`data:image/jpeg;base64,${base64}`)
      ).blob();

      console.log("blob size:", blob.size); // Check if size is 0 (indicates problem)
      console.log("blob type:", blob.type);

      // Create object compatible with supabase upload function
      const file = {
        uri: selectedImage,
        name: "avatar.jpg",
        type: blob.type || "image/jpeg",
      };

      // Update profile with new avatar
      await updateProfileWithAvatar(profile?.username || "", file);
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update avatar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Profile Picture</Text>

        <View style={styles.imageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        <Button
          title="Choose Photo"
          onPress={pickImage}
          variant="secondary"
          size="large"
          fullWidth
        />

        <Button
          title="Save"
          onPress={handleSave}
          loading={isLoading}
          size="large"
          fullWidth
        />
      </View>
    </SafeAreaView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 24,
    textAlign: "center",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
