import React from "react";
import PageHeader from "@/components/ExtraPages/PageHeader";
import type { Metadata } from "next";
import Typography from "@/components/Typography";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy",
};

const PrivacyPage = () => {
  return (
    <div
      className={
        "flex flex-col gap-12  px-5 lg:px-[120px] lg:pt-[60px] pt-8 lg:pb-[80px] pb-10 border-b border-subtle"
      }
    >
      <PageHeader heading={"Privacy Policy"} />
      <div className={"x-md:px-10 flex flex-col gap-4"}>
        <Typography type="body" className="text-justify">
          At wrytify, your privacy is important to us. This Privacy Policy
          outlines how we collect, use, and protect your information when you
          use our services. By accessing or using wrytify, you agree to the
          practices described in this Privacy Policy.
        </Typography>

        <section className="space-y-2">
          <Typography type="title" size="md">
            1. Information We Collect
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                <strong>Personal Information:</strong> Name, email address,
                contact information, and payment details (if applicable).
              </Typography>
            </li>
            <li>
              <Typography type="body">
                <strong>Non-Personal Information:</strong> Browser type, device
                information, and usage statistics (e.g., pages visited, time
                spent on the site).
              </Typography>
            </li>
            <li>
              <Typography type="body">
                <strong>Cookies and Tracking Technologies:</strong> We use
                cookies, web beacons, and similar technologies to enhance your
                experience, analyze trends, and gather demographic information
                about our users.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            2. How We Use Your Information
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                Provide and improve our services.
              </Typography>
            </li>
            <li>
              <Typography type="body">Personalize your experience.</Typography>
            </li>
            <li>
              <Typography type="body">
                Process payments and manage transactions.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Send you updates, newsletters, and promotional materials (you
                can opt out at any time).
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Comply with legal obligations.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            3. Sharing Your Information
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                <strong>Service Providers:</strong> For payment processing,
                analytics, and hosting services.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                <strong>Legal Obligations:</strong> When required by law or to
                protect wrytify's rights.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                <strong>Business Transactions:</strong> In the event of a
                merger, acquisition, or sale of assets.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            4. Cookies and Tracking
          </Typography>
          <Typography type="body">
            Cookies are small files stored on your device to enhance
            functionality and user experience.
          </Typography>
          <Typography type="body">
            <strong>Types of Cookies We Use:</strong>
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                <strong>Essential Cookies:</strong> Required for site
                functionality.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                <strong>Performance Cookies:</strong> Help us understand how
                users interact with wrytify.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                <strong>Marketing Cookies:</strong> Used for targeted
                advertising.
              </Typography>
            </li>
          </ul>
          <Typography type="body">
            Managing Cookies: You can adjust your browser settings to refuse
            cookies. Note that some features of wrytify may not function
            properly if cookies are disabled.
          </Typography>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            5. Data Security
          </Typography>
          <Typography type="body">
            We implement appropriate security measures to protect your data
            against unauthorized access, alteration, disclosure, or destruction.
          </Typography>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
