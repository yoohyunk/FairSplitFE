import { colors } from "@/constants/Colors";
import { Receipt } from "@/types/receipt";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useRouter } from "expo-router";
import { AlertCircle, Check, Clock, Users } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ReceiptCardProps = {
  receipt: Receipt;
};

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/receipt/${receipt.id}`);
  };

  const getStatusColor = () => {
    switch (receipt.status) {
      case "completed":
        return colors.success;
      case "pending":
        return colors.warning;
      default:
        return colors.textLight;
    }
  };

  const getStatusIcon = () => {
    switch (receipt.status) {
      case "completed":
        return <Check size={16} color={colors.success} />;
      case "pending":
        return <Clock size={16} color={colors.warning} />;
      default:
        return <AlertCircle size={16} color={colors.textLight} />;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.title}>{receipt.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "20" },
          ]}
        >
          <View style={styles.statusIconContainer}>{getStatusIcon()}</View>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.restaurant}>{receipt.restaurant}</Text>
        <Text style={styles.date}>{formatDate(receipt.date)}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.participants}>
          <Users size={16} color={colors.textSecondary} />
          <Text style={styles.participantsText}>
            {receipt.participants.length}{" "}
            {receipt.participants.length === 1 ? "person" : "people"}
          </Text>
        </View>
        <Text style={styles.total}>
          {formatCurrency(receipt.total, receipt.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIconContainer: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  details: {
    marginBottom: 12,
  },
  restaurant: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  participants: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  total: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
});
