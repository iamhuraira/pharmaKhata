// app/not-found.tsx
'use client';

import NotFoundMain from '@/components/404/NotFoundMain';
import { CircleShadow } from '@/components/svg-components';

const NotFound = () => {
  return (
    <div className="w-full h-[100vh] relative">
      <CircleShadow className="absolute lift-0 top-0 rotate-180 size-72 sm:size-96 " />
      <NotFoundMain />
      <CircleShadow className="absolute right-0 bottom-0 size-72  sm:size-96" />
    </div>
  );
};

export default NotFound;
