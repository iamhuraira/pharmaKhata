import React from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Us",
};
const ContactUsPage = () => {
  return (
    <>
      <div
        className={
          "flex flex-col gap-12  px-5 lg:px-[120px] lg:pt-[60px] pt-8 lg:pb-[80px] pb-10 border-b border-subtle"
        }
      >
       Hello Contact US
      </div>
    </>
  );
};

export default ContactUsPage;
