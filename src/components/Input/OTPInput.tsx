import React from 'react';

import Typography from '../Typography';

type IOTPInputProps = {
  separator: React.ReactNode;
  length: number;
  value: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  error?: boolean;
  helperText?: string;
};

const OTPInput = ({
  separator,
  length,
  value,
  onChange,
  onBlur,
  error,
  helperText,
}: IOTPInputProps) => {
  const inputRefs = React.useRef<HTMLInputElement[]>(Array.from({ length }));

  const focusInput = (targetIndex: number) => {
    const targetInput = inputRefs.current[targetIndex];
    targetInput?.focus();
  };

  const selectInput = (targetIndex: number) => {
    const targetInput = inputRefs.current[targetIndex];
    targetInput?.select();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    currentIndex: number,
  ) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case ' ':
        event.preventDefault();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (currentIndex > 0) {
          focusInput(currentIndex - 1);
          selectInput(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (currentIndex < length - 1) {
          focusInput(currentIndex + 1);
          selectInput(currentIndex + 1);
        }
        break;
      case 'Delete':
        event.preventDefault();
        onChange((prevOtp) => {
          const otp
            = prevOtp.slice(0, currentIndex) + prevOtp.slice(currentIndex + 1);
          return otp;
        });

        break;
      case 'Backspace':
        event.preventDefault();
        if (currentIndex > 0) {
          focusInput(currentIndex - 1);
          selectInput(currentIndex - 1);
        }

        onChange((prevOtp) => {
          const otp
            = prevOtp.slice(0, currentIndex) + prevOtp.slice(currentIndex + 1);
          return otp;
        });
        break;

      default:
        break;
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    currentIndex: number,
  ) => {
    const currentValue = event.target.value;
    let indexToEnter = 0;

    while (indexToEnter <= currentIndex) {
      if (
        inputRefs.current[indexToEnter]?.value
        && indexToEnter < currentIndex
      ) {
        indexToEnter += 1;
      } else {
        break;
      }
    }
    onChange((prev) => {
      const otpArray = prev.split('');
      const lastValue = currentValue[currentValue.length - 1];
      otpArray[indexToEnter] = lastValue as string;
      return otpArray.join('');
    });
    if (currentValue !== '') {
      if (currentIndex < length - 1) {
        focusInput(currentIndex + 1);
      }
    }
  };

  const handleClick = (
    _event: React.MouseEvent<HTMLInputElement, MouseEvent>,
    currentIndex: number,
  ) => {
    selectInput(currentIndex);
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    currentIndex: number,
  ) => {
    event.preventDefault();
    const clipboardData = event.clipboardData;

    // Check if there is text data in the clipboard
    if (clipboardData.types.includes('text/plain')) {
      let pastedText = clipboardData.getData('text/plain');
      pastedText = pastedText.substring(0, length).trim();
      let indexToEnter = 0;

      while (indexToEnter <= currentIndex) {
        if (
          inputRefs.current[indexToEnter]?.value
          && indexToEnter < currentIndex
        ) {
          indexToEnter += 1;
        } else {
          break;
        }
      }

      const otpArray = value.split('');

      for (let i = indexToEnter; i < length; i += 1) {
        const lastValue = pastedText[i - indexToEnter] ?? ' ';
        otpArray[i] = lastValue;
      }

      onChange(otpArray.join(''));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value.length === 0 && onBlur) {
      onBlur(event);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-3">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length }).map((_, index) => (
          <React.Fragment key={index}>
            <input
              ref={(ref) => {
                inputRefs.current[index] = ref as HTMLInputElement;
              }}
              className={` ${value[index] ? 'border-primary' : ''} ${error ? '!border-danger' : ''} size-[60px] rounded-xl border-[1.6px] border-subtle text-center text-[20px] font-semibold focus:border-primary focus:outline-none`}
              type="text"
              value={value[index] || ''}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onClick={e => handleClick(e, index)}
              onPaste={e => handlePaste(e, index)}
              onBlur={handleBlur}
            />
            {index === length - 1 ? null : separator}
          </React.Fragment>
        ))}
      </div>
      {error && (
        <Typography type="error" m="0" align="center">
          {helperText}
        </Typography>
      )}
    </div>
  );
};

export default OTPInput;
