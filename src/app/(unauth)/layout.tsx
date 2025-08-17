import React from "react";
import Footer from "@/components/landing-page/Footer";

export default function UnAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
