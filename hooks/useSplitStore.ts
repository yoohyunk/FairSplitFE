import { supabase } from "@/app/supabaseClient";
import { create } from "zustand";

interface SplitParticipant {
  id: string;
  email: string;
  user: any;
  joined_at: string;
  agreed: boolean;
  agreed_at: string | null;
}

interface ItemAssignment {
  id: string;
  receipt_item: number;
  receipt_item_name: string;
  receipt_item_price: string;
  participants: SplitParticipant[];
  assigned_at: string;
}

interface Split {
  id: string;
  name: string;
  description: string;
  date_created: string;
  receipt: number | null;
  currency: string;
  status: "draft" | "active" | "finalized" | "cancelled";
  finalization_date: string | null;
  participants: SplitParticipant[];
  assignments: ItemAssignment[];
}

interface ParticipantCost {
  email: string;
  total_cost: number;
  items: {
    item_id: string | number;
    item_name: string;
    cost: number;
    quantity: number;
  }[];
  agreed: boolean;
}

interface SplitCalculation {
  summary: {
    split_id: string;
    split_name: string;
    currency: string;
    total_amount: number;
    total_discount: number;
    total_tax: number;
    total_tips: number;
    participant_count: number;
    agreed_count: number;
  };
  participant_costs: ParticipantCost[];
}

interface SplitSummary {
  id: string;
  name: string;
  description: string;
  status: string;
  currency: string;
  date_created: string;
  finalization_date: string | null;
  participant_count: number;
  agreed_count: number;
  assignment_count: number;
  receipt_id?: number;
  store_name?: string;
  total_amount?: number;
  total_discount?: number;
  total_tax?: number;
  total_tips?: number;
}

interface SplitState {
  currentSplit: Split | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createSplit: (
    name: string,
    description: string,
    receiptId?: number
  ) => Promise<string | null>;
  getSplit: (id: string) => Promise<Split | null>;
  addParticipants: (splitId: string, emails: string[]) => Promise<boolean>;
  removeParticipant: (splitId: string, email: string) => Promise<boolean>;
  agreeToSplit: (splitId: string) => Promise<boolean>;
  assignItems: (
    splitId: string,
    assignments: Array<{
      receipt_item_id: number;
      participant_emails: string[];
    }>
  ) => Promise<boolean>;
  getAssignments: (splitId: string) => Promise<ItemAssignment[] | null>;
  getReceiptItems: (splitId: string) => Promise<any[] | null>;
  calculateSplit: (splitId: string) => Promise<SplitCalculation | null>;
  finalizeSplit: (splitId: string) => Promise<boolean>;
  getSplitSummary: (splitId: string) => Promise<SplitSummary | null>;

  // Getters
  getCurrentSplit: () => Split | null;
  setCurrentSplit: (split: Split | null) => void;
  clearError: () => void;
}

const API_BASE_URL = "http://192.168.1.65:8000/api";

export const useSplitStore = create<SplitState>((set, get) => ({
  currentSplit: null,
  isLoading: false,
  error: null,

  createSplit: async (
    name: string,
    description: string,
    receiptId?: number
  ) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(`${API_BASE_URL}/splits/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          receipt_id: receiptId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create split");
      }

      const splitData = await response.json();
      set({ currentSplit: splitData, isLoading: false });
      return splitData.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  getSplit: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(`${API_BASE_URL}/splits/${id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get split");
      }

      const splitData = await response.json();
      set({ currentSplit: splitData, isLoading: false });
      return splitData;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  addParticipants: async (splitId: string, emails: string[]) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(
        `${API_BASE_URL}/splits/${splitId}/add_participants/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ emails }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add participants");
      }

      // Refresh current split data
      await get().getSplit(splitId);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  removeParticipant: async (splitId: string, email: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(
        `${API_BASE_URL}/splits/${splitId}/remove_participant/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to remove participant");
      }

      // Refresh current split data
      await get().getSplit(splitId);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  agreeToSplit: async (splitId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(`${API_BASE_URL}/splits/${splitId}/agree/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to agree to split");
      }

      // Refresh current split data
      await get().getSplit(splitId);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  assignItems: async (
    splitId: string,
    assignments: Array<{
      receipt_item_id: number;
      participant_emails: string[];
    }>
  ) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(
        `${API_BASE_URL}/splits/${splitId}/assign_items/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ assignments }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to assign items");
      }

      // Refresh current split data
      await get().getSplit(splitId);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  getAssignments: async (splitId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(
        `${API_BASE_URL}/splits/${splitId}/assignments/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get assignments");
      }

      const assignmentsData = await response.json();
      set({ isLoading: false });
      return assignmentsData;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  getReceiptItems: async (splitId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(
        `${API_BASE_URL}/splits/${splitId}/receipt_items/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get receipt items");
      }

      const receiptItemsData = await response.json();
      set({ isLoading: false });
      return receiptItemsData;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  calculateSplit: async (splitId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(
        `${API_BASE_URL}/splits/${splitId}/calculate/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to calculate split");
      }

      const calculationData = await response.json();
      set({ isLoading: false });
      return calculationData;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  finalizeSplit: async (splitId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(
        `${API_BASE_URL}/splits/${splitId}/finalize/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to finalize split");
      }

      // Refresh current split data
      await get().getSplit(splitId);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  getSplitSummary: async (splitId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(
        `${API_BASE_URL}/splits/${splitId}/summary/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get split summary");
      }

      const summaryData = await response.json();
      set({ isLoading: false });
      return summaryData;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  getCurrentSplit: () => get().currentSplit,

  setCurrentSplit: (split: Split | null) => set({ currentSplit: split }),

  clearError: () => set({ error: null }),
}));
