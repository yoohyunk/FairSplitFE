import { colors } from "@/constants/Colors";
import { Group } from "@/hooks/useGroupsStore";
import { ChevronRight, Receipt, User, Users } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type GroupItemProps = {
  group: Group;
  onPress: () => void;
};

export const GroupItem = ({ group, onPress }: GroupItemProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.iconContainer}>
      <Users size={24} color={colors.primary} />
    </View>
    <View style={styles.info}>
      <Text style={styles.name}>{group.name}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <User size={14} color={colors.textSecondary} />
          <Text style={styles.statText}>{group.members.length} members</Text>
        </View>
        {group.receipts > 0 && (
          <View style={styles.stat}>
            <Receipt size={14} color={colors.textSecondary} />
            <Text style={styles.statText}>{group.receipts} receipts</Text>
          </View>
        )}
      </View>
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
  stats: {
    flexDirection: "row",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
});
