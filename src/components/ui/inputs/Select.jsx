import React from 'react';
import ReactSelect from 'react-select';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

const Select = ({
  label,
  error,
  required,
  className,
  placeholder = 'Select an option...',
  isMulti = false,
  isSearchable = true,
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  variant = 'default',
  size = 'md',
  options = [],
  value,
  onChange,
  ...props
}) => {
  const sizeStyles = {
    sm: {
      control: 'min-h-[36px]',
      indicatorContainer: 'p-1',
      placeholder: 'text-sm',
      input: 'text-sm',
      singleValue: 'text-sm',
      multiValue: 'text-sm',
      option: 'text-sm py-2',
    },
    md: {
      control: 'min-h-[44px]',
      indicatorContainer: 'p-2',
      placeholder: 'text-base',
      input: 'text-base',
      singleValue: 'text-base',
      multiValue: 'text-base',
      option: 'text-base py-3',
    },
    lg: {
      control: 'min-h-[56px]',
      indicatorContainer: 'p-3',
      placeholder: 'text-lg',
      input: 'text-lg',
      singleValue: 'text-lg',
      multiValue: 'text-lg',
      option: 'text-lg py-4',
    },
  };

  const variantStyles = {
    default: {
      control: 'border-vedic-border hover:border-vedic-primary',
      controlFocus: 'border-vedic-primary ring-2 ring-vedic-primary/20',
      option: 'hover:bg-vedic-primary/10',
      optionSelected: 'bg-vedic-primary text-white',
    },
    cosmic: {
      control: 'border-cosmic-purple/30 hover:border-cosmic-purple bg-cosmic-purple/5',
      controlFocus: 'border-cosmic-purple ring-2 ring-cosmic-purple/20',
      option: 'hover:bg-cosmic-purple/10',
      optionSelected: 'bg-cosmic-purple text-white',
    },
    vedic: {
      control: 'border-vedic-primary/30 hover:border-vedic-primary bg-vedic-primary/5',
      controlFocus: 'border-vedic-primary ring-2 ring-vedic-accent/20',
      option: 'hover:bg-vedic-accent/10',
      optionSelected: 'bg-vedic-accent text-vedic-text',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = error ? {
    control: 'border-red-500 hover:border-red-600',
    controlFocus: 'border-red-600 ring-2 ring-red-500/20',
    option: 'hover:bg-red-50',
    optionSelected: 'bg-red-500 text-white',
  } : variantStyles[variant];

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'var(--vedic-surface)',
      borderRadius: '0.75rem',
      borderColor: 'transparent',
      boxShadow: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: 'transparent',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '0 0.75rem',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--wisdom-gray)',
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--vedic-text)',
      margin: 0,
      padding: 0,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--vedic-text)',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'var(--vedic-primary)',
      borderRadius: '0.5rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
      padding: '0.125rem 0.5rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: 'var(--wisdom-gray)',
      transition: 'transform 0.3s ease',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      ':hover': {
        color: 'var(--vedic-primary)',
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: 'var(--wisdom-gray)',
      cursor: 'pointer',
      ':hover': {
        color: 'var(--vedic-primary)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--vedic-surface)',
      borderRadius: '0.75rem',
      marginTop: '0.5rem',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '0.25rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'var(--vedic-primary)' : 'transparent',
      color: state.isSelected ? 'white' : 'var(--vedic-text)',
      cursor: 'pointer',
      borderRadius: '0.5rem',
      margin: '0.125rem 0',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: state.isSelected ? 'var(--vedic-primary)' : 'rgba(var(--vedic-primary-rgb), 0.1)',
      },
    }),
    loadingIndicator: (provided) => ({
      ...provided,
      color: 'var(--vedic-primary)',
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: 'var(--wisdom-gray)',
    }),
  };

  const classNames = {
    control: (state) => cn(
      'rounded-xl border transition-all duration-300',
      currentSize.control,
      state.isFocused ? currentVariant.controlFocus : currentVariant.control,
      state.isDisabled && 'opacity-50 cursor-not-allowed'
    ),
    placeholder: () => cn(currentSize.placeholder, 'text-vedic-text-muted'),
    input: () => cn(currentSize.input),
    singleValue: () => cn(currentSize.singleValue),
    multiValue: () => cn(currentSize.multiValue),
    valueContainer: () => 'flex gap-1',
    indicatorsContainer: () => currentSize.indicatorContainer,
    option: (state) => cn(
      currentSize.option,
      'rounded-lg px-3 transition-colors cursor-pointer',
      state.isSelected ? currentVariant.optionSelected : currentVariant.option
    ),
    menu: () => 'z-50',
    menuList: () => 'scrollbar-vedic',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {label && (
        <label className="block mb-2 text-sm font-medium text-vedic-text">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <ReactSelect
        classNames={classNames}
        styles={customStyles}
        placeholder={placeholder}
        isMulti={isMulti}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        options={options}
        value={value}
        onChange={onChange}
        components={{
          LoadingIndicator: () => (
            <div className="pr-2">
              <svg className="animate-spin h-4 w-4 text-vedic-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ),
        }}
        {...props}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default Select;
