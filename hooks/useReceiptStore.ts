import { mockReceipts } from "@/mocks/receipts";
import {
  Participant,
  Receipt,
  ReceiptItem,
  ReceiptSummary,
} from "@/types/receipt";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ReceiptState {
  receipts: Receipt[];
  currentReceiptId: string | null;

  // Actions
  addReceipt: (
    receipt: Omit<Receipt, "id" | "createdAt" | "updatedAt">
  ) => string;
  updateReceipt: (id: string, updates: Partial<Receipt>) => void;
  deleteReceipt: (id: string) => void;
  setCurrentReceipt: (id: string | null) => void;

  // Item management
  addItem: (receiptId: string, item: Omit<ReceiptItem, "id">) => void;
  updateItem: (
    receiptId: string,
    itemId: string,
    updates: Partial<ReceiptItem>
  ) => void;
  deleteItem: (receiptId: string, itemId: string) => void;
  assignItemToParticipant: (
    receiptId: string,
    itemId: string,
    participantId: string
  ) => void;
  unassignItemFromParticipant: (
    receiptId: string,
    itemId: string,
    participantId: string
  ) => void;

  // Participant management
  addParticipant: (receiptId: string, name: string) => string;
  updateParticipant: (
    receiptId: string,
    participantId: string,
    updates: Partial<Participant>
  ) => void;
  removeParticipant: (receiptId: string, participantId: string) => void;
  approveParticipant: (receiptId: string, participantId: string) => void;

  // Calculations
  calculateSplitForReceipt: (receiptId: string) => ReceiptSummary[];

  // Getters
  getCurrentReceipt: () => Receipt | null;
  getReceiptById: (id: string) => Receipt | null;
}

export const useReceiptStore = create<ReceiptState>()(
  persist(
    (set, get) => ({
      receipts: mockReceipts,
      currentReceiptId: null,

      addReceipt: (receiptData) => {
        const id = Date.now().toString();
        const timestamp = new Date().toISOString();
        const newReceipt: Receipt = {
          ...receiptData,
          id,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          receipts: [newReceipt, ...state.receipts],
          currentReceiptId: id,
        }));

        return id;
      },

      updateReceipt: (id, updates) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) =>
            receipt.id === id
              ? { ...receipt, ...updates, updatedAt: new Date().toISOString() }
              : receipt
          ),
        }));
      },

      deleteReceipt: (id) => {
        set((state) => ({
          receipts: state.receipts.filter((receipt) => receipt.id !== id),
          currentReceiptId:
            state.currentReceiptId === id ? null : state.currentReceiptId,
        }));
      },

      setCurrentReceipt: (id) => {
        set({ currentReceiptId: id });
      },

      addItem: (receiptId, item) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) => {
            if (receipt.id === receiptId) {
              const newItem: ReceiptItem = {
                ...item,
                id: `${receiptId}-${receipt.items.length + 1}`,
              };
              return {
                ...receipt,
                items: [...receipt.items, newItem],
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          }),
        }));
      },

      updateItem: (receiptId, itemId, updates) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) => {
            if (receipt.id === receiptId) {
              return {
                ...receipt,
                items: receipt.items.map((item) =>
                  item.id === itemId ? { ...item, ...updates } : item
                ),
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          }),
        }));
      },

      deleteItem: (receiptId, itemId) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) => {
            if (receipt.id === receiptId) {
              return {
                ...receipt,
                items: receipt.items.filter((item) => item.id !== itemId),
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          }),
        }));
      },

      assignItemToParticipant: (receiptId, itemId, participantId) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) => {
            if (receipt.id === receiptId) {
              return {
                ...receipt,
                items: receipt.items.map((item) => {
                  if (
                    item.id === itemId &&
                    !item.assignedTo.includes(participantId)
                  ) {
                    return {
                      ...item,
                      assignedTo: [...item.assignedTo, participantId],
                    };
                  }
                  return item;
                }),
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          }),
        }));
      },

      unassignItemFromParticipant: (receiptId, itemId, participantId) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) => {
            if (receipt.id === receiptId) {
              return {
                ...receipt,
                items: receipt.items.map((item) => {
                  if (item.id === itemId) {
                    return {
                      ...item,
                      assignedTo: item.assignedTo.filter(
                        (id) => id !== participantId
                      ),
                    };
                  }
                  return item;
                }),
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          }),
        }));
      },

      addParticipant: (receiptId, name) => {
        const participantId = Date.now().toString();

        set((state) => ({
          receipts: state.receipts.map((receipt) => {
            if (receipt.id === receiptId) {
              const newParticipant: Participant = {
                id: participantId,
                name,
                approved: false,
              };
              return {
                ...receipt,
                participants: [...receipt.participants, newParticipant],
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          }),
        }));

        return participantId;
      },

      updateParticipant: (receiptId, participantId, updates) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) => {
            if (receipt.id === receiptId) {
              return {
                ...receipt,
                participants: receipt.participants.map((participant) =>
                  participant.id === participantId
                    ? { ...participant, ...updates }
                    : participant
                ),
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          }),
        }));
      },

      removeParticipant: (receiptId, participantId) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) => {
            if (receipt.id === receiptId) {
              // Remove participant
              const updatedParticipants = receipt.participants.filter(
                (p) => p.id !== participantId
              );

              // Unassign items from this participant
              const updatedItems = receipt.items.map((item) => ({
                ...item,
                assignedTo: item.assignedTo.filter(
                  (id) => id !== participantId
                ),
              }));

              return {
                ...receipt,
                participants: updatedParticipants,
                items: updatedItems,
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          }),
        }));
      },

      approveParticipant: (receiptId, participantId) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) => {
            if (receipt.id === receiptId) {
              return {
                ...receipt,
                participants: receipt.participants.map((participant) =>
                  participant.id === participantId
                    ? { ...participant, approved: true }
                    : participant
                ),
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          }),
        }));
      },

      calculateSplitForReceipt: (receiptId) => {
        const receipt = get().receipts.find((r) => r.id === receiptId);
        if (!receipt) return [];

        const { items, participants, tax, tip, subtotal } = receipt;

        // Initialize summaries for each participant
        const summaries: ReceiptSummary[] = participants.map((participant) => ({
          participantId: participant.id,
          participantName: participant.name,
          items: [],
          itemsTotal: 0,
          taxShare: 0,
          tipShare: 0,
          total: 0,
        }));

        // Calculate each participant's items and subtotal
        items.forEach((item) => {
          const sharedWith = item.assignedTo.length;
          if (sharedWith === 0) return;

          const pricePerPerson = item.price / sharedWith;

          item.assignedTo.forEach((participantId) => {
            const summary = summaries.find(
              (s) => s.participantId === participantId
            );
            if (summary) {
              summary.items.push({
                id: item.id,
                name: item.name,
                price: pricePerPerson,
                sharedWith,
              });
              summary.itemsTotal += pricePerPerson;
            }
          });
        });

        // Calculate tax and tip proportionally
        summaries.forEach((summary) => {
          const proportion = summary.itemsTotal / subtotal;
          summary.taxShare = tax * proportion;
          summary.tipShare = tip * proportion;
          summary.total =
            summary.itemsTotal + summary.taxShare + summary.tipShare;
        });

        return summaries;
      },

      getCurrentReceipt: () => {
        const { receipts, currentReceiptId } = get();
        if (!currentReceiptId) return null;
        return receipts.find((r) => r.id === currentReceiptId) || null;
      },

      getReceiptById: (id) => {
        return get().receipts.find((r) => r.id === id) || null;
      },
    }),
    {
      name: "receipt-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
