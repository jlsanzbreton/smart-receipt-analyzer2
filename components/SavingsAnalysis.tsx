
import React from 'react';
import type { SavingsInsightItem } from '../types';
import { LightBulbIcon, BanknotesIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

interface SavingsAnalysisProps {
  insights: SavingsInsightItem[] | null;
  overallSummary: string | null;
}

export const SavingsAnalysis: React.FC<SavingsAnalysisProps> = ({ insights, overallSummary }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="p-6 bg-slate-700 shadow-xl rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">Savings Analysis</h2>
        <p className="text-slate-400">No savings insights available. This might be due to insufficient data or an issue generating the analysis.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-700 shadow-xl rounded-lg space-y-6">
      <h2 className="text-2xl sm:text-3xl font-semibold text-white text-center mb-6">Savings Analysis</h2>

      {overallSummary && (
        <div className="bg-slate-600 p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-teal-400 mb-2 flex items-center">
            <ChatBubbleBottomCenterTextIcon className="h-6 w-6 mr-2" />
            Overall Summary
          </h3>
          <p className="text-slate-300">{overallSummary}</p>
        </div>
      )}

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-slate-600 p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold text-sky-400 mb-2">{insight.category}</h4>
            <div className="space-y-2 text-sm">
              <p className="text-slate-300 flex items-start">
                <LightBulbIcon className="h-5 w-5 mr-2 mt-0.5 text-yellow-400 flex-shrink-0" />
                <span><strong className="font-medium text-slate-200">Observation:</strong> {insight.observation}</span>
              </p>
              <p className="text-slate-300 flex items-start">
                <BanknotesIcon className="h-5 w-5 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                <span><strong className="font-medium text-slate-200">Suggestion:</strong> {insight.suggestion}</span>
              </p>
              <p className="text-slate-300 flex items-start">
                <span className="font-medium text-slate-200 ml-7">Potential Saving: {insight.potentialSaving}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
