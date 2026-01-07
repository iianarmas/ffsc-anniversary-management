import React from 'react';

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick,
  ...props
}) {
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-card',
    outlined: 'bg-white border-2 border-gray-200',
    soft: 'bg-gray-50 border border-gray-100',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverEffect = hover || onClick
    ? 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      className={`rounded-card ${variants[variant]} ${paddings[padding]} ${hoverEffect} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Card subcomponents
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 pb-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
