import React from "react";
import PageHeader from "@/components/ExtraPages/PageHeader";
import type { Metadata } from "next";
import Typography from "@/components/Typography";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy",
};

const CookiePolicyPage = () => {
  return (
    <div
      className={
        "flex flex-col gap-12  px-5 lg:px-[120px] lg:pt-[60px] pt-8 lg:pb-[80px] pb-10 border-b border-subtle"
      }
    >
      <PageHeader heading={"Cookie Policy"} />
      <div className={"x-md:px-10 flex flex-col gap-4"}>
        <Typography type="body" className="text-justify">
          At wrytify, we use cookies to improve your experience on our platform.
          This Cookies Policy explains what cookies are, how we use them, and
          your options for managing cookies.
        </Typography>

        <section className="space-y-2">
          <Typography type="title" size="md">
            What Are Cookies?
          </Typography>
          <Typography type="body">
            Cookies are small files stored on your device by your browser when
            you visit a website. They enable the website to remember information
            about your visit, such as your preferences, to enhance functionality
            and performance.
          </Typography>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            How We Use Cookies
          </Typography>
          <Typography type="body">wrytify uses cookies to:</Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                <strong>Enhance User Experience:</strong> Remember your
                preferences and settings.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                <strong>Provide Personalization:</strong> Deliver a tailored
                experience based on your usage.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                <strong>Analyze Performance:</strong>Monitor website traffic and
                performance to improve our services.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                <strong>Support Advertising:</strong>Deliver relevant
                advertisements and measure their effectiveness.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            Types of Cookies We Use
          </Typography>
          <Typography type="body">
            <strong>Essential Cookies </strong>
          </Typography>
          <Typography type="body">
            These cookies are necessary for the operation of our website and
            cannot be disabled. They allow basic functions such as navigation
            and access to secure areas.
          </Typography>

          <Typography type="body">
            <strong>Performance Cookies</strong>
          </Typography>
          <Typography type="body">
            These cookies help us understand how users interact with our website
            by collecting anonymous data. This enables us to improve the
            functionality and performance of the platform.
          </Typography>
          <Typography type="body">
            <strong>Functional Cookies</strong>
          </Typography>
          <Typography type="body">
            These cookies allow us to remember your preferences and provide
            enhanced features, such as language settings and personalized
            content.
          </Typography>
          <Typography type="body">
            <strong>Advertising Cookies</strong>
          </Typography>
          <Typography type="body">
            These cookies are used to deliver relevant advertisements to you and
            measure their effectiveness. They may track your browsing habits to
            ensure ads are tailored to your interests.
          </Typography>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            Managing Cookies
          </Typography>
          <Typography type="body">
            You can control or disable cookies through your browser settings.
            However, please note that disabling certain cookies may impact the
            functionality of wrytify.
          </Typography>
          <Typography type="body">To manage cookies:</Typography>
          <ol className="list-disc pl-5">
            <li>
              <Typography type="body">Open your browser settings.</Typography>
            </li>
            <li>
              <Typography type="body">
                Navigate to the "Privacy" or "Cookies" section.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Adjust the cookie settings according to your preferences.
              </Typography>
            </li>
          </ol>
          <Typography type="body">
            For detailed guidance, refer to your browser’s help documentation or
            contact us for assistance.
          </Typography>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            Changes to This Policy
          </Typography>
          <Typography type="body">
            We may update this Cookies Policy from time to time to reflect
            changes in our practices or legal requirements. The latest version
            will always be available on our website.
          </Typography>
        </section>
        <section className="space-y-2">
          <Typography type="title" size="md">
            Contact Us
          </Typography>
          <Typography type="body">
            If you have questions or concerns about this Privacy Policy, please
            contact us at:
          </Typography>
          <Typography type="body">
            <strong>wrytify Support</strong>
          </Typography>
          <Typography type="body">Email: Email Address</Typography>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
