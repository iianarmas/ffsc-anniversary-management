import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, UserMinus, Printer, RotateCcw, Lock, XCircle } from 'lucide-react';
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
  readOnly = false,
  advancedFilters,
  onOpenAdvancedFilters,
}) {
  const { profile } = useAuth();
  const [showPrintTooltip, setShowPrintTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2
    });
    setShowPrintTooltip(true);
  };

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between min-h-[60px] border-b border-gray-100">
      <div className="flex items-center gap-4">
        {/* Compact stat badges (neutral, unobtrusive) */}
        {stats.length > 0 && (
          <div className="flex items-center gap-3 text-sm text-gray-600 mr-2">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                {s.Icon && <s.Icon size={14} className="text-gray-500" />}
                <span className="font-semibold text-gray-900">{s.value}</span>
                <span className="text-gray-600 text-xs">{s.label}</span>
                {s.subtitle && (
                  <span className="text-xs text-gray-400 ml-1">{s.subtitle}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedPeople.length > 0 && (
          <>
            {/* Select All / Deselect */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={handleSelectAll}
                className="text-primary-main hover:text-primary-hover font-medium transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                title="Deselect all"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Counter */}
            <div className="px-3 py-1.5 bg-primary-lighter rounded-lg border border-primary-light">
              <span className="text-sm text-gray-600">Selected:</span>{' '}
              <span className="font-semibold text-primary-main">{selectedPeople.length}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-sm text-gray-600">{filteredPeopleLength}</span>
            </div>
          </>
        )}
      </div>


      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Bulk Actions (Register/Remove) */}
        {selectedPeople.length > 0 && !readOnly && handleBulkRegister && handleBulkRemove && (
          <>
            <button
              onClick={handleBulkRegister}
              className="flex items-center gap-2 px-4 py-2 border border-[#0f2a71] hover:border-[#1c3b8d] text-[#0f2a71] hover:text-[#1c3b8d] bg-white rounded-button font-semibold transition-all duration-200 text-sm active:scale-95"
            >
              <UserPlus size={16} />
              Register
            </button>
            <button
              onClick={handleBulkRemove}
              className="flex items-center gap-2 px-4 py-2 border border-[#0f2a71] hover:border-[#1c3b8d] text-[#0f2a71] hover:text-[#1c3b8d] bg-white rounded-button font-semibold transition-all duration-200 text-sm active:scale-95"
            >
              <UserMinus size={16} />
              Remove
            </button>
          </>
        )}

        {/* Read-Only Notice */}
        {readOnly && selectedPeople.length > 0 && (
          <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center gap-2">
            <Lock size={14} />
            View Only - No registration permissions
          </div>
        )}

        {/* Advanced Filters */}
        <button
          onClick={onOpenAdvancedFilters}
          className={`flex items-center gap-2 px-4 py-2 rounded-button font-semibold transition-all duration-200 text-sm shadow-sm active:scale-95 ${
            advancedFilters
              ? 'bg-[#0f2a71] text-white hover:bg-[#0f2a71]/90 border border-[#0f2a71]'
              : 'bg-white text-[#0f2a71] hover:bg-[#f5f7fb] border border-[#0f2a71]'
          }`}
        >
          Advanced Filters
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] hover:bg-[#1c3b8d] text-white rounded-button font-semibold transition-all duration-200 text-sm shadow-sm hover:shadow-card active:scale-95"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        )}

        {/* Print Button */}
        {profile?.role !== 'viewer' ? (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] hover:bg-[#1c3b8d] text-white rounded-button font-semibold transition-all duration-200 text-sm shadow-sm hover:shadow-card active:scale-95"
          >
            <Printer size={16} />
            Print
          </button>
        ) : (
          <>
            <button
              disabled
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setShowPrintTooltip(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-button font-semibold transition-all duration-200 text-sm cursor-not-allowed opacity-60"
            >
              <Lock size={16} />
              Print
            </button>
            {showPrintTooltip &&
              createPortal(
                <div
                  className="fixed px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-dropdown whitespace-nowrap pointer-events-none z-dropdown animate-fade-in"
                  style={{
                    top: `${tooltipPosition.top}px`,
                    left: `${tooltipPosition.left}px`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  Contact admin for print access
                </div>,
                document.body
              )}
          </>
        )}
      </div>
    </div>
  );
}