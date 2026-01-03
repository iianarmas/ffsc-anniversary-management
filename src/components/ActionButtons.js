import React from 'react';
import { UserPlus, UserMinus, Printer, RotateCcw, Lock } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

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
  stats = [],
  readOnly = false
}) {
  const { profile } = useAuth();

  // Debug logging
  console.log('ActionButtons - selectedPeople:', selectedPeople, 'length:', selectedPeople.length);

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
        {selectedPeople.length > 0 && !readOnly && handleBulkRegister && handleBulkRemove && (
          <>
            <button
              onClick={handleBulkRegister}
              className="flex items-center gap-2 px-4 py-2 border border-[#0f2a71] hover:border-[#1c3b8d] text-slate-600 hover:text-[#1c3b8d] rounded-lg font-medium transition text-sm"
            >
              <UserPlus size={16} />
              Register
            </button>
            <button
              onClick={handleBulkRemove}
              className="flex items-center gap-2 px-4 py-2 border border-[#0f2a71] hover:border-[#1c3b8d] text-slate-600 hover:text-[#1c3b8d] rounded-lg font-medium transition text-sm"
            >
              <UserMinus size={16} />
              Remove
            </button>
          </>
        )}
        
        {readOnly && selectedPeople.length > 0 && (
          <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center gap-2">
            <span className="text-xs">👁️</span>
            View Only - No registration permissions
          </div>
        )}
        
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f204e] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        )}

        {profile?.role !== 'viewer' ? (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm"
          >
            <Printer size={16} />
            Print
          </button>
        ) : (
          <div className="group relative">
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium transition text-sm cursor-not-allowed"
            >
              <Lock size={16} />
              Print
            </button>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
              Contact admin for print access
            </span>
          </div>
        )}
      </div>
    </div>
  );
}