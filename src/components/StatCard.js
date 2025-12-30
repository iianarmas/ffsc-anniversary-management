import React from 'react';

export default function StatCard({ title, value, Icon, variant = 'compact', ariaLabel, onClick }) {
  const compact = variant === 'compact';
  const containerBase = `bg-white rounded-md border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${compact ? 'p-3' : 'p-6'}`;

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <div
      as={Wrapper}
      role={onClick ? 'button' : 'group'}
      aria-label={ariaLabel || title}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      className={`${containerBase} ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200' : ''}`}
    >
      <div className={`flex items-center ${compact ? 'justify-between' : 'flex-col items-start'}`}>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="text-gray-600 flex-shrink-0">
              <Icon size={compact ? 18 : 24} />
            </div>
          )}
          <div>
            <div className="text-xs uppercase text-gray-500">{title}</div>
            <div className={`${compact ? 'text-lg font-semibold text-gray-900' : 'text-2xl font-bold text-gray-900'}`}>
              {value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
