
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { CategorizedExpense, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../constants';

interface CategoryChartProps {
  expenses: CategorizedExpense[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC0CB', '#A020F0', '#F0E68C', '#ADD8E6',
  '#FA8072', '#D2B48C' 
]; // Ensure enough colors for categories

export const CategoryChart: React.FC<CategoryChartProps> = ({ expenses }) => {
  const dataByCategory = DEFAULT_CATEGORIES.map(category => {
    const total = expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.totalAmount, 0);
    return { name: category, value: total };
  }).filter(item => item.value > 0); // Only show categories with expenses

  if (expenses.length === 0 || dataByCategory.length === 0) {
    return (
      <div className="p-6 bg-slate-700 shadow-xl rounded-lg text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Spending by Category</h2>
        <p className="text-slate-400">No spending data available to display chart.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-700 shadow-xl rounded-lg">
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">Spending by Category</h2>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={dataByCategory}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={window.innerWidth < 640 ? 80 : 120} // Smaller radius for smaller screens
              fill="#8884d8"
              dataKey="value"
              stroke="#334155" // slate-700 for border
            >
              {dataByCategory.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `€${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #475569', borderRadius: '0.5rem', color: '#e2e8f0' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{fontSize: '0.8rem', color: '#94a3b8'}}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
