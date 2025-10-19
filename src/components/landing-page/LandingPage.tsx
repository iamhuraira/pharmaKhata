"use client";

import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import HowItWorksSection from './HowItWorksSection';
import MobileAppSection from './MobileAppSection';
import TestimonialSection from './TestimonialSection';
import CtaSection from './CtaSection';
import FooterSection from './FooterSection';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-subtleBg font-poppins">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <MobileAppSection />
      <TestimonialSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
