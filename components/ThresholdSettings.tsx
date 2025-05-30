
import React, { useState, useEffect } from 'react';
import type { Threshold, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';
import { PlusIcon, TrashIcon, WalletIcon } from '@heroicons/react/24/outline';

interface ThresholdSettingsProps {
  currentThresholds: Threshold[];
  onUpdateThresholds: (thresholds: Threshold[]) => void;
}

export const ThresholdSettings: React.FC<ThresholdSettingsProps> = ({ currentThresholds, onUpdateThresholds }) => {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);

  useEffect(() => {
    // Initialize with existing thresholds or default structure for all categories
    const initialThresholds = DEFAULT_CATEGORIES.map(cat => {
      const existing = currentThresholds.find(t => t.category === cat);
      return existing ? existing : { category: cat, amount: 0 }; // Default amount 0 if not set
    });
    setThresholds(initialThresholds);
  }, [currentThresholds]);

  const handleAmountChange = (category: Category, amountStr: string) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) && amountStr !== "") return; // Allow empty input for clearing

    setThresholds(prev =>
      prev.map(t => (t.category === category ? { ...t, amount: isNaN(amount) ? 0 : Math.max(0, amount) } : t))
    );
  };
  
  const handleSave = () => {
    // Filter out thresholds with 0 or invalid amounts if you want them to be considered "not set"
    // Or save all, including those with 0. For this example, we save all.
    onUpdateThresholds(thresholds.filter(t => t.amount > 0)); // Only save active thresholds
  };

  return (
    <div className="p-6 bg-slate-700 shadow-xl rounded-lg">
      <h2 className="text-2xl font-semibold text-white mb-6 text-center">Spending Thresholds</h2>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {thresholds.map(threshold => (
          <div key={threshold.category} className="flex items-center justify-between bg-slate-600 p-4 rounded-md shadow">
            <label htmlFor={`threshold-${threshold.category}`} className="text-slate-300 font-medium w-1/3">
              {threshold.category}
            </label>
            <div className="flex items-center w-2/3">
              <span className="text-slate-400 mr-2">€</span>
              <input
                type="number"
                id={`threshold-${threshold.category}`}
                value={threshold.amount === 0 && !currentThresholds.find(ct => ct.category === threshold.category && ct.amount ===0) ? '' : threshold.amount.toString()} // Show empty if 0 and not explicitly set to 0
                onChange={e => handleAmountChange(threshold.category, e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-500 rounded-md text-white focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="w-full mt-8 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-green-500 transition-transform transform hover:scale-105 flex items-center justify-center"
      >
        <WalletIcon className="h-5 w-5 mr-2" />
        Save Thresholds
      </button>
    </div>
  );
};
