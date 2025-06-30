import React from 'react';
import {
  Header,
  AirbnbHeroSection,
  PopularDestinations,
  HotelsLovedByGuests,
  FeaturedVenues,
  TopRatedServices,
  NewsletterSection,
  Footer
} from '../components-airbnb';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-linen" style={{ zoom: 0.9 }}>
      <Header />
      <AirbnbHeroSection />
      <PopularDestinations />
      <HotelsLovedByGuests />
      <FeaturedVenues />
      <TopRatedServices />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default HomePage;