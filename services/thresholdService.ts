
import type { Threshold, Category } from '../types';
import { db } from '../db'; // Import Dexie instance
import { DEFAULT_CATEGORIES } from '../constants';

export const getThresholds = async (): Promise<Threshold[]> => {
  try {
    const storedThresholds = await db.thresholds.toArray();
    const allCategoriesMap = new Map<Category, Threshold>();

    // Initialize with defaults
    DEFAULT_CATEGORIES.forEach(cat => {
      allCategoriesMap.set(cat, { category: cat, amount: 0 });
    });

    // Override with stored values
    storedThresholds.forEach(t => {
      if (DEFAULT_CATEGORIES.includes(t.category)) { // Ensure we only use valid categories
        allCategoriesMap.set(t.category, t);
      }
    });
    
    return Array.from(allCategoriesMap.values());
  } catch (error) {
    console.error("Error fetching thresholds from IndexedDB:", error);
    // Fallback to default structure on error
    return DEFAULT_CATEGORIES.map(catName => ({ category: catName, amount: 0 }));
  }
};

export const saveThresholds = async (updatedThresholds: Threshold[]): Promise<void> => {
  try {
    // Create a map of the provided updates for quick lookup
    const updatesMap = new Map<Category, number>();
    updatedThresholds.forEach(t => {
      if (DEFAULT_CATEGORIES.includes(t.category)) {
        updatesMap.set(t.category, t.amount);
      }
    });

    // Prepare a list of all categories with their new amounts
    const thresholdsToSave: Threshold[] = DEFAULT_CATEGORIES.map(cat => ({
      category: cat,
      amount: updatesMap.get(cat) || 0, // Use provided amount or default to 0
    }));
    
    // bulkPut will add or update existing entries based on the primary key (category)
    await db.thresholds.bulkPut(thresholdsToSave);
  } catch (error) {
    console.error("Error saving thresholds to IndexedDB:", error);
    throw error; // Re-throw
  }
};
