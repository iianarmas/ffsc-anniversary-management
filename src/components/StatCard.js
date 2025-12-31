import React from 'react';

export default function StatCard({ title, value, Icon, variant = 'compact', ariaLabel, onClick, color = 'blue', trend }) {
  const compact = variant === 'compact';
  
  const colorSchemes = {
    blue: {
      bg: 'from-blue-50 to-indigo-50',
      icon: 'text-[#0f2a71]',
      iconBg: 'bg-[#0f2a71]/10',
      value: 'text-[#001740]',
      glow: 'group-hover:shadow-blue-200'
    },
    green: {
      bg: 'from-green-50 to-emerald-50',
      icon: 'text-green-600',
      iconBg: 'bg-green-100',
      value: 'text-green-700',
      glow: 'group-hover:shadow-green-200'
    },
    yellow: {
      bg: 'from-yellow-50 to-amber-50',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      value: 'text-yellow-700',
      glow: 'group-hover:shadow-yellow-200'
    },
    red: {
      bg: 'from-red-50 to-rose-50',
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      value: 'text-red-700',
      glow: 'group-hover:shadow-red-200'
    }
  };

  const scheme = colorSchemes[color];

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      role={onClick ? 'button' : undefined}
      aria-label={ariaLabel || title}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl ${scheme.glow} transition-all duration-300 p-6 ${
        onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#f4d642] transform hover:-translate-y-1' : ''
      }`}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scheme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
              {title}
            </span>
            {trend && (
              <span className={`text-xs font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
          <div className={`text-4xl font-bold ${scheme.value} transition-colors duration-300`}>
            {value}
          </div>
        </div>
        
        {Icon && (
          <div className={`${scheme.iconBg} p-3 rounded-xl transition-transform duration-300 group-hover:scale-110`}>
            <Icon size={28} className={scheme.icon} strokeWidth={2} />
          </div>
        )}
      </div>
    </Wrapper>
  );
}