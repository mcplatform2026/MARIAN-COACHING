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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    
    // Extract only digits up to 8 chars
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    
    let formatted = "";
    if (digits.length > 0) {
      formatted = digits.slice(0, 2);
      if (digits.length > 2) {
        formatted += "/" + digits.slice(2, 4);
      }
      if (digits.length > 4) {
        formatted += "/" + digits.slice(4, 8);
      }
    }
    
    setDisplayText(formatted);
    onChange(formatted);
  };

  const handleBlur = () => {
    if (!displayText.trim()) {
      onChange("");
      return;
    }
    const formatted = formatDateToMMDDYYYY(displayText);
    if (formatted && formatted !== displayText) {
      setDisplayText(formatted);
      onChange(formatted);
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value;
    if (isoVal) {
      const mmddyyyy = formatDateToMMDDYYYY(isoVal);
      setDisplayText(mmddyyyy);
      onChange(mmddyyyy);
    }
  };

  const currentISO = formatToISODate(displayText) || "";

  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        id={id}
        name={name}
        value={displayText}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-label={ariaLabel || placeholder}
        inputMode="numeric"
        maxLength={10}
        className={`${className} pr-9`}
      />

      <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2.5 pointer-events-none text-neutral-600">
        <Calendar className="w-4 h-4" />
      </div>

      {/* Hidden native picker to allow calendar popover selection while keeping text in MM/DD/YYYY */}
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={currentISO}
        onChange={handlePickerChange}
        disabled={disabled}
        className="absolute right-0 top-0 bottom-0 w-8 opacity-0 cursor-pointer pointer-events-auto"
        title="Open calendar"
      />
    </div>
  );
};

export default AmericanDateInput;
