import { supabase } from "@/app/supabaseClient";
import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { useFriendsStore } from "@/hooks/useFriendsStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

export default function AddPeopleScreen() {
  const router = useRouter();
  const { receiptData, receiptUrl } = useLocalSearchParams<{
    receiptData: string;
    receiptUrl: string;
  }>();

  const [people, setPeople] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const { friends } = useFriendsStore();

  const parsedReceiptData: ReceiptData = receiptData
    ? JSON.parse(receiptData)
    : null;

  // Get current user's email on component mount
  useEffect(() => {
    const getCurrentUserEmail = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setCurrentUserEmail(user.email);
          // Automatically add current user to the list
          setPeople([user.email]);
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };

    getCurrentUserEmail();
  }, []);

  const handleAddPerson = () => {
    if (newEmail.trim() && !people.includes(newEmail.trim())) {
      setPeople([...people, newEmail.trim()]);
      setNewEmail("");
    }
  };

  const handleRemovePerson = (email: string) => {
    // Don't allow removing the current user
    if (email === currentUserEmail) {
      Alert.alert(
        "Cannot Remove",
        "You cannot remove yourself from the split."
      );
      return;
    }
    setPeople(people.filter((p) => p !== email));
  };

  const handleAddFriend = (friend: any) => {
    const email = friend.email || friend.paymentInfo?.email;
    if (email && !people.includes(email)) {
      setPeople([...people, email]);
    }
    setShowFriendModal(false);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Navigate to assign items page
      router.push({
        pathname: "/assign-items" as any,
        params: {
          receiptData: receiptData,
          people: JSON.stringify(people),
        },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to complete");
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentUser = (email: string) => email === currentUserEmail;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Add People to Split</Text>
        <Text style={styles.subtitle}>
          Add people to split the receipt with by email or select from your
          friends
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Add by Email</Text>
          <View style={styles.emailInputContainer}>
            <TextInput
              style={[styles.input, styles.emailInput]}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              title="Add"
              onPress={handleAddPerson}
              disabled={!newEmail.trim() || people.includes(newEmail.trim())}
              size="small"
            />
          </View>

          <Button
            title="Select from Friends"
            onPress={() => setShowFriendModal(true)}
            variant="outline"
            size="medium"
            fullWidth
          />

          {people.length > 0 && (
            <View style={styles.peopleList}>
              <Text style={styles.label}>Added People ({people.length})</Text>
              {people.map((email, index) => (
                <View
                  key={index}
                  style={[
                    styles.personItem,
                    isCurrentUser(email) && styles.currentUserItem,
                  ]}
                >
                  <View style={styles.personInfo}>
                    <Text
                      style={[
                        styles.personEmail,
                        isCurrentUser(email) && styles.currentUserEmail,
                      ]}
                    >
                      {email}
                    </Text>
                    {isCurrentUser(email) && (
                      <Text style={styles.currentUserLabel}>You</Text>
                    )}
                  </View>
                  {!isCurrentUser(email) && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemovePerson(email)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Back"
              onPress={() => router.back()}
              variant="outline"
              size="large"
              fullWidth
            />
            <View style={{ height: 12 }} />
            <Button
              title="Complete"
              onPress={handleComplete}
              loading={isLoading}
              size="large"
              fullWidth
            />
          </View>
        </View>
      </ScrollView>

      {/* Friend Selection Modal */}
      {showFriendModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Friends</Text>
            <ScrollView style={styles.friendsList}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => handleAddFriend(friend)}
                >
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendEmail}>
                      {friend.email || friend.paymentInfo?.email || "No email"}
                    </Text>
                  </View>
                  <Text style={styles.addFriendText}>Add</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              title="Cancel"
              onPress={() => setShowFriendModal(false)}
              variant="outline"
              size="medium"
              fullWidth
            />
          </View>
        </View>
      )}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
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
  emailInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  emailInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
  },
  peopleList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  personItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentUserItem: {
    backgroundColor: colors.primaryLight + "20", // Add transparency
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 0,
  },
  personInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  personEmail: {
    fontSize: 16,
    color: colors.text,
  },
  currentUserEmail: {
    fontWeight: "bold",
    color: colors.primary,
  },
  currentUserLabel: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: "600",
  },
  removeButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  removeButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonContainer: {
    gap: 12,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  friendsList: {
    maxHeight: 300,
    width: "100%",
    marginBottom: 16,
  },
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addFriendText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
});
