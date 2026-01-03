import React from 'react';

export default function StatsBar({ items = [], className = '' }) {
  return (
    <div className={`bg-white rounded-md border border-gray-200 shadow-sm p-2 ${className}`}>
      <div className="flex items-center gap-4 overflow-auto">
        {items.map((it, idx) => (
          <div key={idx} className={`${idx > 0 ? 'pl-4 border-l border-gray-100' : ''} flex items-center gap-3 whitespace-nowrap`}>
            {it.Icon && (
              <div className="text-gray-600 flex-shrink-0">
                <it.Icon size={16} />
              </div>
            )}
            <div className="leading-tight">
              <div className="text-sm font-semibold text-gray-900">{it.value}</div>
              <div className="text-xs text-gray-500">{it.label}</div>
              {it.subtitle && (
                <div className="text-xs text-gray-400 mt-0.5">{it.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
