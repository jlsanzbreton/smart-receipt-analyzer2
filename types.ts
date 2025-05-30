
import { DEFAULT_CATEGORIES } from "./constants";

export type Category = typeof DEFAULT_CATEGORIES[number];

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice?: number; // Optional, as not all receipts might have it clearly
  totalPrice: number;
}

export interface ReceiptData {
  vendorName: string;
  transactionDate: string; // YYYY-MM-DD
  items: ReceiptItem[];
  subtotal?: number;
  taxAmount?: number;
  totalAmount: number;
  currency: string; // e.g., EUR
  paymentMethod?: string; // e.g., "Card"
}

export interface Expense extends ReceiptData {
  id: string; // Unique identifier
  originalImageName?: string; // Name of the uploaded image file
  // originalImageBase64?: string; // Base64 of the image, consider storage implications
}

export interface CategorizedExpense extends Expense {
  category: Category;
}

export interface Threshold {
  category: Category;
  amount: number;
}

export interface SavingsInsightItem {
  category: Category;
  observation: string;
  suggestion: string;
  potentialSaving: string;
}

export interface SavingsInsight {
  insights: SavingsInsightItem[];
  overallSummary: string;
}

export interface GeminiReceiptResponse {
  vendorName?: string;
  transactionDate?: string;
  items?: Array<{
    description?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  currency?: string;
  paymentMethod?: string;
}
