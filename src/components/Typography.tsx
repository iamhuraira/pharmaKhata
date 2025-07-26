"use client";

import Link from "next/link";
import React from "react";

type IProps = {
  type: "title" | "body" | "link" | "text" | "error";
  size?: "sm" | "regular" | "md" | "lg";
  color?: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  align?: "left" | "right" | "center" | "justify";
  m?: string;
  p?: string;
  href?: string;
  underline?: boolean;
  id?: string;
};

const classes = {
  title: {
    sm: "font-semibold text-sm",
    regular: "font-semibold text-xl",
    md: "font-semibold md:text-2xl text-xl",
    lg: "font-semibold md:text-[2rem] text-xl",
  },
  body: {
    sm: "font-normal text-sm",
    regular: "font-normal md:text-base text-sm",
    md: "font-medium text-sm",
    lg: "font-medium md:text-base text-sm",
  },
  text: "font-medium text-xs ",
};

const Typography = ({
  type,
  size = "regular",
  color,
  children,
  className,
  style: propStyles,
  href = "",
  align = "left",
  m,
  p,
  underline = true,
  id,
}: IProps) => {
  const style = {
    margin: m,
    padding: p,
    color,
    textAlign: align,
    ...propStyles,
  };

  if (type === "link") {
    return (
      <Link
        href={href}
        id={id}
        className={`cursor-pointer text-sm font-semibold ${underline ? "underline" : ""} ${className} text-secondary hover:text-primaryDark`}
        style={style}
      >
        {children}
      </Link>
    );
  } else if (type === "title") {
    return (
      <h1
        className={`${classes[type][size]} ${className} `}
        id={id}
        style={style}
      >
        {children}
      </h1>
    );
  } else if (type === "body") {
    return (
      <p
        className={`${classes[type][size]} ${className} `}
        id={id}
        style={style}
      >
        {children}
      </p>
    );
  } else if (type === "error") {
    return (
      <p
        className={`mt-1 text-sm text-red-500 ${className} `}
        id={id}
        style={style}
      >
        {children}
      </p>
    );
  }

  return (
    <p className={`${classes[type]} ${className} `} id={id} style={style}>
      {children}
    </p>
  );
};

export default Typography;
