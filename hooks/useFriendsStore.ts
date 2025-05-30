import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Friend = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  paymentInfo?: {
    email?: string;
    phoneNumber?: string;
  };
  createdAt: string;
};

type FriendInput = {
  name: string;
  phone: string;
  email?: string;
  paymentInfo?: {
    email?: string;
    phoneNumber?: string;
  };
};

interface FriendsState {
  friends: Friend[];

  // Actions
  addFriend: (friend: FriendInput) => string;
  updateFriend: (id: string, updates: Partial<FriendInput>) => void;
  removeFriend: (id: string) => void;
  getFriendById: (id: string) => Friend | undefined;
}

// Mock data
const mockFriends: Friend[] = [
  {
    id: "1",
    name: "Alex Johnson",
    phone: "(555) 123-4567",
    email: "alex@example.com",
    paymentInfo: {
      email: "alex.payments@example.com",
    },
    createdAt: "2025-04-15T14:30:00Z",
  },
  {
    id: "2",
    name: "Jamie Smith",
    phone: "(555) 987-6543",
    email: "jamie@example.com",
    createdAt: "2025-04-20T09:15:00Z",
  },
  {
    id: "3",
    name: "Taylor Wilson",
    phone: "(555) 456-7890",
    paymentInfo: {
      phoneNumber: "(555) 456-7890",
    },
    createdAt: "2025-05-01T16:45:00Z",
  },
];

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friends: mockFriends,

      addFriend: (friendData) => {
        const id = Date.now().toString();
        const newFriend: Friend = {
          ...friendData,
          id,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          friends: [...state.friends, newFriend],
        }));

        return id;
      },

      updateFriend: (id, updates) => {
        set((state) => ({
          friends: state.friends.map((friend) =>
            friend.id === id ? { ...friend, ...updates } : friend
          ),
        }));
      },

      removeFriend: (id) => {
        set((state) => ({
          friends: state.friends.filter((friend) => friend.id !== id),
        }));
      },

      getFriendById: (id) => {
        return get().friends.find((friend) => friend.id === id);
      },
    }),
    {
      name: "friends-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
