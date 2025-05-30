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

type CreateGroupModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreateGroup: (name: string) => void;
};

export const CreateGroupModal = ({
  visible,
  onClose,
  onCreateGroup,
}: CreateGroupModalProps) => {
  const [newGroupName, setNewGroupName] = useState("");

  const handleCreate = () => {
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    onCreateGroup(newGroupName.trim());
    setNewGroupName("");
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
              <Text style={styles.modalTitle}>Create New Group</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Group Name</Text>
              <TextInput
                style={styles.input}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Enter group name"
                placeholderTextColor={colors.textLight}
                autoFocus
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
                title="Create"
                onPress={handleCreate}
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
