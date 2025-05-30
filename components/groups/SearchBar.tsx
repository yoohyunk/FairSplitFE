import { colors } from "@/constants/Colors";
import { Search, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

export const SearchBar = ({
  value,
  onChangeText,
  placeholder,
}: SearchBarProps) => (
  <View style={styles.searchContainer}>
    <Search size={18} color={colors.textSecondary} />
    <TextInput
      style={styles.searchInput}
      placeholder={placeholder}
      placeholderTextColor={colors.textLight}
      value={value}
      onChangeText={onChangeText}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText("")}>
        <X size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: colors.text,
  },
});
