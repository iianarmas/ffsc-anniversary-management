import React from 'react';

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) {
  const baseStyles = 'rounded-button font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-[#0f2a71] hover:bg-[#1c3b8d] text-white shadow-soft hover:shadow-card',
    secondary: 'bg-white border-2 border-[#0f2a71] hover:border-[#1c3b8d] text-[#0f2a71] hover:text-[#1c3b8d] hover:bg-[#f5f7fb]',
    accent: 'bg-[#db8916] hover:bg-[#c47a12] text-white shadow-soft hover:shadow-card',
    tertiary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    ghost: 'text-[#0f2a71] hover:text-[#1c3b8d] hover:bg-[#f5f7fb]',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-soft hover:shadow-card',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-soft hover:shadow-card',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={16} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={16} />}
    </button>
  );
}
