import React from 'react';
import { User } from 'lucide-react';

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-32 h-32 text-4xl'
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getGradient = (name) => {
    // Generate consistent gradient based on name
    if (!name) return 'from-gray-600 to-gray-800';
    
    const gradients = [
      'from-blue-600 to-blue-800',
      'from-purple-600 to-purple-800',
      'from-green-600 to-green-800',
      'from-red-600 to-red-800',
      'from-orange-600 to-orange-800',
      'from-pink-600 to-pink-800',
      'from-indigo-600 to-indigo-800',
      'from-teal-600 to-teal-800',
    ];
    
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          // If image fails to load, hide it and show initials
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-bold ${className}`}>
      {getInitials(name)}
    </div>
  );
}