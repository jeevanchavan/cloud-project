import React, { useState } from 'react'

const FormGroup = ({ label, placeholder, value, onChange, type = "text", required = true, id }) => {
    const [ showPassword, setShowPassword ] = useState(false)
    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type
    const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'field')

    return (
        <div className="form-group">
            {label && <label htmlFor={fieldId} className="form-group__label">{label}</label>}
            <div className="form-group__input-wrap">
                <input
                    value={value}
                    onChange={onChange}
                    type={inputType}
                    id={fieldId}
                    name={fieldId}
                    placeholder={placeholder}
                    required={required}
                    className="form-group__input"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="form-group__toggle-btn"
                        title={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

export default FormGroup