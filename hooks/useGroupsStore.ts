import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type GroupMember = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
  members: GroupMember[];
  receipts: number;
  createdAt: string;
  updatedAt: string;
};

type GroupInput = {
  name: string;
  members: GroupMember[];
};

interface GroupsState {
  groups: Group[];

  // Actions
  addGroup: (group: GroupInput) => string;
  updateGroup: (id: string, updates: Partial<GroupInput>) => void;
  removeGroup: (id: string) => void;
  addMemberToGroup: (groupId: string, member: GroupMember) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
  getGroupById: (id: string) => Group | undefined;
}

// Mock data
const mockGroups: Group[] = [
  {
    id: "1",
    name: "Roommates",
    members: [
      { id: "1", name: "You" },
      { id: "2", name: "Alex Johnson" },
      { id: "3", name: "Jamie Smith" },
    ],
    receipts: 8,
    createdAt: "2025-04-10T12:00:00Z",
    updatedAt: "2025-05-22T15:30:00Z",
  },
  {
    id: "2",
    name: "Weekend Trip",
    members: [
      { id: "1", name: "You" },
      { id: "3", name: "Jamie Smith" },
      { id: "4", name: "Taylor Wilson" },
      { id: "5", name: "Jordan Lee" },
    ],
    receipts: 12,
    createdAt: "2025-05-01T09:15:00Z",
    updatedAt: "2025-05-25T18:45:00Z",
  },
];

export const useGroupsStore = create<GroupsState>()(
  persist(
    (set, get) => ({
      groups: mockGroups,

      addGroup: (groupData) => {
        const id = Date.now().toString();
        const timestamp = new Date().toISOString();

        const newGroup: Group = {
          ...groupData,
          id,
          receipts: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          groups: [...state.groups, newGroup],
        }));

        return id;
      },

      updateGroup: (id, updates) => {
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id
              ? {
                  ...group,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : group
          ),
        }));
      },

      removeGroup: (id) => {
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
        }));
      },

      addMemberToGroup: (groupId, member) => {
        set((state) => ({
          groups: state.groups.map((group) => {
            if (group.id === groupId) {
              // Check if member already exists
              const memberExists = group.members.some(
                (m) => m.id === member.id
              );

              if (!memberExists) {
                return {
                  ...group,
                  members: [...group.members, member],
                  updatedAt: new Date().toISOString(),
                };
              }
            }
            return group;
          }),
        }));
      },

      removeMemberFromGroup: (groupId, memberId) => {
        set((state) => ({
          groups: state.groups.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                members: group.members.filter((m) => m.id !== memberId),
                updatedAt: new Date().toISOString(),
              };
            }
            return group;
          }),
        }));
      },

      getGroupById: (id) => {
        return get().groups.find((group) => group.id === id);
      },
    }),
    {
      name: "groups-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
