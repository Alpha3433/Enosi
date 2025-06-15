import React from 'react';
import {
  Header,
  AirbnbHeroSection,
  PopularDestinations,
  VendorTypeCards,
  FeaturedDeals,
  ExploreNearby,
  RealWeddingStories,
  WeddingInspiration,
  Footer
} from '../components';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <AirbnbHeroSection />
      <PopularDestinations />
      <VendorTypeCards />
      <FeaturedDeals />
      <ExploreNearby />
      <RealWeddingStories />
      <WeddingInspiration />
      <Footer />
    </div>
  );
};

export default HomePage;