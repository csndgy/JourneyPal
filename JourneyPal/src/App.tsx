import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import PressRecommendations from './components/PressRecommendations';
import Stats from './components/Stats';
import Footer from './components/Footer';
import SignUp from './components/SignUp';
import './JourneyPal.css';
import Login from './components/Login';
import PopularDestinations from './components/PopularDestinations';
import UserProfile from './components/UserProfile';
import TripPlanner from './components/TripPlanner';
import PlanYourTrip from './components/PlanYourTrip';
import YourTrips from './components/YourTrips';
import ProtectedRoute from './Services/ProtectedRoute';

const App: React.FC = () => {
  // Alapértelmezett érték: light mode, kivéve ha a localStorage-ban dark mode van
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true'; // Ha 'true', akkor dark mode, különben light mode
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    return !!(token && refreshToken);
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };
  // Ref a PopularDestinations szekcióhoz
  const popularDestinationsRef = useRef<HTMLDivElement>(null);

  // Dark mode váltó függvény
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.body.classList.toggle('dark-mode', newMode);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      setIsAuthenticated(!!(token && refreshToken));
    };
  
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  return (
    <Router>
      <div className={`journey-pal-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <NavBar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isAuthenticated={isAuthenticated}
          onLogout={handleLogout}/>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection scrollToPopularDestinations={() => {
                  if (popularDestinationsRef.current) {
                    popularDestinationsRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }} />
                <PopularDestinations ref={popularDestinationsRef} />
                <PressRecommendations />
                <Stats />
                <Footer />
              </>
            }
          />
          {/* <Route path="/checklist" element={<Checklist />} /> */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route element={<ProtectedRoute isAllowed={isAuthenticated} />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/plan/:destinationId" element={<TripPlanner />} />
            <Route path="/plan-your-trip" element={<PlanYourTrip />} />
            <Route path="/trips" element={<YourTrips />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;