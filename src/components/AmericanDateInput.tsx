import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import { formatDateToMMDDYYYY, formatToISODate } from "../utils/dateFormat";

interface AmericanDateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
}

export const AmericanDateInput: React.FC<AmericanDateInputProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "MM/DD/YYYY",
  required = false,
  disabled = false,
  id,
  name,
  ariaLabel,
}) => {
  const [displayText, setDisplayText] = useState(() => {
    if (!value) return "";
    return formatDateToMMDDYYYY(value);
  });

  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setDisplayText("");
    } else {
      const formatted = formatDateToMMDDYYYY(value);
      setDisplayText(formatted);
    }
  }, [value]);

  const openCalendar = () => {
    if (disabled) return;
    if (pickerRef.current) {
      try {
        if ('showPicker' in HTMLInputElement.prototype) {
          pickerRef.current.showPicker();
        } else {
          pickerRef.current.focus();
        }
      } catch {
        pickerRef.current?.focus();
      }
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value;
    if (isoVal) {
      const mmddyyyy = formatDateToMMDDYYYY(isoVal);
      setDisplayText(mmddyyyy);
      onChange(mmddyyyy);
    } else {
      setDisplayText("");
      onChange("");
    }
  };

  const currentISO = formatToISODate(displayText) || "";

  return (
    <div
      onClick={openCalendar}
      className="relative flex items-center w-full cursor-pointer select-none"
    >
      {/* Display input formatted as MM/DD/YYYY - read-only to prevent manual typing */}
      <input
        type="text"
        id={id}
        name={name}
        value={displayText}
        readOnly
        tabIndex={-1}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
        className={`${className} pr-9 cursor-pointer select-none pointer-events-none`}
      />

      <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2.5 pointer-events-none text-neutral-600">
        <Calendar className="w-4 h-4" />
      </div>

      {/* Transparent native date picker covering the entire field so tapping/clicking anywhere opens the calendar */}
      <input
        ref={pickerRef}
        type="date"
        aria-hidden="true"
        value={currentISO}
        onChange={handlePickerChange}
        disabled={disabled}
        required={required}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          openCalendar();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            openCalendar();
          } else if (e.key !== 'Tab') {
            // Block typing characters
            e.preventDefault();
          }
        }}
        className="neu-date-picker-input absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto z-10"
        title="Open calendar"
      />
    </div>
  );
};

export default AmericanDateInput;

