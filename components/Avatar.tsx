import { supabase } from "@/app/supabaseClient";
import { colors } from "@/constants/Colors";
import { useProfileStore } from "@/hooks/useProfileStore";
import { Image } from "expo-image";
import { User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface AvatarProps {
  size?: number;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({ size = 100, style }) => {
  const profile = useProfileStore((state) => state.profile);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const validateAndSetImageUrl = async () => {
      if (!profile?.avatar_url) {
        setImageUrl(null);
        return;
      }

      try {
        // Extract the path from the full URL
        const urlParts = profile.avatar_url.split("/");
        const path = urlParts.slice(urlParts.indexOf("avatars")).join("/");

        // Get a fresh public URL using Supabase client
        const { data } = supabase.storage
          .from("profile-pic")
          .getPublicUrl(path);

        // Verify the URL is accessible
        const response = await fetch(data.publicUrl, { method: "HEAD" });
        if (!response.ok) {
          throw new Error(`Image not accessible: ${response.status}`);
        }

        setImageUrl(data.publicUrl);
        setHasError(false);
      } catch (error) {
        console.error("Error validating image URL:", error);
        setHasError(true);
        setImageUrl(null);
      }
    };

    validateAndSetImageUrl();
  }, [profile?.avatar_url]);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.error("Image loading error:", error);
    console.log("Failed to load image from URL:", imageUrl);
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {imageUrl && !hasError ? (
        <View style={[styles.imageContainer, { width: size, height: size }]}>
          <Image
            source={imageUrl}
            style={[styles.image, { width: size, height: size }]}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            contentFit="cover"
            transition={200}
            cachePolicy="none"
            recyclingKey={imageUrl}
          />
          {isLoading && (
            <View
              style={[styles.loadingContainer, { width: size, height: size }]}
            >
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <User size={size * 0.4} color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    borderRadius: 9999,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background + "80",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
  },
});
