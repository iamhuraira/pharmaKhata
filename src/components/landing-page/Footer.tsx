import {
  FacebookIcon,
  InstaIcon,
  LinkedInIcon,
  WrytifyLogo,
  XIcon,
} from "@/components/svg-components";
import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="text-gray-800 py-10 px-6">
      <div className=" flex flex-col x-lg:px-[120px] gap-12">
        {/* Top Section */}
        <div className="flex flex-col gap-10 4x-lg:gap-[100px] 3x-lg:flex-row justify-between">
          {/* Logo & Description */}
          <div className="flex flex-1 flex-col  gap-4">
            {/* Logo */}
            <WrytifyLogo className="h-[40px] w-[130px]" />
            <p className="text-base text-gray-600">
              Simplifying content creation with AI-driven insights. Create,
              manage, and optimize articles that engage audiences and boost
              search rankings.
            </p>
            <div className=" hidden gap-4 md:flex">
              <FacebookIcon className={"size-6"} />
              <InstaIcon className={"size-6"} />
              <XIcon className={"size-6"} />
              <LinkedInIcon className={"size-6"} />
            </div>
          </div>

          {/* Links Section */}
          <div className=" grid grid-cols-1 gap-10 4x-lg:gap-[100px] sm:grid-cols-3">
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-xl text-black mb-6">
                Quick Links
              </h3>
              <ul className="flex flex-col gap-3 text-base text-gray-600">
                <li>
                  <Link href="/#pricing" className="hover:underline">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/sign-in" className="hover:underline">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:underline">
                    Signup
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-xl text-black mb-6">Company</h3>
              <ul className="flex flex-col gap-3 text-base text-gray-600">
                <li>
                  <Link href="/about" className="hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact-us" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    contact@wrytify.com
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold  text-xl text-black mb-6">
                Resources
              </h3>
              <ul className=" flex flex-col gap-3 text-base text-gray-600">
                <li>
                  <Link href="/blogs" className="hover:underline">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:underline">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 flex flex-col gap-3 md:flex-row justify-between items-center">
          {/* Policies */}
          <div className="flex text-sm md:text-base gap-2 text-gray-600 pt-6">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms-and-conditions" className="hover:underline">
              Terms & Conditions
            </Link>
            <span>|</span>
            <Link href="/cookie-policy" className="hover:underline">
              Cookie Policy
            </Link>
          </div>

          {/* Social Media */}
          <div className=" flex gap-4 md:hidden">
            <FacebookIcon className={"size-6"} />
            <InstaIcon className={"size-6"} />
            <XIcon className={"size-6"} />
            <LinkedInIcon className={"size-6"} />
          </div>
          <div className={"hidden md:flex pt-6"}>
            <p>© 2024 wrytify, All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
