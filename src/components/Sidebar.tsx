"use client";

import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  toggleSidebar,
} from "@/redux/slices/layoutSlice";
import type { RootState } from "@/redux/store";
import LinkItem from "./LinkItem";

import {
  CloseIcon,
  CompanyLogo,
  DashboardIcon,
} from "./svg-components";
import Typography from "./Typography";

export default function Sidebar() {
  const websites_ref = useRef<any>();
  const dispatch = useDispatch();
  const [showWebsitesPopup, setShowWebsitesPopup] = useState(false);

  const sideBarOpen = useSelector(
    (state: RootState) => state.layout.sideBarOpen,
  );





  const toggleModalWebsites = useCallback(
    (event: any) => {
      if (
        !showWebsitesPopup &&
        (websites_ref.current === event.target ||
          websites_ref.current?.contains(event.target))
      ) {
        setShowWebsitesPopup(true);
      } else {
        setShowWebsitesPopup(false);
      }
    },
    [showWebsitesPopup],
  );

  useEffect(() => {
    document.addEventListener("click", toggleModalWebsites);

    return () => {
      document.removeEventListener("click", toggleModalWebsites);
    };
  }, [toggleModalWebsites]);
  // Shown Popup for integrate BloggerSites



  return (
    <>
      {/* Mobile backdrop overlay */}
      {sideBarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        className={clsx(
          "absolute z-50 flex size-full max-h-screen min-h-screen min-w-[280px] flex-col justify-between overflow-auto border-r border-gray-200 bg-gradient-to-b from-white via-gray-50 to-gray-100 shadow-2xl px-5 py-6 transition duration-300 ease-in-out lg:static lg:h-screen lg:w-[280px] lg:translate-x-0 lg:shadow-none",
          "visible",
          sideBarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div>
          <div className="flex w-full items-center justify-between lg:justify-center mb-8">
            <div className="relative">
              <CompanyLogo className="h-[45px] w-[120px] lg:h-[50px] lg:w-[160px] drop-shadow-sm" />
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
            </div>
            <button
              className="p-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm lg:hidden"
              onClick={() => dispatch(toggleSidebar())}
            >
              <CloseIcon className="text-gray-700" />
            </button>
          </div>

                    <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <Typography type="body" size="lg" className="text-gray-700 font-bold">
                  Main
                </Typography>
              </div>

              <ul className="flex flex-col gap-2">
              <LinkItem href="/dashboard" title="Dashboard">
                <DashboardIcon className="size-5" />
              </LinkItem>
              <LinkItem href="/dashboard/stocks-management" title="Stock">
                <div className="size-5 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </LinkItem>
              <LinkItem href="/dashboard/customer-management" title="Customers">
                <div className="size-5 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </LinkItem>
              <LinkItem href="/dashboard/order-management" title="Orders">
                <div className="size-5 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </LinkItem>
              <LinkItem href="/dashboard/ledger" title="Ledger">
                <div className="size-5 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </LinkItem>
            </ul>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
              <Typography type="body" size="lg" className="text-gray-700 font-bold">
                Others
              </Typography>
            </div>
            <ul className="flex flex-col gap-2">
              <LinkItem href="/dashboard/profile" title="Profile">
                <div className="size-5 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </LinkItem>
              <LinkItem href="/dashboard/settings" title="Settings">
                <div className="size-5 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </LinkItem>
            </ul>
          </div>
        </div>

        <div className="relative flex flex-col gap-2">

        </div>
      </aside>
    </>
  );
}
