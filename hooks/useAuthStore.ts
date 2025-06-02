import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type PaymentMethod = {
  type: "etransfer" | "bank" | "card";
  email?: string;
  phoneNumber?: string;
  accountName?: string;
  accountNumber?: string;
  isDefault: boolean;
};

export type User = {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  paymentMethods: PaymentMethod[];
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  verificationId: string | null;

  // Actions
  signIn: (phoneNumber: string) => Promise<string>;
  verifyCode: (code: string) => Promise<boolean>;
  signOut: () => void;
  updateProfile: (name: string, email?: string) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, "isDefault">) => void;
  setDefaultPaymentMethod: (index: number) => void;
  removePaymentMethod: (index: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      verificationId: null,

      signIn: async (phoneNumber: string) => {
        set({ isLoading: true });

        try {
          // Simulate API call to send verification code
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Generate a random verification ID
          const verificationId = Math.random().toString(36).substring(2, 15);

          set({
            verificationId,
            isLoading: false,
          });

          return verificationId;
        } catch (error) {
          console.error("Error signing in:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      verifyCode: async (code: string) => {
        set({ isLoading: true });

        try {
          // Simulate API call to verify code
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // In a real app, we would validate the code against the verification ID
          // For demo purposes, we'll accept any 6-digit code
          if (code.length === 6) {
            const { verificationId } = get();
            const phoneNumber = verificationId
              ? `+1${verificationId.substring(0, 10)}`
              : "+15555555555";

            set({
              user: {
                id: Date.now().toString(),
                phoneNumber,
                paymentMethods: [
                  {
                    type: "etransfer",
                    email: "user@example.com",
                    isDefault: true,
                  },
                ],
              },
              isAuthenticated: true,
              isLoading: false,
              verificationId: null,
            });

            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error("Error verifying code:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: () => {
        set({
          user: null,
          isAuthenticated: false,
          verificationId: null,
        });
      },

      updateProfile: (name: string, email?: string) => {
        const { user } = get();

        if (user) {
          set({
            user: {
              ...user,
              name,
              email: email || user.email,
            },
          });
        }
      },

      addPaymentMethod: (method) => {
        const { user } = get();

        if (user) {
          const isFirstMethod = user.paymentMethods.length === 0;

          set({
            user: {
              ...user,
              paymentMethods: [
                ...user.paymentMethods,
                {
                  ...method,
                  isDefault: isFirstMethod,
                },
              ],
            },
          });
        }
      },

      setDefaultPaymentMethod: (index) => {
        const { user } = get();

        if (user && index >= 0 && index < user.paymentMethods.length) {
          const updatedMethods = user.paymentMethods.map((method, i) => ({
            ...method,
            isDefault: i === index,
          }));

          set({
            user: {
              ...user,
              paymentMethods: updatedMethods,
            },
          });
        }
      },

      removePaymentMethod: (index) => {
        const { user } = get();

        if (user && index >= 0 && index < user.paymentMethods.length) {
          const wasDefault = user.paymentMethods[index].isDefault;
          const updatedMethods = user.paymentMethods.filter(
            (_, i) => i !== index
          );

          // If we removed the default method and there are other methods,
          // make the first one the default
          if (wasDefault && updatedMethods.length > 0) {
            updatedMethods[0].isDefault = true;
          }

          set({
            user: {
              ...user,
              paymentMethods: updatedMethods,
            },
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
