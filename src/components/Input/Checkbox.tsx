import React, { useState } from 'react';

type CheckboxProps = {
  initialChecked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  label?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({
  initialChecked = false,
  onChange,
  className = '',
  label,
}) => {
  const [isChecked, setIsChecked] = useState(initialChecked);

  const toggleCheckbox = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div
      className={`flex cursor-pointer gap-2  ${className}`}
      onClick={toggleCheckbox}
    >
      <div
        className={`flex size-6  items-center justify-center rounded-[2px] transition-colors duration-100 ${
          isChecked ? 'bg-primary' : 'border-2 border-subtle bg-white'
        }`}
      >
        {isChecked && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z"
              fill="white"
            />
          </svg>
        )}
      </div>
      {label && (
        <label className="mb-[5px] cursor-pointer text-sm font-medium leading-6 text-dark md:text-[1rem]">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
