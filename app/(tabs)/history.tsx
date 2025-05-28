import { EmptyState } from "@/components/EmptyState";
import { ReceiptCard } from "@/components/ReceiptCard";
import { colors } from "@/constants/Colors";
import { useReceiptStore } from "@/hooks/useReceiptStore";
import { useRouter } from "expo-router";
import { Filter } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type FilterOption = "all" | "pending" | "completed" | "draft";

export default function HistoryScreen() {
  const router = useRouter();
  const receipts = useReceiptStore((state) => state.receipts);
  const [filter, setFilter] = useState<FilterOption>("all");

  const filteredReceipts = receipts
    .filter((receipt) => {
      if (filter === "all") return true;
      return receipt.status === filter;
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  const handleScanPress = () => {
    router.push("/scan");
  };

  const renderFilterOption = (option: FilterOption, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        filter === option && styles.filterOptionActive,
      ]}
      onPress={() => setFilter(option)}
    >
      <Text
        style={[
          styles.filterOptionText,
          filter === option && styles.filterOptionTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <Filter size={16} color={colors.textSecondary} />
          <Text style={styles.filterTitle}>Filter</Text>
        </View>
        <View style={styles.filterOptions}>
          {renderFilterOption("all", "All")}
          {renderFilterOption("pending", "Pending")}
          {renderFilterOption("completed", "Completed")}
          {renderFilterOption("draft", "Drafts")}
        </View>
      </View>

      {filteredReceipts.length > 0 ? (
        <FlatList
          data={filteredReceipts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReceiptCard receipt={item} />}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState
          type="receipts"
          onAction={handleScanPress}
          message={`No ${filter !== "all" ? filter : ""} receipts found`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
    marginLeft: 6,
  },
  filterOptions: {
    flexDirection: "row",
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.background,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterOptionTextActive: {
    color: colors.card,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
  },
});
