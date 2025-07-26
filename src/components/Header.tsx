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
      <div className="mb-2 w-full flex border-b-2 border-[#9E9E9E29] p-2 lg:hidden">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <HamBurger
              className="cursor-pointer"
              onClick={() => dispatch(toggleSidebar())}
            />

            <CompanyLogo className="h-[60px] w-[150px]" />
          </div>

          <div
            className="flex h-full cursor-pointer items-center gap-4 mr-3 "
            ref={profile_ref}
            onClick={() => setShowMenu(!showMenu)}
          >
            {user && (
              <Image
                src={user.profilePicture || "/assets/images/user_profile.png"}
                alt="search icon"
                className="size-10"
                width={1000}
                height={1000}
              />
            )}

            {!user && (
              <Skeleton.Avatar
                active
                shape="circle"
                style={{ height: "3rem", width: "3rem" }}
              />
            )}
          </div>
        </div>
      </div>

      <header
        className={clsx(
          "my-4 w-full relative px-5 lg:mb-[40px] lg:mt-[30px] lg:px-8"
        )}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Typography className="" type="title" size="regular">
              {pathItem
                ? sidebarItems.find((item) => item.href === pathItem)?.title
                : "Dashboard"}
            </Typography>
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
                <div className="">
                  <Typography type="title" align="right" size="regular">
                    {`${user.firstName} ${user.lastName}`}
                  </Typography>
                </div>

                <Image
                  src={
                    user?.profilePicture || "/assets/images/user_profile.png"
                  }
                  alt="search icon"
                  className="size-14"
                  width={1000}
                  height={1000}
                />
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
