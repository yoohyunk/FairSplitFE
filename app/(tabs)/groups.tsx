import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { colors } from "@/constants/Colors";
import { Friend, useFriendsStore } from "@/hooks/useFriendsStore";
import { Group, useGroupsStore } from "@/hooks/useGroupsStore";
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

const CreateGroupModal = ({
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

type AddFriendModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddFriend: (name: string, phone: string) => void;
};

const AddFriendModal = ({
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

    onAddFriend(newFriendName.trim(), newFriendPhone.trim());
    setNewFriendName("");
    setNewFriendPhone("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
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
              onChangeText={setNewFriendPhone}
              placeholder="(555) 555-5555"
              placeholderTextColor={colors.textLight}
              keyboardType="phone-pad"
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
      </View>
    </Modal>
  );
};

type GroupItemProps = {
  group: Group;
  onPress: () => void;
};

const GroupItem = ({ group, onPress }: GroupItemProps) => (
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

type FriendItemProps = {
  friend: Friend;
  onPress: () => void;
};

const FriendItem = ({ friend, onPress }: FriendItemProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
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

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

const SearchBar = ({ value, onChangeText, placeholder }: SearchBarProps) => (
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

export default function GroupsScreen() {
  const router = useRouter();
  const { groups } = useGroupsStore();
  const { friends } = useFriendsStore();

  const [activeTab, setActiveTab] = useState<"groups" | "friends">("groups");
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] =
    useState(false);
  const [isAddFriendModalVisible, setIsAddFriendModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { addGroup } = useGroupsStore();
  const { addFriend } = useFriendsStore();

  const filteredGroups = groups.filter((group: Group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends.filter(
    (friend: Friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGroup = (name: string) => {
    addGroup({
      name,
      members: [{ id: "1", name: "You" }],
    });
    setIsCreateGroupModalVisible(false);
  };

  const handleAddFriend = (name: string, phone: string) => {
    addFriend({
      name,
      phone,
    });
    setIsAddFriendModalVisible(false);
  };

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

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={`Search ${
          activeTab === "groups" ? "groups" : "friends"
        }...`}
      />

      {activeTab === "groups" ? (
        filteredGroups.length > 0 ? (
          <FlatList
            data={filteredGroups}
            renderItem={({ item }) => (
              <GroupItem
                group={item}
                onPress={() => router.push(`/groups/${item.id}` as any)}
              />
            )}
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
          renderItem={({ item }) => (
            <FriendItem
              friend={item}
              onPress={() => router.push(`/friends/${item.id}` as any)}
            />
          )}
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

      <CreateGroupModal
        visible={isCreateGroupModalVisible}
        onClose={() => setIsCreateGroupModalVisible(false)}
        onCreateGroup={handleCreateGroup}
      />

      <AddFriendModal
        visible={isAddFriendModalVisible}
        onClose={() => setIsAddFriendModalVisible(false)}
        onAddFriend={handleAddFriend}
      />
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
