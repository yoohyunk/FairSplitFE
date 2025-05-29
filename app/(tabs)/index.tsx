import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ReceiptCard } from "@/components/ReceiptCard";
import { colors } from "@/constants/Colors";
import { useReceiptStore } from "@/hooks/useReceiptStore";
import { useRouter } from "expo-router";
import { Camera } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const receipts = useReceiptStore((state) => state.receipts);

  // Get only recent receipts (last 5)
  const recentReceipts = receipts
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  // Get pending receipts
  const pendingReceipts = receipts.filter(
    (receipt) => receipt.status === "pending"
  );

  const handleScanPress = () => {
    router.push("/scan");
  };

  const handleViewAllPress = () => {
    router.push("/history");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Split the Bill</Text>
        <Text style={styles.subtitle}>
          Scan receipts and split expenses fairly
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Scan Receipt"
          onPress={handleScanPress}
          icon={<Camera size={18} color={colors.card} />}
          size="large"
          fullWidth
        />
      </View>

      {pendingReceipts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Approval</Text>
          </View>

          {pendingReceipts.map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Receipts</Text>
          {receipts.length > 5 && (
            <TouchableOpacity onPress={handleViewAllPress}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentReceipts.length > 0 ? (
          recentReceipts.map((receipt) => (
            <ReceiptCard key={receipt.id} receipt={receipt} />
          ))
        ) : (
          <EmptyState
            type="receipts"
            onAction={handleScanPress}
            message="Scan your first receipt to get started"
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
});
