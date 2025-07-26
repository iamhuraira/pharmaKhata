"use client";

import React, { useEffect, useState } from "react";
const DashboardContent = () => {

  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  useEffect(() => {
    const updateDevice = () => {
      setDevice(window.innerWidth < 600 ? "mobile" : "desktop");
    };

    // Set the initial device type
    updateDevice();

    const handleResize = () => {
      if (window.innerWidth < 600) {
        setDevice("mobile");
      } else {
        setDevice("desktop");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/*<div*/}
      {/*  className="my-10 grid grid-cols-3*/}
      {/*        gap-5*/}
      {/*        sm:grid-cols-8*/}
      {/*        3xl:grid-cols-12"*/}
      {/*>*/}
      {/*  Header*/}
      {/*</div>*/}

      {device === "desktop" ? <div>{device}</div> : <div>{device}</div>}
    </>
  );
};

export default DashboardContent;
