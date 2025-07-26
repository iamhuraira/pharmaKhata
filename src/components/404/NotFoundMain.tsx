// app/not-found.tsx
'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import Button from '@/components/Button/Button';
import { ArrowBack, Text404 } from '@/components/svg-components';
import Typography from '@/components/Typography';

const NotFoundMain = () => {
  const router = useRouter();
  return (
    <>
      <div className="absolute w-full h-full hidden justify-center items-center sm:flex ">
        <Text404 className="w-[90%]" />
      </div>
      <div className="flex flex-col justify-center  items-center h-full gap-8">
        <div className="flex flex-col px-5 gap-3">
          <Text404 className="w-[85%] sm:hidden" />
          <Typography
            className="text-3xl sm:text-5xl !text-center"
            type="title"
          >
            Page not found
          </Typography>
          <Typography
            className="text-sm sm:text-xl max-w-80 sm:max-w-[490px] text-subtle !text-center"
            type="text"
          >
            The link you clicked may be broken or the page may have been removed
            or renamed.
          </Typography>
        </div>
        <Button className=" !px-6" onClick={() => router.push('/')}>
          <div className="flex gap-1">
            <ArrowBack className="size-6 " />
            Go Back
          </div>
        </Button>
      </div>
    </>
  );
};

export default NotFoundMain;
