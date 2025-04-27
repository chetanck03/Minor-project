import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  icon = null,
  iconPosition = 'left',
  animate = false,
}) => {
  // Variant styles
  const variantClasses = {
    primary: 'bg-accent-300 hover:bg-accent-100 text-white focus:ring-accent-300',
    secondary: 'bg-dark-100 hover:bg-dark-200 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    outline: 'bg-transparent border border-accent-300 text-accent-300 hover:bg-accent-300 hover:text-white focus:ring-accent-300',
  };

  // Size styles
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  const baseClasses = `
    font-medium rounded-lg transition-all duration-300 
    focus:outline-none focus:ring-2 focus:ring-opacity-50 
    disabled:opacity-60 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${animate ? 'transform hover:scale-105 active:scale-95' : ''}
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default Button;
