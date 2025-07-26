'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { closeSidebar } from '@/redux/slices/layoutSlice';

import Typography from './Typography';

type LinkItemProps = {
  href: string;
  title: string;
  children: ReactNode; // ReactNode is used for passing React elements like icons
};
export default function LinkItem({ href, title, children }: LinkItemProps) {
  const dispatch = useDispatch();

  const pathname: string = usePathname() as string;
  const activeModule = pathname.split('/')[2];
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return href.includes(activeModule as string);
  };
  return (
    <Link
      href={href}
      onClick={() => {
        dispatch(closeSidebar());
      }}
      className={`px-3 py-4 ${isActive(href) ? 'rounded bg-primaryLighter text-primary' : ''}`}
    >
      <li className="flex gap-2  items-center ">
        {children}
        <Typography type="body" size="lg">
          {title}
        </Typography>
      </li>
    </Link>
  );
}
