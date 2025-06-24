import React from 'react';
import {
  Header,
  AirbnbHeroSection,
  PopularDestinations,
  HotelsLovedByGuests,
  NewsletterSection,
  Footer
} from '../components-airbnb';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <AirbnbHeroSection />
      <PopularDestinations />
      <HotelsLovedByGuests />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default HomePage;