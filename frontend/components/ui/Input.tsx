'use client';

import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  name = '',
  label = '',
  error = '',
  required = false,
  className = '',
  autoComplete,
}) => {
  const inputClass = `${styles.input} ${error ? styles['input-error'] : ''} ${className}`.trim();

  return (
    <div className={styles['input-group']}>
      {label && (
        <label className={styles['input-label']}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        required={required}
        autoComplete={autoComplete}
      />
      {error && <span className={styles['input-error-message']}>{error}</span>}
    </div>
  );
};

export default Input;

