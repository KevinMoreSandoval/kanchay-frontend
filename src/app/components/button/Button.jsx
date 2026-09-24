import React from 'react';
import styles from './Button.module.css';

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const buttonStyle = variant === 'outline' ? styles.outline : styles.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${buttonStyle} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};