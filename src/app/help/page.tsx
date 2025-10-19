import React from 'react';

export const metadata = {
  title: 'Help Center - Pharma Khata',
  description: 'Get help with Pharma Khata. Find answers to common questions, tutorials, and support resources.',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-subtleBg font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6 font-poppins">
            Help Center
          </h1>
          <p className="text-xl text-light max-w-3xl mx-auto">
            Find answers to common questions and get the support you need to succeed with Pharma Khata.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-dark mb-8 font-poppins">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-dark mb-3">How do I get started with Pharma Khata?</h3>
                <p className="text-light leading-relaxed">
                  Getting started is easy! Download the app from the App Store or Google Play, create your account, 
                  and start taking orders immediately. No setup fees or long onboarding process required.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-dark mb-3">Can I use the app offline?</h3>
                <p className="text-light leading-relaxed">
                  Yes! Pharma Khata works offline in areas with poor internet connectivity. You can take orders 
                  offline and they will sync automatically when you get back to an area with internet.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-dark mb-3">How is my commission calculated?</h3>
                <p className="text-light leading-relaxed">
                  Your commission is automatically calculated based on your company's commission structure. 
                  The app tracks all your orders and calculates your earnings in real-time.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-dark mb-3">Is my data secure?</h3>
                <p className="text-light leading-relaxed">
                  Absolutely! We use industry-standard encryption to protect your data. All information is 
                  stored securely and only you and your company can access your order data.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-dark mb-3">How do I track my expenses?</h3>
                <p className="text-light leading-relaxed">
                  You can easily record expenses like fuel, meals, and phone bills directly in the app. 
                  The app will categorize your expenses and provide detailed reports for tax purposes.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-dark mb-3">What if I need help?</h3>
                <p className="text-light leading-relaxed">
                  Our support team is available 24/7 to help you. You can contact us through the app, 
                  email us at support@pharmakhata.com, or call our support hotline.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Links */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-dark mb-4 font-poppins">Quick Links</h3>
              <div className="space-y-3">
                <a href="/download" className="block text-primary hover:text-primaryDark transition-colors duration-200">
                  → Download App
                </a>
                <a href="/features" className="block text-primary hover:text-primaryDark transition-colors duration-200">
                  → View Features
                </a>
                <a href="/pricing" className="block text-primary hover:text-primaryDark transition-colors duration-200">
                  → See Pricing
                </a>
                <a href="/contact" className="block text-primary hover:text-primaryDark transition-colors duration-200">
                  → Contact Support
                </a>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-primaryLighter rounded-xl p-6">
              <h3 className="text-lg font-semibold text-dark mb-4 font-poppins">Still Need Help?</h3>
              <p className="text-light mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primaryDark transition-colors duration-200"
              >
                Contact Support
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            {/* Tutorials */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-dark mb-4 font-poppins">Video Tutorials</h3>
              <div className="space-y-3">
                <a href="#" className="block text-primary hover:text-primaryDark transition-colors duration-200">
                  → Getting Started Guide
                </a>
                <a href="#" className="block text-primary hover:text-primaryDark transition-colors duration-200">
                  → Taking Your First Order
                </a>
                <a href="#" className="block text-primary hover:text-primaryDark transition-colors duration-200">
                  → Tracking Expenses
                </a>
                <a href="#" className="block text-primary hover:text-primaryDark transition-colors duration-200">
                  → Commission Reports
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
