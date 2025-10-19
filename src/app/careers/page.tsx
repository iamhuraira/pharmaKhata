import React from 'react';

export const metadata = {
  title: 'Careers - Pharma Khata',
  description: 'Join the Pharma Khata team and help us revolutionize order taking for pharmaceutical sales representatives.',
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-subtleBg font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6 font-poppins">
            Join Our Team
          </h1>
          <p className="text-xl text-light max-w-3xl mx-auto">
            Help us build the future of pharmaceutical order taking. We're looking for passionate 
            individuals who want to make a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-6 font-poppins">Why Work With Us?</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primaryLighter rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-dark mb-2">Impact</h3>
                  <p className="text-light">Make a real difference in the lives of thousands of order takers across Pakistan and India.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primaryLighter rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-dark mb-2">Growth</h3>
                  <p className="text-light">Work with cutting-edge technology and grow your skills in a fast-paced startup environment.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primaryLighter rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-dark mb-2">Flexibility</h3>
                  <p className="text-light">Enjoy flexible working hours and remote work options that fit your lifestyle.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-dark mb-6 font-poppins">Open Positions</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                <h4 className="font-semibold text-dark mb-2">Senior Mobile Developer</h4>
                <p className="text-sm text-light mb-2">Full-time • Remote • Karachi</p>
                <p className="text-sm text-light">Build and maintain our mobile applications for iOS and Android.</p>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                <h4 className="font-semibold text-dark mb-2">Product Manager</h4>
                <p className="text-sm text-light mb-2">Full-time • Hybrid • Lahore</p>
                <p className="text-sm text-light">Lead product strategy and work with cross-functional teams.</p>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                <h4 className="font-semibold text-dark mb-2">Customer Success Manager</h4>
                <p className="text-sm text-light mb-2">Full-time • Remote</p>
                <p className="text-sm text-light">Help our customers succeed and grow their businesses.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
          <h2 className="text-3xl font-bold text-dark mb-6 font-poppins">Don't See Your Role?</h2>
          <p className="text-lg text-light mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals. Send us your resume and tell us how you can contribute to our mission.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primaryDark transition-colors duration-200"
          >
            Send Your Resume
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
