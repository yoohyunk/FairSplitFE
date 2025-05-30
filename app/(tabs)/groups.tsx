import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/constants/Colors";
import { useFriendsStore } from "@/hooks/useFriendsStore";
import { useGroupsStore } from "@/hooks/useGroupsStore";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Plus,
  Receipt,
  Search,
  User,
  Users,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function GroupsScreen() {
  const router = useRouter();
  const { groups } = useGroupsStore();
  const { friends } = useFriendsStore();

  const [activeTab, setActiveTab] = useState<"groups" | "friends">("groups");
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] =
    useState(false);
  const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendPhone, setNewFriendPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { addGroup } = useGroupsStore();
  const { addFriend } = useFriendsStore();

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    addGroup({
      name: newGroupName.trim(),
      members: [{ id: "1", name: "You" }],
    });

    setNewGroupName("");
    setIsCreateGroupModalVisible(false);
  };

  const handleAddFriend = () => {
    if (!newFriendName.trim()) {
      Alert.alert("Error", "Please enter a friend name");
      return;
    }

    if (!newFriendPhone.trim()) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    addFriend({
      name: newFriendName.trim(),
      phone: newFriendPhone.trim(),
    });

    setNewFriendName("");
    setNewFriendPhone("");
    setIsAddFriendModalVisible(false);
  };

  const renderGroupItem = (group) => (
    <TouchableOpacity
      key={group.id}
      style={styles.card}
      onPress={() => router.push(`/groups/${group.id}`)}
    >
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

  const renderFriendItem = (friend) => (
    <TouchableOpacity
      key={friend.id}
      style={styles.card}
      onPress={() => router.push(`/friends/${friend.id}`)}
    >
      <View style={styles.iconContainer}>
        <User size={24} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.phone}>{friend.phone}</Text>
      </View>
      <ChevronRight size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {activeTab === "groups" ? "Your Groups" : "Your Friends"}
        </Text>
        <Button
          title={activeTab === "groups" ? "Create Group" : "Add Friend"}
          onPress={() => {
            if (activeTab === "groups") {
              setIsCreateGroupModalVisible(true);
            } else {
              setIsAddFriendModalVisible(true);
            }
          }}
          icon={<Plus size={16} color={colors.card} />}
          size="small"
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "groups" && styles.activeTab]}
          onPress={() => setActiveTab("groups")}
        >
          <Users
            size={18}
            color={
              activeTab === "groups" ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "groups" && styles.activeTabText,
            ]}
          >
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "friends" && styles.activeTab]}
          onPress={() => setActiveTab("friends")}
        >
          <User
            size={18}
            color={
              activeTab === "friends" ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "friends" && styles.activeTabText,
            ]}
          >
            Friends
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${
            activeTab === "groups" ? "groups" : "friends"
          }...`}
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {activeTab === "groups" ? (
        filteredGroups.length > 0 ? (
          <FlatList
            data={filteredGroups}
            renderItem={({ item }) => renderGroupItem(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <EmptyState
            type="participants"
            onAction={() => setIsCreateGroupModalVisible(true)}
            message={
              searchQuery
                ? "No groups match your search"
                : "Create a group to split receipts with friends or roommates"
            }
          />
        )
      ) : filteredFriends.length > 0 ? (
        <FlatList
          data={filteredFriends}
          renderItem={({ item }) => renderFriendItem(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <EmptyState
          type="participants"
          onAction={() => setIsAddFriendModalVisible(true)}
          message={
            searchQuery
              ? "No friends match your search"
              : "Add friends to easily split receipts with them"
          }
        />
      )}

      {/* Create Group Modal */}
      <Modal
        visible={isCreateGroupModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateGroupModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Group</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsCreateGroupModalVisible(false)}
              >
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
                onPress={() => setIsCreateGroupModalVisible(false)}
                variant="outline"
                containerStyle={{ flex: 1, marginHorizontal: 4 }}
              />
              <Button
                title="Create"
                onPress={handleCreateGroup}
                containerStyle={{ flex: 1, marginHorizontal: 4 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Friend Modal */}
      <Modal
        visible={isAddFriendModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddFriendModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Friend</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsAddFriendModalVisible(false)}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Friend's Name</Text>
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
                onChangeText={setNewFriendPhone}
                placeholder="(555) 555-5555"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setIsAddFriendModalVisible(false)}
                variant="outline"
                containerStyle={{ flex: 1, marginHorizontal: 4 }}
              />
              <Button
                title="Add Friend"
                onPress={handleAddFriend}
                containerStyle={{ flex: 1, marginHorizontal: 4 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  activeTab: {
    backgroundColor: colors.primary + "20",
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "500",
  },
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
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
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
