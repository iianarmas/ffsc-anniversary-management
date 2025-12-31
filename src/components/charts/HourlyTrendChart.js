import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

const CustomLegend = () => {
  return (
    <div className="flex justify-center gap-8 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-3 bg-gray-300 rounded" />
        <span className="text-sm text-gray-600">Checked In</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <div className="w-12 h-0.5 bg-blue-500" />
        <span className="text-sm text-gray-600">191 Attendees</span>
      </div>
    </div>
  );
};

export default function HourlyTrendChart({ data, height = 300 }) {
  return (
    <div className="h-full flex flex-col">
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
          
          <Legend content={<CustomLegend />} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}