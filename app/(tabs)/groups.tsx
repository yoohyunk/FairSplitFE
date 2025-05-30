import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { AddFriendModal } from "@/components/groups/AddFriendModal";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { FriendItem } from "@/components/groups/FriendItem";
import { GroupItem } from "@/components/groups/GroupItem";
import { SearchBar } from "@/components/groups/SearchBar";
import { colors } from "@/constants/Colors";
import { Friend, useFriendsStore } from "@/hooks/useFriendsStore";
import { Group, useGroupsStore } from "@/hooks/useGroupsStore";
import { useRouter } from "expo-router";
import { Plus, User, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
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
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
});
