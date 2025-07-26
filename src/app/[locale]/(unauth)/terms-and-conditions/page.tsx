import React from "react";
import PageHeader from "@/components/ExtraPages/PageHeader";
import type { Metadata } from "next";
import Typography from "@/components/Typography";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms & Conditions",
};

const TermsPage = () => {
  return (
    <div
      className={
        "flex flex-col gap-12  px-5 lg:px-[120px] lg:pt-[60px] pt-8 lg:pb-[80px] pb-10 border-b border-subtle"
      }
    >
      <PageHeader heading={"Terms  & Conditions"} />
      <div className={"x-md:px-10 flex flex-col gap-4"}>
        <Typography type="body" className="text-justify">
          These Terms and Conditions ("Terms") govern your access to and use of
          wrytify (the "Service"). By using wrytify, you agree to these Terms.
          If you do not agree, you may not use the Service.
        </Typography>

        <section className="space-y-2">
          <Typography type="title" size="md">
            1. Use of the Service
          </Typography>
          <Typography type="body">
            To ensure a secure and efficient experience, users must adhere to
            the following conditions when using wrytify:
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                You must be at least 18 years old to use the Service.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Maintain the confidentiality of your account credentials.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Provide accurate and complete information during account
                registration.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Notify wrytify immediately of any unauthorized use of your
                account.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Do not use the Service for illegal or unauthorized purposes.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Avoid reverse engineering, modifying, or creating derivative
                works of the Service.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Do not interfere with the operation of the Service or upload
                harmful content.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            2. Subscription and Payments
          </Typography>
          <Typography type="body">
            wrytify offers flexible subscription plans to cater to various user
            needs. Key details include:
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                Subscription-based plans are detailed on our website.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Payments are securely processed via third-party payment
                processors.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Provide accurate billing information and authorize wrytify to
                charge your payment method.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                You can cancel your subscription anytime through your account
                settings.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Refunds, if applicable, are governed by our Refund Policy.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            3. Intellectual Property
          </Typography>
          <Typography type="body">
            The intellectual property rights of wrytify and its features are
            protected under applicable laws. Key points include:
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                All content, features, and functionality, including software,
                design, text, graphics, and trademarks, are owned by wrytify or
                its licensors.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                By using the Service, you grant wrytify a non-exclusive,
                royalty-free license to use, modify, and display the content you
                generate for the purpose of providing and improving the Service.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            4. Limitation of Liability
          </Typography>
          <Typography type="body">
            wrytify strives to offer reliable services but does not guarantee
            uninterrupted or error-free operations. Key disclaimers include:
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                The Service is provided "as is" and "as available."
              </Typography>
            </li>
            <li>
              <Typography type="body">
                We do not guarantee uninterrupted, error-free, or secure access
                to the Service.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                To the fullest extent permitted by law, wrytify is not liable
                for any direct, indirect, incidental, or consequential damages
                resulting from your use of the Service.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            4. Limitation of Liability
          </Typography>
          <Typography type="body">
            wrytify strives to offer reliable services but does not guarantee
            uninterrupted or error-free operations. Key disclaimers include:
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                The Service is provided "as is" and "as available."
              </Typography>
            </li>
            <li>
              <Typography type="body">
                We do not guarantee uninterrupted, error-free, or secure access
                to the Service.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                To the fullest extent permitted by law, wrytify is not liable
                for any direct, indirect, incidental, or consequential damages
                resulting from your use of the Service.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            5. Termination
          </Typography>
          <Typography type="body">
            wrytify reserves the right to terminate access to its Service under
            specific conditions. Key points include:
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                Access may be suspended or terminated for any violation of these
                Terms or at our discretion.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Upon termination, your right to use the Service ceases
                immediately.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            6. Modifications to the Terms
          </Typography>
          <Typography type="body">
            wrytify may update these Terms periodically to reflect changes in
            the Service or legal requirements. Key details include:
          </Typography>
          <ul className="list-disc pl-5">
            <li>
              <Typography type="body">
                The latest version of the Terms will be posted on our website.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Significant changes will be communicated via email or in-app
                notifications.
              </Typography>
            </li>
            <li>
              <Typography type="body">
                Continued use of the Service constitutes acceptance of the
                updated Terms.
              </Typography>
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <Typography type="title" size="md">
            7. Governing Law
          </Typography>
          <Typography type="body">
            These Terms are governed by and construed in accordance with the
            laws of [Your Jurisdiction], without regard to its conflict of law
            principles.
          </Typography>
        </section>

        <section className="space-y-1">
          <Typography type="title" size="md">
            Contact Us
          </Typography>
          <Typography type="body">
            For any questions or concerns about these Terms, feel free to reach
            out:
          </Typography>
          <Typography type="body" className={"!pt-1"}>
            <strong>wrytify Support</strong>
          </Typography>
          <Typography type="body">Email: Email Address</Typography>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
