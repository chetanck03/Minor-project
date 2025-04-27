import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'accent', text = 'Loading...' }) => {
  // Size mappings
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Color mappings
  const colorClasses = {
    accent: 'border-accent-300',
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} border-4 border-t-transparent rounded-full animate-spin`}
        role="status" 
        aria-label="loading"
      ></div>
      {text && <p className="mt-2 text-sm text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner; 