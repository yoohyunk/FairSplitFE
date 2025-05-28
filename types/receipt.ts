export type Receipt = {
  id: string;
  title: string;
  date: string;
  restaurant: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  currency: string;
  items: ReceiptItem[];
  participants: Participant[];
  status: "draft" | "pending" | "completed";
  createdAt: string;
  updatedAt: string;
  paidBy?: string; // ID of the participant who paid
};

export type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
};

export type Participant = {
  id: string;
  name: string;
  approved: boolean;
  paymentInfo?: PaymentInfo;
};

export type PaymentInfo = {
  email?: string;
  phoneNumber?: string;
  accountName?: string;
  accountNumber?: string;
};
