"use client";

import React from 'react';

const MobileAppSection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark leading-tight font-poppins mb-6">
            Your Field Operations.{' '}
            <span className="text-primary">Unlocked on Mobile</span>
          </h2>
          <p className="text-lg md:text-xl text-light leading-relaxed max-w-4xl mx-auto">
            Empower your field team with Pharma Khata's intuitive mobile app. Collect orders, 
            manage clinic data, and track deliveries—all from your smartphone, even offline.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="order-2 lg:order-1">
            {/* Core Benefits Section */}
            <div className="space-y-8">
              <h3 className="text-2xl md:text-3xl font-bold text-dark font-poppins mb-6">
                Effortless Mobile Features
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primaryLighter rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-dark mb-2">Rapid Order Entry</h4>
                    <p className="text-light">Quick search, personalized price lists, and one-tap additions to streamline your order taking process.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primaryLighter rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-dark mb-2">Clinic Insights On-the-Go</h4>
                    <p className="text-light">Access detailed client history and order patterns instantly for better service delivery.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primaryLighter rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-dark mb-2">Real-time Sync & Tracking</h4>
                    <p className="text-light">Ensure all data is always up-to-date with live order status and delivery tracking.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primaryLighter rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-dark mb-2">Offline Capability</h4>
                    <p className="text-light">Work seamlessly and securely even without internet connectivity in remote areas.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-primaryLighter rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-dark mb-2">Integrated Route Planning</h4>
                    <p className="text-light">Optimize your clinic visit schedule for maximum efficiency and time management.</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-6">
                <a
                  href="/download"
                  className="inline-flex items-center bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primaryDark transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Download the App
                  <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Mobile App Mockups */}
          <div className="relative order-1 lg:order-2">
            {/* Background Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-primaryLighter rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primaryLighter rounded-full opacity-15 animate-bounce"></div>
            <div className="absolute top-1/2 -right-4 w-16 h-16 bg-primaryLighter rounded-full opacity-25 animate-pulse"></div>

            {/* Mobile Mockup Container */}
            <div className="relative mx-auto max-w-sm lg:left-[-100px]">
              {/* Single Phone - Order Taking/Catalog Screen */}
              <div className="relative mx-auto max-w-[280px] sm:max-w-xs hidden lg:block">
                {/* Phone Frame */}
                <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                {/* Phone Screen */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="bg-primary h-12 flex items-center justify-between px-6 text-white text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <div className="text-xs">9:41</div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 border border-white rounded-sm">
                        <div className="w-3 h-1.5 bg-white rounded-sm m-0.5"></div>
                      </div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-dark font-poppins">New Order</h3>
                        <p className="text-sm text-light">Dr. Ahmed Clinic</p>
                      </div>
                      <div className="w-8 h-8 bg-primaryLighter rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search medicines..."
                        className="w-full px-4 py-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      />
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {/* Medicine List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primaryLighter rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-dark text-sm">Paracetamol 500mg</p>
                            <p className="text-xs text-light">Tablet • 10 strips</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-sm">Rs. 50</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <button className="w-6 h-6 bg-primaryLighter rounded-full flex items-center justify-center">
                              <span className="text-primary text-xs font-bold">-</span>
                            </button>
                            <span className="text-sm font-medium text-dark">2</span>
                            <button className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primaryLighter rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-dark text-sm">Amoxicillin 250mg</p>
                            <p className="text-xs text-light">Capsule • 20 capsules</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-sm">Rs. 120</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <button className="w-6 h-6 bg-primaryLighter rounded-full flex items-center justify-center">
                              <span className="text-primary text-xs font-bold">-</span>
                            </button>
                            <span className="text-sm font-medium text-dark">1</span>
                            <button className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-primaryLighter rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-dark">Subtotal</span>
                        <span className="text-sm font-medium text-dark">Rs. 170</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-dark">Delivery Fee</span>
                        <span className="text-sm font-medium text-dark">Rs. 30</span>
                      </div>
                      <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                        <span className="font-bold text-dark">Total</span>
                        <span className="font-bold text-primary text-lg">Rs. 200</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold text-sm hover:bg-primaryDark transition-colors duration-200">
                        Confirm Order
                      </button>
                      <button className="w-full bg-white border-2 border-primary text-primary py-3 px-6 rounded-xl font-semibold text-sm hover:bg-primary hover:text-white transition-colors duration-200">
                        Save as Draft
                      </button>
                    </div>
                  </div>
                </div>
              </div>

                {/* Floating Elements for First Phone */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 01-1-1z" />
                  </svg>
                </div>
              </div>

              {/* Phone 2 - Clinic/Order Management Screen */}
              <div className="relative mx-auto max-w-[280px] sm:max-w-xs mb-6 sm:mb-8 lg:mb-0 lg:absolute lg:right-0 lg:left-[100px] lg:top-4 xl:top-6 z-10 lg:z-20 block">
                {/* Phone Frame */}
                <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl lg:left-[150px]">
                  {/* Phone Screen */}
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-primary h-12 flex items-center justify-between px-6 text-white text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <div className="text-xs">9:41</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-2 border border-white rounded-sm">
                          <div className="w-3 h-1.5 bg-white rounded-sm m-0.5"></div>
                        </div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* App Content - Clinic Management */}
                    <div className="p-6 space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-dark font-poppins">Clinic Management</h3>
                          <p className="text-sm text-light">Dr. Ahmed Clinic</p>
                        </div>
                        <div className="w-8 h-8 bg-primaryLighter rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      {/* Clinic Info */}
                      <div className="bg-primaryLighter rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">DA</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-dark">Dr. Ahmed Clinic</h4>
                            <p className="text-xs text-light">Karachi, Pakistan</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-primary">15</div>
                            <div className="text-light">Total Orders</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-primary">Rs. 8.5K</div>
                            <div className="text-light">This Month</div>
                          </div>
                        </div>
                      </div>

                      {/* Order History */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-dark">Recent Orders</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-dark text-sm">Order #1234</p>
                                <p className="text-xs text-light">2 items • Rs. 350</p>
                              </div>
                            </div>
                            <div className="text-xs text-light">2 days ago</div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <div>
                                <p className="font-medium text-dark text-sm">Order #1233</p>
                                <p className="text-xs text-light">5 items • Rs. 1,200</p>
                              </div>
                            </div>
                            <div className="text-xs text-light">1 week ago</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <button className="w-full bg-primary text-white py-3 px-4 rounded-xl text-sm font-semibold">
                          New Order
                        </button>
                        <button className="w-full bg-white border-2 border-primary text-primary py-3 px-4 rounded-xl text-sm font-semibold">
                          View History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements for Second Phone */}
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-primaryLighter rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;
