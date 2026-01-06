import React from 'react';

/**
 * Action Preset Card Component
 * Displays a single action preset with icon, name, description, and count
 */
export default function ActionPresetCard({ preset, count, onClick, isActive = false }) {
  const handleClick = () => {
    if (onClick) {
      onClick(preset);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative w-full text-left p-4 rounded-lg border transition-all
        hover:shadow-md hover:scale-105 active:scale-95
        ${isActive
          ? 'border-[#0f2a71] bg-[#0f2a71] text-white shadow-md'
          : 'border-[#0f2a71] bg-white text-[#0f2a71] hover:border-[#0f2a71]'
        }
      `}
    >
      {/* Count Badge */}
      <div className="flex items-start justify-between mb-2">
        <span
          className={`
            px-2 py-1 text-xs font-bold rounded-full
            ${isActive
              ? (count > 0 ? 'bg-white text-[#0f2a71]' : 'bg-white/20 text-white')
              : (count > 0 ? 'bg-[#0f2a71]/10 text-[#0f2a71]' : 'bg-gray-100 text-gray-500')
            }
          `}
        >
          {count !== undefined ? count : '—'}
        </span>
      </div>

      {/* Name */}
      <h3 className={`font-semibold mb-1 ${isActive ? 'text-white' : 'text-[#0f2a71]'}`}>
        {preset.name}
      </h3>

      {/* Description */}
      <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
        {preset.description}
      </p>

      {/* Urgency Indicator (for high urgency items) */}
      {preset.urgency === 'high' && count > 0 && !isActive && (
        <div className="absolute top-2 right-2">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}
    </button>
  );
}
