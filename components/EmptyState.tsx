import { colors } from "@/constants/Colors";
import {
  AlertCircle,
  Camera,
  Plus,
  Receipt,
  ShoppingBag,
  Users,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type EmptyStateProps = {
  type: "receipts" | "participants" | "items";
  onAction?: () => void;
  message?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  message,
}) => {
  const getIcon = () => {
    switch (type) {
      case "receipts":
        return <Receipt size={48} color={colors.textLight} />;
      case "participants":
        return <Users size={48} color={colors.textLight} />;
      case "items":
        return <ShoppingBag size={48} color={colors.textLight} />;
      default:
        return <AlertCircle size={48} color={colors.textLight} />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case "receipts":
        return "You don't have any receipts yet";
      case "participants":
        return "No participants added yet";
      case "items":
        return "No items found on this receipt";
      default:
        return "Nothing to show";
    }
  };

  const getActionText = () => {
    switch (type) {
      case "receipts":
        return "Scan a Receipt";
      case "participants":
        return "Add Participants";
      case "items":
        return "Add Items";
      default:
        return "Take Action";
    }
  };

  const getActionIcon = () => {
    switch (type) {
      case "receipts":
        return <Camera size={16} color={colors.card} />;
      default:
        return <Plus size={16} color={colors.card} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text style={styles.message}>{message || getDefaultMessage()}</Text>
      {onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <View style={styles.actionIconContainer}>{getActionIcon()}</View>
          <Text style={styles.actionText}>{getActionText()}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
    opacity: 0.7,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionIconContainer: {
    marginRight: 8,
  },
  actionText: {
    color: colors.card,
    fontWeight: "600",
    fontSize: 14,
  },
});
