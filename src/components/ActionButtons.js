import React from 'react';
import { UserPlus, UserMinus, Printer, RotateCcw } from 'lucide-react';

export default function ActionButtons({ 
  handleSelectAll, 
  selectedPeople, 
  filteredPeopleLength, 
  handleBulkRegister, 
  handleBulkRemove, 
  handlePrint,
  handleDeselectAll,
  hasActiveFilters,
  onResetFilters,
  stats = []
}) {
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between min-h-[60px]">
      <div className="flex items-center gap-4">
        {/* Compact stat badges (neutral, unobtrusive) */}
        {stats.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mr-2">
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

        {selectedPeople.length > 0 && (
          <>
            {/* Select/Deselect Links */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={handleSelectAll}
                className="text-gray-700 hover:text-gray-900"
              >
                Select All
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={handleDeselectAll}
                className="text-gray-700 hover:text-gray-900"
              >
                Deselect
              </button>
            </div>

            {/* Counter */}
            <div className="text-sm text-gray-700">
              Selected: <span className="font-medium">{selectedPeople.length}</span>
              <span className="text-gray-400"> / </span>
              <span>{filteredPeopleLength}</span>
            </div>
          </>
        )}
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-2">
        {selectedPeople.length > 0 && (
          <>
            <button
              onClick={handleBulkRegister}
              className="flex items-center gap-2 px-4 py-2 border border-[#0f2a71] hover:border-[#1c3b8d] text-slate-600 hover:text-[#1c3b8d] rounded-lg font-medium transition text-sm"
            >
              <UserPlus size={16} />
              Add to Registered
            </button>
            <button
              onClick={handleBulkRemove}
              className="flex items-center gap-2 px-4 py-2 border border-[#0f2a71] hover:border-[#1c3b8d] text-slate-600 hover:text-[#1c3b8d] rounded-lg font-medium transition text-sm"
            >
              <UserMinus size={16} />
              Remove from Registered
            </button>
          </>
        )}
        
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
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm"
        >
          <Printer size={16} />
          Print List
        </button>
      </div>
    </div>
  );
}