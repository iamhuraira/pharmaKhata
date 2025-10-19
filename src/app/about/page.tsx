import React from 'react';

export const metadata = {
  title: 'About Us - Pharma Khata',
  description: 'Learn about Pharma Khata and our mission to revolutionize order taking for pharmaceutical sales representatives.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-subtleBg font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6 font-poppins">
            About Pharma Khata
          </h1>
          <p className="text-xl text-light max-w-3xl mx-auto">
            We're on a mission to revolutionize how pharmaceutical order takers work, 
            making their jobs easier and more profitable.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-6 font-poppins">Our Story</h2>
            <p className="text-lg text-light leading-relaxed mb-6">
              Pharma Khata was born from a simple observation: order takers in the pharmaceutical industry 
              were struggling with outdated, paper-based systems that were inefficient and error-prone. 
              We saw an opportunity to create a digital solution that would transform their workflow.
            </p>
            <p className="text-lg text-light leading-relaxed">
              Today, we're proud to serve thousands of order takers across Pakistan and India, 
              helping them increase their efficiency, track their earnings, and grow their businesses.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center">
              <div className="w-24 h-24 bg-primaryLighter rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4 font-poppins">Our Mission</h3>
              <p className="text-light leading-relaxed">
                To empower pharmaceutical order takers with technology that makes their work 
                more efficient, profitable, and rewarding.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark mb-6 font-poppins">Our Values</h2>
          <p className="text-lg text-light max-w-3xl mx-auto">
            These core values guide everything we do at Pharma Khata
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-primaryLighter rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4 font-poppins">Innovation</h3>
            <p className="text-light leading-relaxed">
              We constantly innovate to bring you the latest technology and features that make your work easier.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-primaryLighter rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4 font-poppins">Reliability</h3>
            <p className="text-light leading-relaxed">
              You can count on us to provide a stable, secure platform that works when you need it most.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
            <div className="w-16 h-16 bg-primaryLighter rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark mb-4 font-poppins">Support</h3>
            <p className="text-light leading-relaxed">
              Our dedicated support team is always here to help you succeed and grow your business.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
          <h2 className="text-3xl font-bold text-dark mb-6 font-poppins">Join Our Team</h2>
          <p className="text-lg text-light mb-8 max-w-3xl mx-auto">
            We're always looking for talented individuals who share our passion for innovation 
            and helping order takers succeed. Check out our open positions.
          </p>
          <a
            href="/careers"
            className="inline-flex items-center bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primaryDark transition-colors duration-200"
          >
            View Open Positions
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
