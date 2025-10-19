"use client";

import React, { useState } from 'react';

const TestimonialSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "I've been using Pharma Khata for 8 months now, and it's completely changed my life! I went from taking 20 orders per day to 60+ orders. My monthly earnings jumped from Rs. 25,000 to Rs. 65,000. The automatic commission calculation saves me hours every day.",
      author: "Dr. Ahmed Raza",
      role: "Senior Order Taker",
      location: "Karachi, Pakistan",
      rating: 5,
      earnings: "Rs. 65K/month",
      experience: "8 months",
      ordersIncrease: "200%"
    },
    {
      quote: "The expense tracking feature is absolutely brilliant! I can now see exactly where my money goes - fuel, phone bills, meals. My net profit increased by 35% just by tracking expenses properly. The app even reminds me to log expenses when I'm on the road.",
      author: "Sara Khan",
      role: "Field Sales Executive",
      location: "Lahore, Pakistan",
      rating: 5,
      earnings: "Rs. 48K/month",
      experience: "6 months",
      ordersIncrease: "150%"
    },
    {
      quote: "My clients love the professional approach! I can show them real-time pricing, generate instant receipts, and track their order history. I've gained 25 new regular customers in just 4 months. The delivery tracking feature keeps everyone informed.",
      author: "Muhammad Hassan",
      role: "Territory Manager",
      location: "Islamabad, Pakistan",
      rating: 5,
      earnings: "Rs. 72K/month",
      experience: "10 months",
      ordersIncrease: "180%"
    },
    {
      quote: "The offline mode is a lifesaver! I work in areas with poor internet, but I can still take orders and sync them when I get back to the city. I've never lost a single order since using this app. It's like having a personal assistant.",
      author: "Ayesha Malik",
      role: "Rural Sales Representative",
      location: "Multan, Pakistan",
      rating: 5,
      earnings: "Rs. 42K/month",
      experience: "5 months",
      ordersIncrease: "120%"
    },
    {
      quote: "The analytics dashboard is incredible! I can see my best-performing products, peak order times, and which clinics give me the most business. This data helped me optimize my route and increase my efficiency by 50%.",
      author: "Ali Rizwan",
      role: "Pharmaceutical Sales Rep",
      location: "Faisalabad, Pakistan",
      rating: 5,
      earnings: "Rs. 58K/month",
      experience: "7 months",
      ordersIncrease: "160%"
    },
    {
      quote: "I was skeptical at first, but this app has revolutionized my business! The GPS tracking helps me plan efficient routes, and the inventory alerts prevent stockouts. My customer satisfaction has improved dramatically, and I've built strong relationships with 40+ clinics.",
      author: "Hassan Sheikh",
      role: "Medical Sales Representative",
      location: "Rawalpindi, Pakistan",
      rating: 5,
      earnings: "Rs. 55K/month",
      experience: "9 months",
      ordersIncrease: "175%"
    },
    {
      quote: "The commission tracking feature is a game-changer! I can see exactly how much I'm earning from each order and which products give me the best margins. My monthly income has consistently grown by 15% every month since I started using the app.",
      author: "Fatima Bibi",
      role: "Senior Order Taker",
      location: "Peshawar, Pakistan",
      rating: 5,
      earnings: "Rs. 38K/month",
      experience: "4 months",
      ordersIncrease: "140%"
    },
    {
      quote: "Working in remote areas was always challenging, but this app changed everything! The offline functionality means I never miss an order, and the automatic sync when I get back to the city is seamless. I've doubled my territory coverage in just 6 months.",
      author: "Usman Ali",
      role: "Regional Sales Manager",
      location: "Quetta, Pakistan",
      rating: 5,
      earnings: "Rs. 68K/month",
      experience: "12 months",
      ordersIncrease: "220%"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  return (
    <section className="py-20 bg-subtleBg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4 font-poppins">
            Success Stories from Order Takers
          </h2>
          <p className="text-lg text-light max-w-2xl mx-auto">
            See how real order takers have increased their earnings and efficiency with Pharma Khata
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden border border-gray-100">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primaryLighter to-primary/10 rounded-full -translate-y-20 translate-x-20 opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primaryLighter to-primary/10 rounded-full translate-y-16 -translate-x-16 opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-primaryLighter rounded-full -translate-x-1/2 -translate-y-1/2 opacity-10"></div>

            {/* Quote Icon */}
            <div className="absolute top-6 left-6 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Testimonial Content */}
            <div className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Left Column - Author Info */}
                <div className="text-center lg:text-left">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primaryDark rounded-full flex items-center justify-center mx-auto lg:mx-0 shadow-lg">
                      <span className="text-2xl font-bold text-white">
                        {testimonials[currentTestimonial]?.author.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <h4 className="text-2xl font-bold text-dark font-poppins">
                      {testimonials[currentTestimonial]?.author || 'User'}
                    </h4>
                    <p className="text-primary font-semibold text-lg">
                      {testimonials[currentTestimonial]?.role || 'Order Taker'}
                    </p>
                    <p className="text-light flex items-center justify-center lg:justify-start">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {testimonials[currentTestimonial]?.location || 'Pakistan'}
                    </p>
                  </div>
                </div>

                {/* Center Column - Quote */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Rating Stars */}
                    <div className="flex justify-center lg:justify-start space-x-1">
                      {[...Array(testimonials[currentTestimonial]?.rating || 5)].map((_, i) => (
                        <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-xl md:text-2xl text-dark leading-relaxed font-medium italic">
                      "{testimonials[currentTestimonial]?.quote || 'Great app!'}"
                    </blockquote>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-primaryLighter to-primary/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {testimonials[currentTestimonial]?.earnings || 'Rs. 0K/month'}
                  </div>
                  <div className="text-sm text-light font-medium">Monthly Earnings</div>
                </div>
                
                <div className="bg-gradient-to-r from-primaryLighter to-primary/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {testimonials[currentTestimonial]?.ordersIncrease || '0%'}
                  </div>
                  <div className="text-sm text-light font-medium">Orders Increase</div>
                </div>
                
                <div className="bg-gradient-to-r from-primaryLighter to-primary/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {testimonials[currentTestimonial]?.experience || '0 months'}
                  </div>
                  <div className="text-sm text-light font-medium">Using App</div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center space-x-6 mt-12">
              <button
                onClick={prevTestimonial}
                className="w-14 h-14 bg-white hover:bg-primary hover:text-white text-primary rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-primary/20 hover:border-primary"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="flex space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? 'bg-primary scale-125'
                        : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-14 h-14 bg-white hover:bg-primary hover:text-white text-primary rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-primary/20 hover:border-primary"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-dark mb-4 font-poppins">
              Join Thousands of Successful Order Takers
            </h3>
            <p className="text-light text-lg">
              Real results from real people using Pharma Khata
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primaryLighter rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-primary mb-2 font-poppins">5,000+</div>
              <div className="text-light font-medium">Active Order Takers</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primaryLighter rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-primary mb-2 font-poppins">Rs. 2.5M+</div>
              <div className="text-light font-medium">Total Commission Earned</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primaryLighter rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-primary mb-2 font-poppins">50K+</div>
              <div className="text-light font-medium">Orders Processed Monthly</div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-primaryLighter rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-primary mb-2 font-poppins">40%</div>
              <div className="text-light font-medium">Average Income Increase</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;