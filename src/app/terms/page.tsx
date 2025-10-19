import React from 'react';

export const metadata = {
  title: 'Terms of Service - Pharma Khata',
  description: 'Read the terms of service for using Pharma Khata and our mobile application.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-subtleBg font-poppins">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6 font-poppins">
            Terms of Service
          </h1>
          <p className="text-xl text-light">
            Last updated: December 2024
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">1. Acceptance of Terms</h2>
            <p className="text-light leading-relaxed mb-6">
              By accessing and using Pharma Khata, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">2. Use License</h2>
            <p className="text-light leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of Pharma Khata per device for personal, 
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-light mb-8">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained in the application</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">3. User Accounts</h2>
            <p className="text-light leading-relaxed mb-6">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
              You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">4. Prohibited Uses</h2>
            <p className="text-light leading-relaxed mb-4">You may not use our service:</p>
            <ul className="list-disc list-inside space-y-2 text-light mb-8">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">5. Content</h2>
            <p className="text-light leading-relaxed mb-6">
              Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, 
              videos, or other material. You are responsible for the content that you post to the service, including its legality, 
              reliability, and appropriateness.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">6. Termination</h2>
            <p className="text-light leading-relaxed mb-6">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, 
              under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">7. Disclaimer</h2>
            <p className="text-light leading-relaxed mb-6">
              The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, 
              this Company excludes all representations, warranties, conditions and terms relating to our service and the use of this service.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">8. Governing Law</h2>
            <p className="text-light leading-relaxed mb-6">
              These Terms shall be interpreted and governed by the laws of Pakistan, without regard to its conflict of law provisions. 
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">9. Changes</h2>
            <p className="text-light leading-relaxed mb-6">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2 className="text-2xl font-bold text-dark mb-6 font-poppins">10. Contact Information</h2>
            <p className="text-light leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-primaryLighter rounded-xl p-6">
              <p className="text-dark font-medium mb-2">Email: legal@pharmakhata.com</p>
              <p className="text-dark font-medium mb-2">Phone: +92 21 1234 5678</p>
              <p className="text-dark font-medium">Address: 123 Business District, Karachi, Pakistan 75000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
