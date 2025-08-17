"use client";

import { Skeleton } from "antd";
import clsx from "clsx";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import SearchInput from "@/components/SearchInput";
import { useGetMe } from "@/hooks/me";
import { toggleSidebar } from "@/redux/slices/layoutSlice";

import { CompanyLogo, HamBurger } from "./svg-components";
import Typography from "./Typography";
import AvatarMenu from "./ui/Profile/AvatarMenu";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
  },
  {
    title: "Settings",
    href: "settings",
  },
  {
    title: "Contact Support",
    href: "contact-support",
  },
];

export default function Header() {
  const profile_ref = useRef<any>();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const pathItem = pathname?.split("/")[2];
  const pathItem2nd = pathname?.split("/")[3];

  const [showMenu, setShowMenu] = useState<boolean>(false);

  const { user } = useGetMe();

  useEffect(() => {
    const toggleProfileBox = (event: any) => {
      if (
        showMenu &&
        (profile_ref.current === event.target ||
          profile_ref.current?.contains(event.target))
      ) {
        setShowMenu(true);
      } else {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", toggleProfileBox);

    return () => {
      document.removeEventListener("click", toggleProfileBox);
    };
  }, [showMenu]);

  return (
    <>
      {/* mobile header */}
      <div className="mb-3 w-full flex bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200 shadow-lg p-4 lg:hidden">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 shadow-sm border border-blue-100"
              onClick={() => dispatch(toggleSidebar())}
            >
              <HamBurger className="text-blue-600" />
            </button>

            <div className="relative">
              <CompanyLogo className="h-[45px] w-[120px] drop-shadow-sm" />
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          <div
            className="flex h-full cursor-pointer items-center gap-3"
            ref={profile_ref}
            onClick={() => setShowMenu(!showMenu)}
          >
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-medium">
                    Tap for menu
                  </div>
                </div>
                <div className="relative group">
                  <div className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Image
                      src={user.profilePicture || "/assets/images/user_profile.png"}
                      alt="User profile"
                      className="size-10 rounded-full border-2 border-white shadow-lg"
                      width={1000}
                      height={1000}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
            )}

            {!user && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <Skeleton.Button
                    style={{ height: "16px", width: "6rem" }}
                    active
                  />
                  <Skeleton.Button
                    style={{ height: "12px", width: "4rem" }}
                    active
                  />
                </div>
                <Skeleton.Avatar
                  active
                  shape="circle"
                  style={{ height: "2.5rem", width: "2.5rem" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <header
        className={clsx(
          "my-4 w-full relative px-5 lg:mb-6 lg:mt-6 lg:px-8"
        )}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <Typography className="text-gray-800" type="title" size="regular">
                {pathItem
                  ? sidebarItems.find((item) => item.href === pathItem)?.title
                  : "Dashboard"}
              </Typography>
            </div>
          </div>

          {pathItem && pathItem === "article-management" && !pathItem2nd && (
            <SearchInput className=" hidden xl:flex" />
          )}

          <div
            className="hidden h-full cursor-pointer items-center gap-4 lg:flex "
            ref={profile_ref}
            onClick={() => setShowMenu(!showMenu)}
          >
            {user && (
              <>
                <div className="text-right">
                  <Typography type="title" align="right" size="regular" className="text-gray-800">
                    {`${user.firstName} ${user.lastName}`}
                  </Typography>
                  <div className="text-xs text-gray-500 mt-1">Welcome back!</div>
                </div>

                <div className="relative group">
                  <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Image
                      src={
                        user?.profilePicture || "/assets/images/user_profile.png"
                      }
                      alt="User profile"
                      className="size-14 rounded-full border-2 border-white shadow-lg"
                      width={1000}
                      height={1000}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              </>
            )}

            {!user && (
              <div className="flex gap-3 items-center justify-end">
                <div className="flex flex-col gap-2 items-end justify-end">
                  <Skeleton.Button
                    style={{ height: "18px", width: "8rem" }}
                    block
                    active
                  />

                  <Skeleton.Button
                    style={{ height: "12px", width: "5rem" }}
                    active
                  />
                </div>

                <Skeleton.Avatar
                  active
                  shape="circle"
                  style={{ height: "3rem", width: "3rem" }}
                />
              </div>
            )}
          </div>

          {showMenu && <AvatarMenu />}
        </div>
      </header>
    </>
  );
}
