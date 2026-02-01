import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'small',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  // Base classes for Discord-style buttons
  const baseClasses = 'inline-flex items-center justify-center rounded transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#202225]';

  // Size variants - Adjusted for better mobile experience
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base',
  };

  // Color variants (Discord Official Palette)
  const variantClasses = {
    primary: 'bg-[#5865F2] hover:bg-[#4752C4] text-white focus:ring-[#5865F2]',
    secondary: 'bg-[#4f545c] hover:bg-[#686d73] text-white focus:ring-[#4f545c]',
    success: 'bg-[#57F287] hover:bg-[#3ba55d] text-black focus:ring-[#57F287]',
    warning: 'bg-[#FEE75C] hover:bg-[#d4b942] text-black focus:ring-[#FEE75C]',
    danger: 'bg-[#ED4245] hover:bg-[#b03537] text-white focus:ring-[#ED4245]',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  const loadingClasses = 'cursor-wait';

  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? disabledClasses : ''}
    ${loading ? loadingClasses : ''}
    ${className}
  `;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
