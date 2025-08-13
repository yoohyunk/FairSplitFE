import { supabase } from "@/app/supabaseClient";
import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { Buffer } from "buffer";
import { CameraView as ExpoCamera, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanTabScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      // 1. Read local file as base64
      const base64 = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Convert base64 to buffer
      const buffer = Buffer.from(base64, "base64");

      // 3. Upload buffer to supabase storage
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.jpg`;
      const filePath = `receipts/${fileName}`;

      const { data, error } = await supabase.storage
        .from("receipts")
        .upload(filePath, buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/jpeg",
        });

      console.log("Supabase upload error:", error);
      console.log("Supabase upload data:", data);

      if (error) {
        throw error;
      }

      // 4. Get public URL of uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("receipts").getPublicUrl(filePath);

      // Navigate to split details screen with the image URL
      router.push({
        pathname: "/split-details" as any,
        params: { receiptUrl: publicUrl },
      });
    } catch (error: any) {
      console.error("Error uploading receipt:", error);
      Alert.alert("Error", error.message || "Failed to process receipt");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      setIsLoading(true);
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
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        // 1. Read local file as base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // 2. Convert base64 to buffer
        const buffer = Buffer.from(base64, "base64");
        // 3. Upload buffer to supabase storage
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.jpg`;
        const filePath = `receipts/${fileName}`;
        const { data, error } = await supabase.storage
          .from("receipts")
          .upload(filePath, buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: "image/jpeg",
          });
        if (error) {
          throw error;
        }
        // 4. Get public URL of uploaded file
        const {
          data: { publicUrl },
        } = supabase.storage.from("receipts").getPublicUrl(filePath);
        // Navigate to split details screen with the image URL
        router.push({
          pathname: "/split-details" as any,
          params: { receiptUrl: publicUrl },
        });
      }
    } catch (error: any) {
      console.error("Error uploading receipt from gallery:", error);
      Alert.alert("Error", error.message || "Failed to process receipt");
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpoCamera ref={cameraRef} style={styles.camera} type="back">
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.captureButton, isLoading && styles.disabledButton]}
            onPress={handleCapture}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
          <View style={{ height: 16 }} />
          <Button
            title="갤러리에서 선택"
            onPress={handlePickImage}
            variant="outline"
            disabled={isLoading}
            fullWidth
          />
        </View>
      </ExpoCamera>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: "80%",
    height: "60%",
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: "transparent",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
  disabledButton: {
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: "600",
  },
});
