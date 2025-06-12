import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Header,
  HeroSection,
  VendorCategories,
  FeaturedVendors,
  PlanningTools,
  TrustSignals,
  Testimonials,
  Footer
} from './components';

const Home = () => {
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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;