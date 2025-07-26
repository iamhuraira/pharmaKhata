"use client";

import React from "react";
import Typography from "@/components/Typography";

interface PageHeaderProps {
  heading: string;
}

export default function PageHeader({ heading }: PageHeaderProps) {
  return (
    <>
      <div className={" flex justify-center "}>
        <div
          className={
            " py-12 px-6 lg:pt-[60px] lg:px-[100px] lg:pb-[80px] flex flex-col items-center rounded-[12px] bg-[rgba(110,81,217,0.16)]" +
            " shadow-[0px_4px_4px_rgba(0,0,0,0.25)] relative overflow-hidden w-full"
          }
        >
          <Typography
            type={"text"}
            size={"md"}
            className={
              "text-[#252525] 3xl:!text-5xl  !text-[32px] !leading-[140%]  !text-center px-5 x-lg:px-[120px] !font-semibold "
            }
          >
            {heading}
          </Typography>
        </div>
      </div>
    </>
  );
}
