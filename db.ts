
import Dexie, { type Table } from 'dexie';
import type { CategorizedExpense, Threshold, Category } from './types';
import { DEFAULT_CATEGORIES } from './constants';

export class SmartReceiptAnalyzerDB extends Dexie {
  expenses!: Table<CategorizedExpense, string>; // Primary key is string (id)
  thresholds!: Table<Threshold, Category>;    // Primary key is Category (string)

  constructor() {
    super('SmartReceiptAnalyzerDB');
    this.version(1).stores({
      expenses: 'id, category, transactionDate', // 'id' is primary key, others are indexes
      thresholds: 'category',                     // 'category' is primary key
    });
  }

  async populateInitialThresholds(): Promise<void> {
    const existingCategoriesInDb = (await this.thresholds.toArray()).map(t => t.category);
    const categoriesToSeed = DEFAULT_CATEGORIES.filter(
      cat => !existingCategoriesInDb.includes(cat)
    );

    if (categoriesToSeed.length > 0) {
      try {
        await this.thresholds.bulkAdd(
          categoriesToSeed.map(cat => ({ category: cat, amount: 0 }))
        );
        console.log('[db.ts] Successfully seeded missing default thresholds into IndexedDB.');
      } catch (error) {
        console.error('[db.ts] Error seeding default thresholds:', error);
      }
    } else {
      console.log('[db.ts] All default thresholds already exist in IndexedDB or no default categories defined.');
    }
  }
}

export const db = new SmartReceiptAnalyzerDB();

// Open the database. This will also trigger versioning and schema creation if needed.
db.open().then(async () => {
  console.log("[db.ts] SmartReceiptAnalyzerDB opened successfully.");
  // NOTE: Removed db.populateInitialThresholds() call from here.
  // It's more robustly called from App.tsx after migration and initial setup.
}).catch('MissingPrimaryExpression', err => {
    console.warn("[db.ts] IndexedDB 'MissingPrimaryExpression' error during open (often ignorable in dev with HMR):", err);
}).catch(err => {
  console.error(`[db.ts] Failed to open SmartReceiptAnalyzerDB: ${err.stack || err}`);
});
