import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="form-group">
                {label && <label>{label}</label>}
                <input
                    ref={ref}
                    className={`form-input ${error ? 'error' : ''} ${className}`}
                    {...props}
                />
                {error && <span className="error-message">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
