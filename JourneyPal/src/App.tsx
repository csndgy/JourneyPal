import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import PressRecommendations from './components/PressRecommendations';
import Stats from './components/Stats';
import Footer from './components/Footer';
import Checklist from './components/Checklist';
import SignUp from './components/SignUp';
import './JourneyPal.css';
import Login from './components/Login';
import PopularDestinations from './components/PopularDestinations';


const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode', !isDarkMode);
  };

  return (
    <Router>
      <div className={`journey-pal-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <NavBar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <PopularDestinations/>
                <PressRecommendations />
                <Stats />
                <Footer />
              </>
            }
          />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;