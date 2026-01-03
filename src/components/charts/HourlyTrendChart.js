import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Calendar } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-green-600">
            <span className="font-semibold">Checked In: {payload[0]?.value || 0}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ totalRegistrations }) => {
  return (
    <div className="flex justify-center gap-8 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-3 bg-green-500 rounded" />
        <span className="text-sm text-gray-600">Checked In</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <div className="w-12 h-0.5 bg-blue-500" />
        <span className="text-sm text-gray-600">{totalRegistrations} Total</span>
      </div>
    </div>
  );
};

export default function HourlyTrendChart({ data, height = 300, selectedDate, onDateChange, totalRegistrations = 0 }) {
  return (
    <div className="h-full flex flex-col">
      {/* Date Picker Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalRegistrations}</span> registrations
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="time" 
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
          
          <Bar 
            dataKey="checkedIn" 
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
          
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            animationDuration={1000}
          />
          
          <Legend content={() => <CustomLegend totalRegistrations={totalRegistrations} />} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}