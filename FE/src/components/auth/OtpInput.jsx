import React, { useEffect, useRef } from 'react';
import { OTP_LENGTH } from '../../utils/otp';

const OtpInput = ({ value, onChange, disabled = false, hasError = false }) => {
  const inputsRef = useRef([]);

  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || '');

  const focusInput = (index) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  useEffect(() => {
    if (!disabled) {
      focusInput(0);
    }
  }, [disabled]);

  const updateValue = (nextDigits) => {
    onChange(nextDigits.join('').slice(0, OTP_LENGTH));
  };

  const handleChange = (index, rawValue) => {
    const cleaned = rawValue.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      updateValue(next);
      return;
    }

    const next = [...digits];
    let cursor = index;

    for (const char of cleaned) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = char;
      cursor += 1;
    }

    updateValue(next);
    focusInput(Math.min(cursor, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] || '');
    updateValue(next);
    focusInput(Math.min(pasted.length, OTP_LENGTH) - 1);
  };

  return (
    <div
      className={`otp-digit-grid ${hasError ? 'has-error' : ''}`}
      style={{ gridTemplateColumns: `repeat(${OTP_LENGTH}, minmax(0, 1fr))` }}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          className="otp-digit-input"
          aria-label={`Chữ số OTP ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
};

export default OtpInput;
