import { SelectHTMLAttributes, forwardRef } from 'react';

interface Option {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: Option[];
    error?: string;
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, error, placeholder, className = '', ...props }, ref) => {
        return (
            <div className="form-group">
                {label && <label>{label}</label>}
                <select
                    ref={ref}
                    className={`form-select ${error ? 'error' : ''} ${className}`}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <span className="error-message">{error}</span>}
            </div>
        );
    }
);

Select.displayName = 'Select';
