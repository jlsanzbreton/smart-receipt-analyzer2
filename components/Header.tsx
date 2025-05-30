
import React from 'react';
import { PlusCircleIcon, CogIcon, ChartPieIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: 'dashboard' | 'addExpense' | 'settings' | 'analysis') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const NavButton: React.FC<{
    viewName: 'dashboard' | 'addExpense' | 'settings' | 'analysis';
    label: string;
    icon: React.ReactNode;
  }> = ({ viewName, label, icon }) => (
    <button
      onClick={() => onViewChange(viewName)}
      className={`flex flex-col sm:flex-row items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                  ${currentView === viewName 
                    ? 'bg-teal-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
    >
      {icon}
      <span className="mt-1 sm:mt-0 sm:ml-2">{label}</span>
    </button>
  );

  return (
    <header className="bg-slate-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-16">
          <div className="flex items-center">
            <DocumentMagnifyingGlassIcon className="h-8 w-8 text-teal-400" />
            <h1 className="ml-3 text-xl sm:text-2xl font-bold text-white tracking-tight">
              Smart Receipt Analyzer
            </h1>
          </div>
          <nav className="flex space-x-2 sm:space-x-4">
            <NavButton viewName="dashboard" label="Dashboard" icon={<ChartPieIcon className="h-5 w-5" />} />
            <NavButton viewName="addExpense" label="Add New" icon={<PlusCircleIcon className="h-5 w-5" />} />
            <NavButton viewName="settings" label="Settings" icon={<CogIcon className="h-5 w-5" />} />
          </nav>
        </div>
      </div>
    </header>
  );
};
