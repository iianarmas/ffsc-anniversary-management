import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  registered: '#10b981',   // Green for attended
  preRegistered: '#e5e7eb' // Light gray for not attended yet
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const attendedPercent = data.total > 0 ? ((data.registered / data.total) * 100).toFixed(1) : 0;
    const notAttendedPercent = data.total > 0 ? ((data.preRegistered / data.total) * 100).toFixed(1) : 0;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-3 text-base">{data.gender}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-700">Attended</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-gray-900">{data.registered}</span>
              <span className="text-xs text-gray-500 ml-1">({attendedPercent}%)</span>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-300"></span>
              <span className="text-sm text-gray-700">Not Yet</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-gray-900">{data.preRegistered}</span>
              <span className="text-xs text-gray-500 ml-1">({notAttendedPercent}%)</span>
            </div>
          </div>
          <div className="flex justify-between items-center gap-4 border-t pt-2 mt-2">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="font-bold text-gray-900">{data.total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function GenderAttendanceChart({ data = [], height = 280 }) {
  // Check for empty data first
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available
      </div>
    );
  }

  // Transform data to percentages for stacked bar
  const transformedData = data.map(item => ({
    ...item,
    attendedPercent: item.total > 0 ? (item.registered / item.total) * 100 : 0,
    notAttendedPercent: item.total > 0 ? (item.preRegistered / item.total) * 100 : 0
  }));

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={transformedData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis 
            type="number"
            domain={[0, 100]}
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category"
            dataKey="gender" 
            stroke="#9ca3af"
            style={{ fontSize: '13px', fontWeight: '500' }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Legend 
            wrapperStyle={{ paddingTop: '15px' }}
            iconType="circle"
            formatter={(value) => {
              if (value === 'attendedPercent') return 'Attended';
              if (value === 'notAttendedPercent') return 'Not Yet';
              return value;
            }}
          />
          <Bar 
            dataKey="attendedPercent" 
            stackId="a"
            fill={COLORS.registered}
            radius={[0, 4, 4, 0]}
            animationDuration={1000}
          />
          <Bar 
            dataKey="notAttendedPercent" 
            stackId="a"
            fill={COLORS.preRegistered}
            radius={[0, 4, 4, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}