import React, { useState } from "react";
import type { CategorizedExpense } from "../types";
import {
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TagIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
} from "@heroicons/react/24/outline";

interface ExpenseListProps {
  expenses: CategorizedExpense[];
  onDeleteExpense: (id: string) => void;
}

const ExpenseItem: React.FC<{
  expense: CategorizedExpense;
  onDelete: (id: string) => void;
}> = ({ expense, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="bg-slate-700 shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div
        className="p-4 sm:p-6 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-semibold text-teal-400">
            {expense.vendorName}
          </h3>
          <p className="text-sm text-slate-300 flex items-center">
            <TagIcon className="h-4 w-4 mr-1.5 text-sky-400" />
            {expense.category}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white flex items-center justify-end">
            <CurrencyEuroIcon className="h-5 w-5 mr-1 text-slate-300" />
            {expense.totalAmount.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 flex items-center justify-end">
            <CalendarDaysIcon className="h-3 w-3 mr-1 text-slate-500" />
            {new Date(expense.transactionDate).toLocaleDateString()}
          </p>
        </div>
        <button className="ml-4 text-slate-400 hover:text-white">
          {isExpanded ? (
            <ChevronUpIcon className="h-6 w-6" />
          ) : (
            <ChevronDownIcon className="h-6 w-6" />
          )}
        </button>
      </div>
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-slate-600">
          <h4 className="text-md font-semibold text-slate-200 mt-3 mb-2">
            Items:
          </h4>
          {expense.items && expense.items.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 max-h-48 overflow-y-auto pr-2 mono-font">
              {expense.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {item.description || "N/A"} (Qty: {item.quantity || 1})
                  </span>
                  <span>€{item.totalPrice?.toFixed(2) || "N/A"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No item details available.</p>
          )}
          {expense.subtotal && (
            <p className="text-sm text-slate-400 mt-2">
              Subtotal: €{expense.subtotal.toFixed(2)}
            </p>
          )}
          {expense.taxAmount && (
            <p className="text-sm text-slate-400">
              Tax: €{expense.taxAmount.toFixed(2)}
            </p>
          )}
          {expense.paymentMethod && (
            <p className="text-sm text-slate-400 mt-2">
              Payment: {expense.paymentMethod}
            </p>
          )}
          <button
            onClick={() => onDelete(expense.id)}
            className="mt-4 flex items-center text-sm text-red-400 hover:text-red-300 transition-colors duration-150 bg-red-800 hover:bg-red-700 px-3 py-1.5 rounded-md"
          >
            <TrashIcon className="h-4 w-4 mr-1.5" />
            Delete Expense
          </button>
        </div>
      )}
    </li>
  );
};

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDeleteExpense,
}) => {
  if (expenses.length === 0) {
    return (
      <p className="text-center text-slate-400 py-8 text-lg">
        No expenses recorded yet. Add one to get started!
      </p>
    );
  }

  // Sort expenses by date, most recent first
  const sortedExpenses = [...expenses].sort(
    (a, b) =>
      new Date(b.transactionDate).getTime() -
      new Date(a.transactionDate).getTime()
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Recent Expenses
      </h2>
      <ul className="space-y-3 sm:space-y-4">
        {sortedExpenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            onDelete={onDeleteExpense}
          />
        ))}
      </ul>
    </div>
  );
};
