import React from 'react';
import {
  Header,
  HeroSection,
  VendorCategories,
  FeaturedVendors,
  PlanningTools,
  TrustSignals,
  Testimonials,
  Footer
} from '../components';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <VendorCategories />
      <FeaturedVendors />
      <PlanningTools />
      <TrustSignals />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default HomePage;