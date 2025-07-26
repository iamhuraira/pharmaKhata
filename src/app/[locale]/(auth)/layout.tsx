import React from 'react';

import { CompanyLogo } from '@/components/svg-components';

export default function CenteredLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white md:bg-[#FEFEFE]">
      {/* <Image
        src={logo}
        alt="logo"
        className="my-10 h-[50px] w-[180px] object-cover md:m-0 md:h-[100px] md:w-[280px] "
      /> */}
      <div className="my-5">
        <CompanyLogo className="h-[100px] w-[280px] object-cover md:m-0 md:h-[100px] md:w-[280px] " />
      </div>
      <div className="mb-5 flex w-[90%] flex-col items-center justify-center gap-4 sm:w-[65%] md:w-[65%]  lg:w-[35%]  ">
        {children}
      </div>
    </div>
  );
}
