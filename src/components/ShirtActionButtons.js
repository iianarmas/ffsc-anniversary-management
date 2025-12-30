import React from 'react';
import { Printer, RotateCcw } from 'lucide-react';

export default function ShirtActionButtons({ 
  hasActiveFilters,
  onResetFilters,
  stats = []
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between min-h-[60px] bg-white">
      <div className="flex items-center gap-4">
        {stats.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap">
                {s.Icon && <s.Icon size={14} className="text-gray-400" />}
                <span className="font-semibold text-gray-900">{s.value}</span>
                <span className="text-gray-500">{s.label}</span>
                {i < stats.length - 1 && <span className="text-gray-300">|</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f204e] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        )}

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm"
        >
          <Printer size={16} />
          Print List
        </button>
      </div>
    </div>
  );
}