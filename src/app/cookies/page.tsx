import React from 'react';

export const metadata = {
  title: 'Cookie Policy - Pharma Khata',
  description: 'Learn about how Pharma Khata uses cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-subtleBg font-poppins">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6 font-poppins">
            Cookie Policy
          </h1>
          <p className="text-xl text-light">
            Last updated: December 2024
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">What Are Cookies</h2>
            <p className="text-light leading-relaxed mb-6">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website or use our mobile application. 
              They help us provide you with a better experience by remembering your preferences and understanding how you use our services.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">How We Use Cookies</h2>
            <p className="text-light leading-relaxed mb-4">We use cookies for several purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-light mb-8">
              <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly and cannot be disabled</li>
              <li><strong>Performance Cookies:</strong> These help us understand how visitors interact with our website</li>
              <li><strong>Functional Cookies:</strong> These enable enhanced functionality and personalization</li>
              <li><strong>Analytics Cookies:</strong> These help us analyze website traffic and user behavior</li>
            </ul>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Types of Cookies We Use</h2>
            <div className="space-y-6 mb-8">
              <div className="bg-primaryLighter rounded-xl p-6">
                <h3 className="text-lg font-semibold text-dark mb-3">Strictly Necessary Cookies</h3>
                <p className="text-light leading-relaxed">
                  These cookies are essential for you to browse the website and use its features. Without these cookies, 
                  services you have asked for cannot be provided.
                </p>
              </div>
              
              <div className="bg-primaryLighter rounded-xl p-6">
                <h3 className="text-lg font-semibold text-dark mb-3">Performance Cookies</h3>
                <p className="text-light leading-relaxed">
                  These cookies collect information about how you use our website, such as which pages you visit most often. 
                  This data helps us improve how our website works.
                </p>
              </div>
              
              <div className="bg-primaryLighter rounded-xl p-6">
                <h3 className="text-lg font-semibold text-dark mb-3">Functionality Cookies</h3>
                <p className="text-light leading-relaxed">
                  These cookies allow the website to remember choices you make and provide enhanced, more personal features.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Third-Party Cookies</h2>
            <p className="text-light leading-relaxed mb-6">
              We may also use third-party cookies from trusted partners to help us analyze how our website is used, 
              measure the effectiveness of our advertising, and provide you with relevant content and advertisements.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Managing Cookies</h2>
            <p className="text-light leading-relaxed mb-4">
              You can control and manage cookies in various ways. Please note that removing or blocking cookies can impact your user experience:
            </p>
            <ul className="list-disc list-inside space-y-2 text-light mb-8">
              <li>Most web browsers allow you to control cookies through their settings preferences</li>
              <li>You can set your browser to refuse cookies or delete certain cookies</li>
              <li>You can opt-out of certain third-party cookies through their respective websites</li>
              <li>You can use our cookie preference center to manage your preferences</li>
            </ul>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Mobile App</h2>
            <p className="text-light leading-relaxed mb-6">
              Our mobile application may use similar technologies to cookies, such as local storage and device identifiers, 
              to provide you with a personalized experience and improve our services.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Updates to This Policy</h2>
            <p className="text-light leading-relaxed mb-6">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, 
              legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">Contact Us</h2>
            <p className="text-light leading-relaxed mb-4">
              If you have any questions about our use of cookies, please contact us:
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
