
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ExpenseList } from './components/ExpenseList';
import { CategoryChart } from './components/CategoryChart';
import { SavingsAnalysis } from './components/SavingsAnalysis';
import { ThresholdSettings } from './components/ThresholdSettings';
import { Notification } from './components/Notification';
import { Spinner } from './components/Spinner';
import { analyzeReceipt, classifyExpense, getSavingsInsights } from './services/geminiService';
import * as expenseService from './services/expenseService'; // Import as namespace
import * as thresholdService from './services/thresholdService'; // Import as namespace
import type { Expense, CategorizedExpense, ReceiptData, Category, Threshold, SavingsInsightItem } from './types';
import { DEFAULT_CATEGORIES, MIGRATION_DONE_KEY } from './constants';
import { db } from './db'; // For direct DB access if needed, e.g. migration checks

type View = 'dashboard' | 'addExpense' | 'settings' | 'analysis';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<CategorizedExpense[]>([]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true for initial load/migration
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [savingsInsights, setSavingsInsights] = useState<SavingsInsightItem[] | null>(null);
  const [overallSavingsSummary, setOverallSavingsSummary] = useState<string | null>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification(message);
    setTimeout(() => setNotification(null), type === 'success' ? 3000 : 5000);
  };

  const loadDataFromDB = useCallback(async () => {
    console.log("[App] Attempting to load data from IndexedDB...");
    setIsLoading(true);
    try {
      const [dbExpenses, dbThresholds] = await Promise.all([
        expenseService.getExpenses(),
        thresholdService.getThresholds()
      ]);
      console.log(`[App] Loaded ${dbExpenses.length} expenses and ${dbThresholds.length} thresholds from DB services.`);
      setExpenses(dbExpenses);
      setThresholds(dbThresholds);
    } catch (err) {
      console.error("[App] Error loading data from IndexedDB services:", err);
      setError("Could not load app data. Please try refreshing.");
      notify("Could not load app data.", "error");
    } finally {
      setIsLoading(false);
      console.log("[App] Finished loading data from IndexedDB.");
    }
  }, []);

  useEffect(() => {
    const migrateAndInitialize = async () => {
      console.log("[App] Starting migration and initialization process...");
      setIsLoading(true);
      const migrationDone = localStorage.getItem(MIGRATION_DONE_KEY);
      console.log(`[App] Migration status (MIGRATION_DONE_KEY=${MIGRATION_DONE_KEY}): ${migrationDone}`);

      if (!migrationDone) {
        console.log("[App] Migration not done. Attempting migration from localStorage to IndexedDB...");
        try {
          const LEGACY_LS_EXPENSES_KEY = 'smartAnalyzerExpenses'; // Ensure this matches your *actual* old key
          const LEGACY_LS_THRESHOLDS_KEY = 'smartAnalyzerThresholds'; // Ensure this matches your *actual* old key

          // Migrate Expenses
          const lsExpensesRaw = localStorage.getItem(LEGACY_LS_EXPENSES_KEY);
          console.log(`[App] Raw expenses from localStorage ('${LEGACY_LS_EXPENSES_KEY}'):`, lsExpensesRaw ? lsExpensesRaw.substring(0, 100) + '...' : 'null');
          if (lsExpensesRaw) {
            const lsExpenses = JSON.parse(lsExpensesRaw) as CategorizedExpense[];
            if (lsExpenses.length > 0) {
              console.log(`[App] Found ${lsExpenses.length} expenses in localStorage. Migrating to IndexedDB...`);
              await db.expenses.bulkPut(lsExpenses);
              console.log(`[App] Successfully migrated ${lsExpenses.length} expenses to IndexedDB.`);
              localStorage.removeItem(LEGACY_LS_EXPENSES_KEY);
              console.log(`[App] Removed expenses from localStorage ('${LEGACY_LS_EXPENSES_KEY}').`);
            } else {
              console.log("[App] No expenses found in localStorage to migrate.");
            }
          } else {
            console.log(`[App] No data found in localStorage for key '${LEGACY_LS_EXPENSES_KEY}'.`);
          }

          // Migrate Thresholds
          const lsThresholdsRaw = localStorage.getItem(LEGACY_LS_THRESHOLDS_KEY);
          console.log(`[App] Raw thresholds from localStorage ('${LEGACY_LS_THRESHOLDS_KEY}'):`, lsThresholdsRaw ? lsThresholdsRaw.substring(0,100) + '...' : 'null');
          if (lsThresholdsRaw) {
            const lsThresholds = JSON.parse(lsThresholdsRaw) as Threshold[];
            if (lsThresholds.length > 0) {
              console.log(`[App] Found ${lsThresholds.length} thresholds in localStorage. Migrating to IndexedDB...`);
              await db.thresholds.bulkPut(lsThresholds);
              console.log(`[App] Successfully migrated ${lsThresholds.length} thresholds to IndexedDB.`);
              localStorage.removeItem(LEGACY_LS_THRESHOLDS_KEY);
              console.log(`[App] Removed thresholds from localStorage ('${LEGACY_LS_THRESHOLDS_KEY}').`);
            } else {
              console.log("[App] No thresholds found in localStorage to migrate.");
            }
          } else {
            console.log(`[App] No data found in localStorage for key '${LEGACY_LS_THRESHOLDS_KEY}'.`);
          }
          
          localStorage.setItem(MIGRATION_DONE_KEY, 'true');
          console.log("[App] Migration process completed. MIGRATION_DONE_KEY set to true.");
          notify('Data successfully migrated to new offline storage.');
        } catch (err) {
          console.error('[App] Error during data migration from localStorage to IndexedDB:', err);
          setError('Failed to migrate old data. Some data may be missing or app may not work as expected.');
          notify('Error during data migration.', 'error');
          // Do not set MIGRATION_DONE_KEY if migration fails
        }
      } else {
        console.log("[App] Migration already marked as done. Skipping localStorage migration.");
      }
      
      console.log("[App] Populating initial/missing thresholds in IndexedDB if necessary...");
      await db.populateInitialThresholds(); // Ensure default thresholds are populated
      
      console.log("[App] Proceeding to load all data from DB services...");
      await loadDataFromDB(); 
    };

    migrateAndInitialize();
  }, [loadDataFromDB]); // loadDataFromDB is stable due to useCallback with empty deps


  const checkThresholds = useCallback((updatedExpenses: CategorizedExpense[], currentThresholds: Threshold[]) => {
    if (!currentThresholds || currentThresholds.length === 0) return;

    const monthlyExpensesByCategory: Record<Category, number> = {} as Record<Category, number>;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    updatedExpenses.forEach(exp => {
      const expenseDate = new Date(exp.transactionDate);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        monthlyExpensesByCategory[exp.category] = (monthlyExpensesByCategory[exp.category] || 0) + exp.totalAmount;
      }
    });

    currentThresholds.forEach(thr => {
      if (thr.amount > 0 && monthlyExpensesByCategory[thr.category] && monthlyExpensesByCategory[thr.category] > thr.amount) {
        notify(`Warning: Spending for ${thr.category} (€${monthlyExpensesByCategory[thr.category].toFixed(2)}) has exceeded your threshold of €${thr.amount.toFixed(2)}!`, "error");
      }
    });
  }, [notify]); 


  useEffect(() => {
    if (expenses.length > 0 && thresholds.length > 0) {
        console.log("[App] Expenses or thresholds state updated, re-checking thresholds.");
        checkThresholds(expenses, thresholds);
    }
  }, [expenses, thresholds, checkThresholds]);


  const handleImageUpload = async (imageDataBase64: string, fileName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const receiptData = await analyzeReceipt(imageDataBase64);
      if (!receiptData || !receiptData.totalAmount || !receiptData.vendorName) {
        throw new Error('Failed to extract essential data from receipt.');
      }

      let category = await classifyExpense(receiptData.vendorName, receiptData.items.map(item => item.description).join(', '));
      if (!DEFAULT_CATEGORIES.includes(category as Category)) {
        category = 'Other';
      }

      const newExpense: CategorizedExpense = {
        id: Date.now().toString(),
        ...receiptData,
        category: category as Category,
        originalImageName: fileName,
      };
      console.log("[App] New expense processed, adding to DB:", newExpense);
      await expenseService.addExpense(newExpense);
      await loadDataFromDB(); 
      notify(`Expense from ${newExpense.vendorName} added and categorized as ${newExpense.category}.`);
      setCurrentView('dashboard');
    } catch (err) {
      console.error("[App] Error processing receipt:", err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred during receipt processing.';
      setError(message);
      notify(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setIsLoading(true);
    try {
      console.log(`[App] Deleting expense with ID: ${id}`);
      await expenseService.deleteExpense(id);
      await loadDataFromDB(); 
      notify('Expense deleted.');
    } catch (err) {
      console.error("[App] Error deleting expense:", err);
      const message = "Failed to delete expense.";
      setError(message);
      notify(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateThresholds = async (updatedThresholds: Threshold[]) => {
    setIsLoading(true);
    try {
      console.log("[App] Updating thresholds:", updatedThresholds);
      await thresholdService.saveThresholds(updatedThresholds);
      await loadDataFromDB(); 
      notify('Spending thresholds updated.');
    } catch (err) {
        console.error("[App] Error updating thresholds:", err);
        const message = "Failed to update thresholds.";
        setError(message);
        notify(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSavingsAnalysis = async () => {
    if (expenses.length === 0) {
      setError("Not enough data for savings analysis. Please add some expenses first.");
      notify("Not enough data for savings analysis.", "error");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSavingsInsights(null);
    setOverallSavingsSummary(null);
    try {
      console.log("[App] Requesting savings analysis for current expenses.");
      const result = await getSavingsInsights(expenses);
      setSavingsInsights(result.insights);
      setOverallSavingsSummary(result.overallSummary);
      setCurrentView('analysis');
    } catch (err) {
      console.error("[App] Error getting savings insights:", err);
      const message = err instanceof Error ? err.message : 'Failed to generate savings analysis.';
      setError(message);
      notify(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'addExpense':
        return <FileUpload onImageUpload={handleImageUpload} />;
      case 'settings':
        return <ThresholdSettings currentThresholds={thresholds} onUpdateThresholds={handleUpdateThresholds} />;
      case 'analysis':
        return <SavingsAnalysis insights={savingsInsights} overallSummary={overallSavingsSummary} />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <CategoryChart expenses={expenses} />
            <div className="flex justify-center">
                <button
                    onClick={handleRequestSavingsAnalysis}
                    disabled={isLoading || expenses.length === 0} 
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Analyze Savings
                </button>
            </div>
            <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
          </div>
        );
    }
  };
  
  const spinnerMessage = localStorage.getItem(MIGRATION_DONE_KEY) ? "Processing..." : "Migrating data...";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {isLoading && <Spinner message={spinnerMessage}/>}
        {error && <Notification message={`${error}`} type="error" onClose={() => setError(null)} duration={5000} />}
        {notification && (!error || notification !== error) && <Notification message={notification} type={notification.toLowerCase().includes("error") || notification.toLowerCase().includes("failed") || notification.toLowerCase().includes("warning") ? "error" : "success"} onClose={() => setNotification(null)} />}
        
        {renderView()}
      </main>
      <footer className="text-center p-4 text-slate-400 text-sm border-t border-slate-700">
        Smart Receipt Analyzer &copy; {new Date().getFullYear()} (Offline Enabled)
      </footer>
    </div>
  );
};

export default App;
