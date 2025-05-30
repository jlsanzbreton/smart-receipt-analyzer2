
import React from 'react';

interface SpinnerProps {
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex flex-col items-center justify-center z-[999]">
      <div className="w-16 h-16 border-4 border-t-teal-500 border-r-teal-500 border-b-slate-600 border-l-slate-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-white text-lg font-semibold">{message}</p>
    </div>
  );
};
