import React from 'react';

export const metadata = {
  title: 'Features - Pharma Khata',
  description: 'Discover all the powerful features of Pharma Khata - the complete order taking solution for pharmaceutical sales representatives.',
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-subtleBg font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6 font-poppins">
            Powerful Features for Order Takers
          </h1>
          <p className="text-xl text-light max-w-3xl mx-auto">
            Everything you need to streamline your order taking process, track payments, and grow your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-primaryLighter rounded-2xl flex items-center justify-center text-primary mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-8v6h8V7zm-2 4h-4V9h4v2zm4-12H3C1.9 1 1 1.9 1 3v18c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H3V5h18v14z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4 font-poppins">Mobile Order Taking</h3>
            <p className="text-light leading-relaxed">
              Take orders directly on your mobile device with our intuitive interface. Scan medicine catalogs, add items to cart, and create orders on-the-go.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-primaryLighter rounded-2xl flex items-center justify-center text-primary mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4 font-poppins">Commission Tracking</h3>
            <p className="text-light leading-relaxed">
              Automatically calculate and track your commission earnings. Monitor your performance and see exactly how much you're making from each order.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-primaryLighter rounded-2xl flex items-center justify-center text-primary mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4 font-poppins">Delivery Management</h3>
            <p className="text-light leading-relaxed">
              Track delivery status, manage fulfillment process, and get real-time updates on order processing and delivery schedules.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-primaryLighter rounded-2xl flex items-center justify-center text-primary mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4 font-poppins">Expense Tracking</h3>
            <p className="text-light leading-relaxed">
              Record and manage all your business expenses including fuel, phone bills, meals, and other costs. Get detailed expense reports.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-primaryLighter rounded-2xl flex items-center justify-center text-primary mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4 font-poppins">Analytics Dashboard</h3>
            <p className="text-light leading-relaxed">
              Get insights into your performance with detailed analytics. See your best-performing products, peak order times, and customer data.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-primaryLighter rounded-2xl flex items-center justify-center text-primary mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4 font-poppins">Offline Mode</h3>
            <p className="text-light leading-relaxed">
              Work in areas with poor internet connectivity. Take orders offline and sync them when you get back to the city.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
