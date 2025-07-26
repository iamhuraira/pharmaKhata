"use client";

import clsx from "clsx";
import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

import Typography from "../Typography";

type IProps = {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "text" | "password" | "email" | "number";
  className?: string;
  label?: string;
  name?: string;
  required?: boolean;
  readOnly?: boolean;
  helperText?: string;
  error?: boolean;
  icon?: React.ReactNode;
  inlineLabel?: boolean;
};

const Input = ({
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  className = "",
  label,
  name,
  required = false,
  readOnly = false,
  helperText = "",
  error = false,
  icon,
  inlineLabel,
}: IProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const errorMessage = helperText && error && (
    <Typography type="error">{helperText}</Typography>
  );

  return (
    <div
      className={clsx(
        "flex w-full flex-col",
        inlineLabel && "x-md:flex-row x-md:items-center x-md:gap-4",
        className,
      )}
    >
      {label && (
        <label
          htmlFor={name}
          className={clsx(
            "mb-[5px] text-sm font-medium leading-6 text-dark md:text-[1rem]",
            inlineLabel && "md:w-1/3",
          )}
        >
          {label}
        </label>
      )}

      <div className={clsx(inlineLabel && "md:w-full")}>
        <div
          className={clsx(
            "relative flex justify-between items-center rounded-[4px] border border-subtle p-2 px-2.5 focus-within:border-2 focus-within:outline-none md:p-3 md:px-3.5",
            inlineLabel && "md:w-full",
            !readOnly && "focus-within:border-primary",
            error ? "!border-red-500" : "border-subtle",
          )}
        >
          <input
            type={
              type === "password"
                ? passwordVisible
                  ? "text"
                  : "password"
                : type
            }
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            className={`${type === "password" ? "w-[95%]" : "w-full"}  peer text-sm leading-6 text-dark outline-none placeholder:text-sm placeholder:text-subtle lg:text-base lg:placeholder:text-base `}
            name={name}
            required={required}
            readOnly={readOnly}
          />

          {type === "password" && (
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <FiEye /> : <FiEyeOff />}
            </button>
          )}

          {icon && icon}
        </div>

        {inlineLabel && errorMessage}
      </div>

      {!inlineLabel && errorMessage}
    </div>
  );
};

export default Input;
