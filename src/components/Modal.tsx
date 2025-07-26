"use client";

import React from "react";

import { CloseIcon } from "./svg-components";
import Typography from "./Typography";

type IModalProps = {
  children: React.ReactNode;
  toggleModal?: () => void;
  modalTitle?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xs" | "xlg";
};

const Modal = ({
  children,
  modalTitle = "",
  toggleModal,
  size = "md",
  className,
}: IModalProps) => {
  const sizes = {
    xs: "!w-[30%]",
    sm: "!w-[80%] md:!w-[40%]",
    md: "!w-[50%]",
    lg: "!w-[61%]",
    xlg: "!w-[80%]",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-[#25252580] "
        onKeyDown={(_e) => {}}
        role="button"
        tabIndex={0}
        onClick={toggleModal}
        aria-label="Close modal"
      ></div>
      <div
        className={`fixed left-1/2 top-1/2 z-50 box-border w-full max-w-[976px] -translate-x-1/2 -translate-y-1/2 rounded-[9px] border border-[#c4c4c4] bg-[white] shadow-lg ${sizes[size]}`}
      >
        <div
          className={` max-h-[80vh]   overflow-y-auto overflow-x-hidden rounded-lg bg-white p-8 shadow-md ${className} `}
        >
          <div className=" flex items-center justify-between ">
            <Typography type="title" size="regular">
              {modalTitle}
            </Typography>
            <button
              type="button"
              className="cursor-pointer"
              onClick={toggleModal}
              aria-label="Close modal"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
