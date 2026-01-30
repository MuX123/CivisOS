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
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'button';
  const variantClasses = `button--${variant}`;
  const sizeClasses = `button--${size}`;
  const stateClasses = loading ? 'button--loading' : disabled ? 'button--disabled' : '';
  
  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    stateClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="button__spinner"></span>}
      <span className="button__text">{children}</span>
    </button>
  );
};

export default Button;