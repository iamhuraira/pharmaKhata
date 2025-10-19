import React from 'react';

export const metadata = {
  title: 'Privacy Policy - Pharma Khata',
  description: 'Learn how Pharma Khata protects your privacy and handles your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-subtleBg font-poppins">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6 font-poppins">
            Privacy Policy
          </h1>
          <p className="text-xl text-light">
            Last updated: December 2024
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Introduction</h2>
            <p className="text-light leading-relaxed mb-6">
              At Pharma Khata, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile 
              application and related services.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Information We Collect</h2>
            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-dark mb-3">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-light">
                  <li>Name, email address, and phone number</li>
                  <li>Business information and company details</li>
                  <li>Order and transaction data</li>
                  <li>Location information (with your consent)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-dark mb-3">Usage Information</h3>
                <ul className="list-disc list-inside space-y-2 text-light">
                  <li>App usage patterns and preferences</li>
                  <li>Device information and operating system</li>
                  <li>Log files and analytics data</li>
                  <li>Performance and error reports</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-light mb-8">
              <li>Provide and maintain our services</li>
              <li>Process orders and transactions</li>
              <li>Calculate commissions and track earnings</li>
              <li>Send important updates and notifications</li>
              <li>Improve our app and services</li>
              <li>Provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Information Sharing</h2>
            <p className="text-light leading-relaxed mb-6">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-light mb-8">
              <li>With your company for order processing and commission calculation</li>
              <li>With service providers who assist us in operating our app</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Data Security</h2>
            <p className="text-light leading-relaxed mb-6">
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Your Rights</h2>
            <p className="text-light leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-light mb-8">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Contact Us</h2>
            <p className="text-light leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-primaryLighter rounded-xl p-6">
              <p className="text-dark font-medium mb-2">Email: privacy@pharmakhata.com</p>
              <p className="text-dark font-medium mb-2">Phone: +92 21 1234 5678</p>
              <p className="text-dark font-medium">Address: 123 Business District, Karachi, Pakistan 75000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
