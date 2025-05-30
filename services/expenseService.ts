
import type { CategorizedExpense } from '../types';
import { db } from '../db'; // Import Dexie instance

export const getExpenses = async (): Promise<CategorizedExpense[]> => {
  console.log("[expenseService] Attempting to fetch expenses from IndexedDB...");
  try {
    const expenses = await db.expenses.orderBy('transactionDate').reverse().toArray();
    console.log(`[expenseService] Fetched ${expenses.length} expenses from IndexedDB.`);
    // Ensure date exists, though with proper data entry this might be redundant.
    return expenses.map(exp => ({
      ...exp,
      transactionDate: exp.transactionDate || new Date().toISOString().split('T')[0]
    }));
  } catch (error) {
    console.error("[expenseService] Error fetching expenses from IndexedDB:", error);
    return []; // Return empty array on error
  }
};

export const addExpense = async (newExpense: CategorizedExpense): Promise<void> => {
  console.log("[expenseService] Adding new expense to IndexedDB:", newExpense.id);
  try {
    await db.expenses.add(newExpense);
    console.log("[expenseService] Successfully added expense:", newExpense.id);
  } catch (error) {
    console.error("[expenseService] Error adding expense to IndexedDB:", error);
    throw error; // Re-throw to be caught by caller
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  console.log(`[expenseService] Deleting expense with ID: ${id} from IndexedDB.`);
  try {
    await db.expenses.delete(id);
    console.log(`[expenseService] Successfully deleted expense: ${id}`);
  } catch (error) {
    console.error("[expenseService] Error deleting expense from IndexedDB:", error);
    throw error; // Re-throw
  }
};

export const updateExpense = async (updatedExpense: CategorizedExpense): Promise<void> => {
  console.log("[expenseService] Updating expense in IndexedDB:", updatedExpense.id);
  try {
    await db.expenses.put(updatedExpense);
    console.log("[expenseService] Successfully updated expense:", updatedExpense.id);
  } catch (error) {
    console.error("[expenseService] Error updating expense in IndexedDB:", error);
    throw error; // Re-throw
  }
};

// Helper function to get a single expense, if needed elsewhere
export const getExpenseById = async (id: string): Promise<CategorizedExpense | undefined> => {
  console.log(`[expenseService] Fetching expense by ID: ${id} from IndexedDB.`);
  try {
    const expense = await db.expenses.get(id);
    console.log(`[expenseService] Fetched expense by ID ${id}:`, expense ? 'Found' : 'Not Found');
    return expense;
  } catch (error) {
    console.error("[expenseService] Error fetching expense by ID from IndexedDB:", error);
    return undefined;
  }
};
