import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Cell } from 'recharts';

const COLORS = {
  pending: '#fbbf24',  // Yellow
  given: '#10b981',     // Green
  unpaid: '#3b82f6',    // Blue
  paid: '#ef4444'       // Red
};

const CustomLegend = () => {
  return (
    <div className="flex justify-center gap-6 mt-4 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="text-sm text-gray-600">Pending</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-sm text-gray-600">Given</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <span className="text-sm text-gray-600">Unpaid</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-sm text-gray-600">Paid</span>
      </div>
    </div>
  );
};

export default function ShirtDistributionChart({ data, height = 260 }) {
  return (
    <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="size" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            axisLine={false}
          />
          
          <Bar dataKey="pending" stackId="a" fill={COLORS.pending} radius={[0, 0, 0, 0]} />
          <Bar dataKey="given" stackId="a" fill={COLORS.given} radius={[0, 0, 0, 0]} />
          <Bar dataKey="unpaid" stackId="a" fill={COLORS.unpaid} radius={[0, 0, 0, 0]} />
          <Bar dataKey="paid" stackId="a" fill={COLORS.paid} radius={[4, 4, 0, 0]} />
          
          <Legend content={<CustomLegend />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}