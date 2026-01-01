import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Cell, Tooltip } from 'recharts';

const COLORS = {
  pending: '#fbbf24',  // Yellow
  given: '#10b981',     // Green
  unpaid: '#3b82f6',    // Blue
  paid: '#ef4444'       // Red
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.pending + data.given + data.unpaid + data.paid;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-3 text-base">Size {label}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="text-sm text-gray-700">Pending</span>
            </div>
            <span className="font-semibold text-gray-900">{data.pending}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-700">Given</span>
            </div>
            <span className="font-semibold text-gray-900">{data.given}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-sm text-gray-700">Unpaid</span>
            </div>
            <span className="font-semibold text-gray-900">{data.unpaid}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-sm text-gray-700">Paid</span>
            </div>
            <span className="font-semibold text-gray-900">{data.paid}</span>
          </div>
          <div className="flex justify-between items-center gap-6 border-t pt-2 mt-2">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="font-bold text-gray-900">{total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
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
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          
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