
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17'; // For OCR, classification, analysis
// export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002'; // If image generation was needed

export const DEFAULT_CATEGORIES = [
  'Groceries',
  'Dining Out',
  'Transportation',
  'Utilities',
  'Shopping', // General shopping
  'Entertainment',
  'Healthcare',
  'Travel',
  'Education',
  'Gifts',
  'Services', // e.g. hairdresser, repairs
  'Other',
] as const; // `as const` makes it a readonly tuple of string literals

// LOCAL_STORAGE_EXPENSES_KEY and LOCAL_STORAGE_THRESHOLDS_KEY are no longer needed.
// Data will be stored in IndexedDB.
// A migration key for localStorage can be added if needed during transition.
export const MIGRATION_DONE_KEY = 'indexedDBMigrationDone_v1';


export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];