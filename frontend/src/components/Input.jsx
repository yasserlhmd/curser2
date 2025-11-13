import React from 'react';
import './Input.css';

const Input = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  name = '',
  label = '',
  error = '',
  required = false,
  className = '',
}) => {
  const inputClass = `input ${error ? 'input-error' : ''} ${className}`.trim();

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
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
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;

