import { supabase } from "@/app/supabaseClient";
import { Button } from "@/components/Button";
import ReceiptReview from "@/components/ReceiptReview";
import { colors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Item {
  id: string;
  name: string;
  price_with_discount: string;
  price_without_discount: string;
  quantity: string;
}

interface ReceiptData {
  items: Item[];
  subtotal: string;
  tax: string;
  tip: string;
  total: string;
  currency: string;
  image: string;
  receiptType: string;
  total_discount: string;
}

export default function SplitDetailsScreen() {
  const router = useRouter();
  const { receiptUrl } = useLocalSearchParams<{ receiptUrl: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"details" | "review">("details");
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get access token
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      // 2. Create split
      const splitResponse = await fetch(
        "http://192.168.1.65:8000/api/splits/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: title.trim(),
            description: description.trim(),
          }),
        }
      );

      if (!splitResponse.ok) {
        const errorData = await splitResponse.json();
        throw new Error(errorData.detail || "Failed to create split");
      }

      const splitData = await splitResponse.json();

      // 3. Upload receipt image
      const scanResponse = await fetch(
        "http://192.168.1.65:8000/api/scan/scan/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            image_url: receiptUrl,
            split_id: splitData.id,
            currency,
          }),
        }
      );

      if (!scanResponse.ok) {
        const errorData = await scanResponse.json();
        throw new Error(errorData.detail || "Failed to process receipt");
      }

      const receipt = await scanResponse.json();
      console.log("Receipt processed:", receipt);

      // 4. Set receipt data and move to review step
      setReceiptData({
        items: receipt.items.map((item: any) => ({
          id: item.id || Date.now().toString(),
          name: item.name || "Unknown Item",
          price_with_discount: (
            item.total_price_with_discount ||
            item.unit_price ||
            0
          ).toString(),
          price_without_discount: (
            item.total_price_without_discount ||
            item.unit_price ||
            0
          ).toString(),
          quantity: (item.quantity || 1).toString(),
        })),
        subtotal: (receipt.subtotal || 0).toString(),
        tax: (receipt.tax || 0).toString(),
        tip: (receipt.tips || "0").toString(),
        total: (receipt.total || 0).toString(),
        currency,
        image: receiptUrl,
        receiptType: receipt.receipt_type || "receipt",
        total_discount: (receipt.total_discount || "0").toString(),
      });
      setStep("review");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save split details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewConfirm = async (data: ReceiptData) => {
    setIsLoading(true);
    try {
      // TODO: Update receipt data with edited values
      router.push("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save receipt data");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "review" && receiptData) {
    return (
      <SafeAreaView style={styles.container}>
        <ReceiptReview
          initialData={receiptData}
          onConfirm={handleReviewConfirm}
          onCancel={() => setStep("details")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Split Details</Text>

        {receiptUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: receiptUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter split title"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description (optional)"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Currency</Text>
          <TextInput
            style={styles.input}
            value={currency}
            onChangeText={setCurrency}
            placeholder="Enter currency code (e.g., USD)"
            placeholderTextColor={colors.textSecondary}
          />

          <Button
            title="Continue"
            onPress={handleSubmit}
            loading={isLoading}
            size="large"
            fullWidth
          />
        </View>
      </ScrollView>
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
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
});
