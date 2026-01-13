import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, RotateCcw, Lock } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

export default function ShirtActionButtons({
  hasActiveFilters,
  onResetFilters,
  stats = [],
  advancedFilters,
  onOpenAdvancedFilters,
  handlePrint
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
        {/* Advanced Filters Button */}
        <button
          onClick={onOpenAdvancedFilters}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition text-sm ${
            advancedFilters
              ? 'bg-[#0f2a71] text-white border border-[#0f2a71] hover:bg-[#0f2a71]/90'
              : 'text-[#0f2a71] bg-white hover:bg-gray-50 border border-[#0f2a71]'
          }`}
        >
          Advanced Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f204e] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm"
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
        )}

        {profile?.role !== 'viewer' ? (
          <button
            onClick={handlePrint || (() => window.print())}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] hover:bg-[#1c3b8d] text-white rounded-lg font-medium transition text-sm"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium transition text-sm cursor-not-allowed"
            >
              <Lock size={16} />
              Print
            </button>
            {showPrintTooltip && createPortal(
              <div
                className="fixed px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap pointer-events-none z-[9999]"
                style={{
                  top: `${tooltipPosition.top}px`,
                  left: `${tooltipPosition.left}px`,
                  transform: 'translate(-50%, -100%)'
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