import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type AddFriendModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddFriend: (name: string, phone: string) => void;
};

const formatPhoneNumber = (text: string) => {
  // Remove all non-numeric characters
  const cleaned = text.replace(/\D/g, "");

  // Format the number
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    const [, area, prefix, line] = match;
    if (area && prefix && line) {
      return `(${area}) ${prefix}-${line}`;
    } else if (area && prefix) {
      return `(${area}) ${prefix}`;
    } else if (area) {
      return `(${area}`;
    }
  }
  return cleaned;
};

export const AddFriendModal = ({
  visible,
  onClose,
  onAddFriend,
}: AddFriendModalProps) => {
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendPhone, setNewFriendPhone] = useState("");

  const handleAdd = () => {
    if (!newFriendName.trim()) {
      Alert.alert("Error", "Please enter a friend name");
      return;
    }

    if (!newFriendPhone.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    // Remove formatting before saving
    const cleanedPhone = newFriendPhone.replace(/\D/g, "");
    onAddFriend(newFriendName.trim(), cleanedPhone);
    setNewFriendName("");
    setNewFriendPhone("");
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setNewFriendPhone(formatted);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Friend</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Friend&apos;s Name</Text>
              <TextInput
                style={styles.input}
                value={newFriendName}
                onChangeText={setNewFriendName}
                placeholder="Enter friend's name"
                placeholderTextColor={colors.textLight}
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={newFriendPhone}
                onChangeText={handlePhoneChange}
                placeholder="(555) 555-5555"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
                maxLength={14} // (XXX) XXX-XXXX
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={onClose}
                variant="outline"
                containerStyle={{ flex: 1, marginHorizontal: 4 }}
              />
              <Button
                title="Add Friend"
                onPress={handleAdd}
                containerStyle={{ flex: 1, marginHorizontal: 4 }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});
