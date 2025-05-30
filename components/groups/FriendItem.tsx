import { colors } from "@/constants/Colors";
import { Friend } from "@/hooks/useFriendsStore";
import { ChevronRight, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type FriendItemProps = {
  friend: Friend;
  onPress: () => void;
};

const formatPhoneNumber = (phone: string) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format the number
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    const [, area, prefix, line] = match;
    return `(${area}) ${prefix}-${line}`;
  }
  return phone;
};

export const FriendItem = ({ friend, onPress }: FriendItemProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.iconContainer}>
      <User size={24} color={colors.primary} />
    </View>
    <View style={styles.info}>
      <Text style={styles.name}>{friend.name}</Text>
      <Text style={styles.phone}>{formatPhoneNumber(friend.phone)}</Text>
    </View>
    <ChevronRight size={20} color={colors.textLight} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
