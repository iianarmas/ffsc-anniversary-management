import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, PolarAngleAxis } from 'recharts';

const LOCATION_COLORS = {
  'Main': '#3b82f6',      // Blue
  'Cobol': '#8b5cf6',     // Purple
  'Malacañang': '#ec4899', // Pink
  'Guest': '#10b981'      // Green
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg z-50 relative">
        <p className="font-semibold text-gray-900 mb-3 text-base">{data.location}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-6">
            <span className="text-sm text-gray-700">Total RSVP'd</span>
            <span className="font-bold text-gray-900 text-lg">{data.total}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-sm text-gray-700">Attended</span>
            <span className="font-semibold text-green-600">{data.registered}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-sm text-gray-700">Pending</span>
            <span className="font-semibold text-orange-600">{data.preRegistered}</span>
          </div>
          <div className="flex justify-between items-center gap-6 border-t pt-2 mt-2">
            <span className="text-sm text-gray-700">Of Capacity</span>
            <span className="font-bold text-gray-900">{data.capacityPercentage}%</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-sm text-gray-700">Distribution</span>
            <span className="font-semibold text-gray-700">{data.percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700 font-medium">
            {entry.value}
          </span>
          <span className="text-sm text-gray-500">
            ({entry.payload.total})
          </span>
        </div>
      ))}
    </div>
  );
};

export default function LocationBreakdownChart({ data = [], height = 280, maxCapacity = 220 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No data available
      </div>
    );
  }

  // Calculate totals
  const total = data.reduce((sum, item) => sum + item.total, 0);
  const remaining = maxCapacity - total;
  const capacityPercent = ((total / maxCapacity) * 100).toFixed(1);
  
  const transformedData = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? ((item.total / total) * 100).toFixed(1) : 0,
    capacityPercentage: ((item.total / maxCapacity) * 100).toFixed(1),
    fill: LOCATION_COLORS[item.location] || '#94a3b8',
    // Use capacity percentage instead of distribution percentage
    value: (item.total / maxCapacity) * 100
  })).sort((a, b) => b.total - a.total); // Sort by total descending for better visual

  return (
    <div className="h-full flex flex-col relative">
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart 
          cx="50%" 
          cy="45%" 
          innerRadius="20%" 
          outerRadius="90%" 
          data={transformedData}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            minAngle={15}
            background
            clockWise
            dataKey="value"
            cornerRadius={10}
            animationDuration={1000}
          />
          <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
          <Legend content={<CustomLegend />} />
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* Center stat */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: '-20px' }}>
        <div className="text-3xl font-bold text-gray-900">{total}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">of {maxCapacity}</div>
        <div className="text-sm font-semibold text-blue-600 mt-1">{capacityPercent}% Full</div>
        {remaining > 0 && (
          <div className="text-xs text-orange-600 mt-1">{remaining} slots left</div>
        )}
      </div>
    </div>
  );
}