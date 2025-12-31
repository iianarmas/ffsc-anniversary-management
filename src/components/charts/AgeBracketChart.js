import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = {
  Adult: '#3b82f6',    // Blue
  Youth: '#8b5cf6',    // Purple
  Kid: '#ec4899',      // Pink
  Toddler: '#fbbf24',  // Yellow
  Child: '#10b981'     // Green
};

export default function AgeBracketChart({ data, height = 320 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
  }));

  // Find the largest segment for the callout
  const largestSegment = dataWithPercentage.reduce((max, item) => 
    item.value > max.value ? item : max, dataWithPercentage[0] || { value: 0 }
  );

  return (
    <div className="relative h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            paddingAngle={2}
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name] || '#94a3b8'}
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  outline: 'none'
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center percentage callout */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-4xl font-bold" style={{ color: COLORS[largestSegment.name] }}>
          {largestSegment.percentage}%
        </div>
      </div>

      {/* Legend on the side */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 space-y-5">
        {dataWithPercentage.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: COLORS[entry.name] }}
            />
            <div className="text-sm">
              <span className="font-medium text-gray-700">{entry.name}</span>
              <span className="text-gray-500 ml-2">{entry.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}