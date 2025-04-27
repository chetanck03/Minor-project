import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  clickable = false,
  onClick = null
}) => {
  // Variant styles
  const variantClasses = {
    default: 'bg-dark-100 dark:bg-dark-200',
    elevated: 'bg-dark-200 dark:bg-dark-300',
    transparent: 'bg-transparent border border-dark-100 dark:border-dark-200',
  };

  const hoverClasses = hover ? 'transform transition-transform duration-300 hover:scale-[1.02]' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';

  return (
    <div 
      className={`
        p-6 rounded-xl shadow-lg transition-colors duration-300
        ${variantClasses[variant]}
        ${hoverClasses}
        ${clickableClasses}
        ${className}
      `}
      onClick={clickable && onClick ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default Card; 